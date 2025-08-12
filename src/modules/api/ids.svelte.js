import wasm from "$src/modules/wasm";
import hyperid from "hyperid";

export let Module = $state({
    documents: [],
    activeDocument: null,
    status: "loading"
});

// Initialize module
wasm.init().then(() => {
    Module.status = "ready";
}).catch((error) => {
    Module.status = "error";
});

const id = hyperid()

export async function createDocument() {
    const docId = id();
    const doc = await wasm.createIDS();

    Module.documents[docId] = doc;

    // Set as active document
    Module.activeDocument = {
        id: docId,
        specification: null
    };
}

export async function deleteDocument(id) {
    delete Module.documents[id];

    if (Module.activeDocument.id == id) {
        Module.activeDocument = null;
    }
}

// Normalize (remove xs: prefix) from JSON dict returned from Python
// We need this because the backend exports with xs: prefix, yet expects a dict without prefixes.
function normalizeIdsDict(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
        return obj.map(normalizeIdsDict);
    }
    
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (key === 'xs:restriction' && Array.isArray(value) && value.length > 0) {
            // Convert xs:restriction array to restriction object
            const restriction = value[0];
            const newRestriction = {};
            
            for (const [restrictionKey, restrictionValue] of Object.entries(restriction)) {
                if (restrictionKey.startsWith('xs:')) {
                    // Remove xs: prefix from keys
                    const newKey = restrictionKey.replace('xs:', '');
                    newRestriction[newKey] = restrictionValue;
                } else {
                    newRestriction[restrictionKey] = restrictionValue;
                }
            }
            
            result['restriction'] = newRestriction;
        } else {
            result[key] = normalizeIdsDict(value);
        }
    }
    
    return result;
}

export async function openDocument() {
    return new Promise((resolve, reject) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.ids,.xml';
        
        fileInput.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) {
                reject(new Error('No file selected'));
                return;
            }
            
            try {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const fileContent = e.target.result;
                        const doc = normalizeIdsDict(await wasm.openIDS(fileContent, false));
                        const docId = id();

                        // Add document to list and set as active
                        Module.documents[docId] = doc;
                        Module.activeDocument = {
                            id: docId,
                            specification: null
                        };

                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = () => reject(new Error('Failed to read IDS file'));
                reader.readAsText(file);
            } catch (error) {
                reject(error);
            }
        };
        
        fileInput.oncancel = () => {
            reject(new Error('File selection cancelled'));
        };
        
        // Trigger the file dialog
        fileInput.click();
    });
}

export async function exportDocument(docId) {
    const doc = $state.snapshot(Module.documents[docId]);

    // Validate
    if (doc.specifications.specification.length < 1) {
        alert("Please create at least one specification before exporting the document.");
        return;
    }

    const xmlString = await wasm.exportIDS(doc);
    
    // Create and download file
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${Module.documents[docId].info.title.replace(/[^a-zA-Z0-9]/g, '_')}.ids`;
    a.click();
    URL.revokeObjectURL(url);
}

export async function createSpecification(docId) {
    const spec = await wasm.createSpecification();

    // Add specification to document
    Module.documents[docId].specifications.specification.push(spec);

    // Set as active specification
    if (Module.activeDocument.id == docId) {
        Module.activeDocument.specification = Module.documents[docId].specifications.specification.length - 1;
    }
}

export async function deleteSpecification(docId, specId) {
    Module.documents[docId].specifications.specification.splice(specId, 1);

    if (Module.activeDocument.id == docId && Module.activeDocument.specification == specId) {
        Module.activeDocument.specification = null;
    }
}

/**
 * clause: "applicability", "requirements"
 * facet: "entity", "attribute", "classification", "partOf", "property", "material"
*/
export async function createFacet(docId, specId, clause, facet) {
    let facetObj;
    if (facet == "entity") {
        facetObj = await wasm.createEntityFacet(clause, {});
    } else if (facet == "attribute") {
        facetObj = await wasm.createAttributeFacet(clause, {});
    } else if (facet == "classification") {
        facetObj = await wasm.createClassificationFacet(clause, {});
    } else if (facet == "partOf") {
        facetObj = await wasm.createPartOfFacet(clause, {});
    } else if (facet == "property") {
        facetObj = await wasm.createPropertyFacet(clause, {});
    } else if (facet == "material") {
        facetObj = await wasm.createMaterialFacet(clause, {});
    }

    if (!(facet in Module.documents[docId].specifications.specification[specId][clause])) {
        Module.documents[docId].specifications.specification[specId][clause][facet] = [];
    }

    Module.documents[docId].specifications.specification[specId][clause][facet].push(facetObj);
}

export async function deleteFacet(docId, specId, clause, facet, facetId) {
    delete Module.documents[docId].specifications.specification[specId][clause][facet][facetId];
}