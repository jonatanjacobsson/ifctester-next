import config from '../../../config.json';

let pyodide = null;

export async function init(pdide) {
    pyodide = pdide;

    // Load Python API bindings
    await pyodide.runPythonAsync(`
        from pyodide.http import pyfetch
        response = await pyfetch("${config.wasm.api_py_url}")
        with open("api.py", "wb") as f:
            f.write(await response.bytes())
    `);
}

export async function getPredefinedTypes(schema, entity) {
    const result = await pyodide.runPythonAsync(`
        from api import get_predefined_types_for_entity
        predef_types = get_predefined_types_for_entity("${schema}", "${entity}")
        predef_types
    `);
    return result.toJs({ dict_converter: Object.fromEntries });
}

export async function getEntityAttributes(schema, entity) {
    const result = await pyodide.runPythonAsync(`
        from api import get_entity_attributes
        attrs = get_entity_attributes("${schema}", "${entity}")
        attrs
    `);
    return result.toJs({ dict_converter: Object.fromEntries });
}

export async function getApplicablePsets(schema, entity, predefinedType = '') {
    const result = await pyodide.runPythonAsync(`
        from api import get_applicable_psets
        psets = get_applicable_psets("${schema}", "${entity}", "${predefinedType}")
        psets
    `);
    return result.toJs({ dict_converter: Object.fromEntries });
}

export async function getMaterialCategories() {
    const result = await pyodide.runPythonAsync(`
        from api import get_material_categories
        materials = get_material_categories()
        materials
    `);
    return result.toJs({ dict_converter: Object.fromEntries });
}

export async function getStandardClassificationSystems() {
    const result = await pyodide.runPythonAsync(`
        from api import get_standard_classification_systems
        systems = get_standard_classification_systems()
        systems
    `);
    return result.toJs({ dict_converter: Object.fromEntries });
}

export async function auditIfc(ifcData, idsData, ifcId, idsId) {
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

// Expose interface
export const API = {
    "getPredefinedTypes": getPredefinedTypes,
    "getEntityAttributes": getEntityAttributes,
    "getApplicablePsets": getApplicablePsets,
    "getMaterialCategories": getMaterialCategories,
    "getStandardClassificationSystems": getStandardClassificationSystems,
    "auditIfc": auditIfc
};