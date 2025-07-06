/**
 * WASM worker
*/

import { MessageType } from '../wasm';
import config from '../../../config.json';
import * as IDS from './ids';

let pyodide = null;
let ready = false;

self.addEventListener('message', async (event) => {
    const { type, payload, id } = event.data;

    try {
        switch (type) {
            case MessageType.INIT:
                await initializePyodide();
                self.postMessage({
                    type: MessageType.READY,
                    payload: { success: true },
                    id
                });
                break;

            case MessageType.API_CALL:
                if (!ready) {
                    throw new Error('Pyodide not initialized');
                }
                const result = await handleApiCall(payload);
                self.postMessage({
                    type: MessageType.API_RESPONSE,
                    payload: result,
                    id
                });
                break;

            default:
                throw new Error(`Unknown message type: ${type}`);
        }
    } catch (error) {
        self.postMessage({
            type: MessageType.ERROR,
            payload: {
                message: error.message,
                stack: error.stack
            },
            id
        });
    }
});

async function initializePyodide() {
    if (ready) return;

    // Load Pyodide
    const { loadPyodide } = await import('https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide.mjs');
    pyodide = await loadPyodide({
        convertNullToNone: true
    });

    // Load required packages
    await pyodide.loadPackage('micropip');
    await pyodide.loadPackage('numpy');

    const micropip = pyodide.pyimport('micropip');

    // Install IfcOpenShell wheel
    await micropip.install(config.wasm.wheel_url);

    // Install IfcTester dependencies
    await micropip.install(config.wasm.odfpy_url);
    await pyodide.loadPackage("shapely");

    // Install IfcTester
    await micropip.install('ifctester');

    // Load API module
    await pyodide.runPythonAsync(`
        from pyodide.http import pyfetch
        response = await pyfetch("${config.wasm.api_py_url}")
        with open("api.py", "wb") as f:
            f.write(await response.bytes())
    `);

    // Load IDS modules
    await pyodide.loadPackagesFromImports(`
        import ifctester.ids
        import ifctester.facet
    `);

    // Initialize IDS module
    await IDS.init(pyodide);

    console.log("[worker] Environment initialized");

    ready = true;
}

async function handleApiCall({ method, args = [] }) {
    console.log("[worker] Handling API call:", method, args);

    switch (method) {
        case 'getPredefinedTypes':
            return await getPredefinedTypes(...args);
        case 'getEntityAttributes':
            return await getEntityAttributes(...args);
        case 'getApplicablePsets':
            return await getApplicablePsets(...args);
        case 'getMaterialCategories':
            return await getMaterialCategories();
        case 'getStandardClassificationSystems':
            return await getStandardClassificationSystems();
        case 'auditIfc':
            return await auditIfc(...args);
        case 'createIDS':
            return IDS.createIDS(...args);
        case 'addSpecification':
            return IDS.addSpecification(...args);
        case 'createEntityFacet':
            return IDS.createEntityFacet(...args);
        case 'createAttributeFacet':
            return IDS.createAttributeFacet(...args);
        // case 'createPropertyFacet':
        //     return await IDS.createPropertyFacet(...args);
        // case 'createMaterialFacet':
        //     return await IDS.createMaterialFacet(...args);
        // case 'createClassificationFacet':
        //     return await IDS.createClassificationFacet(...args);
        // case 'createPartOfFacet':
        //     return await IDS.createPartOfFacet(...args);
        case 'addApplicability':
            return IDS.addApplicability(...args);
        case 'addRequirement':
            return IDS.addRequirement(...args);
        case 'validateIDS':
            return IDS.validateIDS(...args);
        case 'exportIDS':
            return IDS.exportIDS(...args);
        default:
            throw new Error(`[worker] Unknown API method: ${method}`);
    }
}

async function getPredefinedTypes(schema, entity) {
    const result = await pyodide.runPythonAsync(`
        from api import get_predefined_types_for_entity
        predef_types = get_predefined_types_for_entity("${schema}", "${entity}")
        predef_types
    `);
    return result.toJs({ dict_converter: Object.fromEntries });
}

async function getEntityAttributes(schema, entity) {
    const result = await pyodide.runPythonAsync(`
        from api import get_entity_attributes
        attrs = get_entity_attributes("${schema}", "${entity}")
        attrs
    `);
    return result.toJs({ dict_converter: Object.fromEntries });
}

async function getApplicablePsets(schema, entity, predefinedType = '') {
    const result = await pyodide.runPythonAsync(`
        from api import get_applicable_psets
        psets = get_applicable_psets("${schema}", "${entity}", "${predefinedType}")
        psets
    `);
    return result.toJs({ dict_converter: Object.fromEntries });
}

async function getMaterialCategories() {
    const result = await pyodide.runPythonAsync(`
        from api import get_material_categories
        materials = get_material_categories()
        materials
    `);
    return result.toJs({ dict_converter: Object.fromEntries });
}

async function getStandardClassificationSystems() {
    const result = await pyodide.runPythonAsync(`
        from api import get_standard_classification_systems
        systems = get_standard_classification_systems()
        systems
    `);
    return result.toJs({ dict_converter: Object.fromEntries });
}

async function auditIfc(ifcData, idsData, ifcId, idsId) {
    // Write files to Pyodide filesystem
    const ifcPath = `/tmp/${ifcId}.ifc`;
    const idsPath = `/tmp/${idsId}.ids`;
    
    pyodide.FS.writeFile(ifcPath, new Uint8Array(ifcData));
    pyodide.FS.writeFile(idsPath, new Uint8Array(idsData));

    const result = await pyodide.runPythonAsync(`
        import ifcopenshell
        import ifctester
        import ifctester.reporter
        import os

        specs = ifctester.open("${idsPath}")
        ifc = ifcopenshell.open("${ifcPath}")

        specs.validate(ifc)
        os.remove("${ifcPath}")
        os.remove("${idsPath}")

        engine = ifctester.reporter.Json(specs)
        engine.report()
        report = engine.to_string()
        report
    `);

    return JSON.parse(result);
}