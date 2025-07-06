/**
 * IDS module
 */

import hyperid from "hyperid";

let pyodide = null;
let id = hyperid();

// IDS Python classes
let Ids, Specification;
let Entity, Attribute, Property, Material, Classification, PartOf;

const Instances = {
    ids: new Map(),
    specifications: new Map(),
    facets: new Map(),
};

export async function init(pdide) {
    pyodide = pdide;
    
    await pyodide.loadPackagesFromImports(`
        import ifctester.ids
        import ifctester.facet
    `);

    // Import the core IDS classes
    Ids = pyodide.pyimport("ifctester.ids").Ids;
    Specification = pyodide.pyimport("ifctester.ids").Specification;
    
    // Import facet classes
    Entity = pyodide.pyimport("ifctester.facet").Entity;
    Attribute = pyodide.pyimport("ifctester.facet").Attribute;
    Property = pyodide.pyimport("ifctester.facet").Property;
    Material = pyodide.pyimport("ifctester.facet").Material;
    Classification = pyodide.pyimport("ifctester.facet").Classification;
    PartOf = pyodide.pyimport("ifctester.facet").PartOf;
}

export function createIDS({title = "Untitled", copyright = null, version = null, description = null, author = null, date = null, purpose = null, milestone = null}) {
    const ids_raw = Ids.callKwargs({
        title: title,
        copyright: copyright,
        version: version,
        description: description,
        author: author,
        date: formatDate(date),
        purpose: purpose,
        milestone: milestone
    });
    const ids_id = id();
    Instances.ids.set(ids_id, ids_raw);
    return ids_id;
}

export function validateIDS(ids_id) {
    const ids_raw = Instances.ids.get(ids_id);
    const tempFilename = `temp_${Date.now()}.xml`;
    const isValid = ids_raw.to_xml(tempFilename); // to_xml validates the XML as well, as far as I understand
  
    pyodide.runPython(`
        import os
        if os.path.exists("${tempFilename}"):
            os.remove("${tempFilename}")
    `);
    
    return isValid;
}

export function exportIDS(ids_id) {
    const ids_raw = Instances.ids.get(ids_id);
    return ids_raw.to_string();
}

export function addSpecification(ids_id, {name = "Unnamed", minOccurs = 0, maxOccurs = "unbounded", ifcVersion = null, identifier = null, description = null, instructions = null, usage = "required"}) {
    const ids_raw = Instances.ids.get(ids_id);
    const spec = Specification.callKwargs({
        name: name,
        minOccurs: minOccurs,
        maxOccurs: maxOccurs,
        ifcVersion: ifcVersion,
        identifier: identifier,
        description: description,
        instructions: instructions
    });
    spec.set_usage(usage);
    ids_raw.specifications.append(spec);
    return ids_raw.specifications.toJs().length - 1;
}

export function createEntityFacet({name = "IFCWALL", predefinedType = null, instructions = null}) {
    const entity_id = id();
    const entity = Entity.callKwargs({
        name: name,
        predefinedType: predefinedType,
        instructions: instructions
    });
    Instances.facets.set(entity_id, entity);
    return entity_id;
}

export function createAttributeFacet({name = "Name", value = null, cardinality = "required", instructions = null}) {
    const attribute_id = id();
    const attribute = Attribute.callKwargs({
        name: name,
        value: value,
        cardinality: cardinality,
        instructions: instructions
    });
    Instances.facets.set(attribute_id, attribute);
    return attribute_id;
}

export function addApplicability(ids_id, spec_id, facet_id) {
    const ids_raw = Instances.ids.get(ids_id);
    const spec = ids_raw.specifications[spec_id];
    const facet = Instances.facets.get(facet_id);
    spec.applicability.append(facet);
}

export function addRequirement(ids_id, spec_id, facet_id) {
    const ids_raw = Instances.ids.get(ids_id);
    const spec = ids_raw.specifications[spec_id];
    const facet = Instances.facets.get(facet_id);
    spec.requirements.append(facet);
}

// Helper function to convert date to ISO format string
export function formatDate(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

// Expose interface
export const API = {
    "createIDS": createIDS,
    "validateIDS": validateIDS,
    "exportIDS": exportIDS,
    "addSpecification": addSpecification,
    "createEntityFacet": createEntityFacet,
    "createAttributeFacet": createAttributeFacet,
    "addApplicability": addApplicability,
    "addRequirement": addRequirement
};