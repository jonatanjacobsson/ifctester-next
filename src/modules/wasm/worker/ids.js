/**
 * IDS module
 */

let pyodide = null;

// IDS Python classes
let Ids, Specification;
let Entity, Attribute, Property, Material, Classification, PartOf;

// const Instances = {
//     ids: new Map(),
//     specifications: new Map(),
//     facets: new Map(),
// };

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

function _idsToInstance(idsObj) {
    const ids_raw = Ids();
    return ids_raw.parse(pyodide.toPy(idsObj))
}

export function createIDS() {
    const ids_raw = Ids()
    return ids_raw.asdict().toJs({dict_converter: Object.fromEntries});
}

export function openIDS(ids_xml, validate = false) {
    const from_string = pyodide.pyimport("ifctester.ids").from_string;
    const ids_raw = from_string(ids_xml, validate);

    return ids_raw.asdict().toJs({dict_converter: Object.fromEntries});
}

// export function editIDS(ids_id, {title = null, copyright = null, version = null, description = null, author = null, date = null, purpose = null, milestone = null}) {
//     const ids_raw = Instances.ids.get(ids_id);
//     if (title) ids_raw.info.title = title;
//     if (copyright) ids_raw.info.copyright = copyright;
//     if (version) ids_raw.info.version = version;
//     if (description) ids_raw.info.description = description;
//     if (author) ids_raw.info.author = author;
//     if (date) ids_raw.info.date = formatDate(date);
//     if (purpose) ids_raw.info.purpose = purpose;
//     if (milestone) ids_raw.info.milestone = milestone;
// }

// export function deleteIDS(ids_id) {
//     Instances.ids.delete(ids_id);
// }

export function validateIDS(idsObj) {
    const ids_raw = _idsToInstance(idsObj)
    const tempFilename = `temp_${Date.now()}.xml`;
    const isValid = ids_raw.to_xml(tempFilename); // to_xml validates the XML as well, as far as I understand
  
    pyodide.runPython(`
        import os
        if os.path.exists("${tempFilename}"):
            os.remove("${tempFilename}")
    `);
    
    return isValid;
}

export function exportIDS(idsObj) {
    const ids_raw = _idsToInstance(idsObj)
    return ids_raw.to_string();
}

export function createSpecification({name = "Unnamed", ifcVersion = ["IFC2X3", "IFC4", "IFC4X3_ADD2"], identifier = null, description = null, instructions = null, usage = "required"}) {
    const spec = Specification.callKwargs({
        name: name,
        ifcVersion: ifcVersion,
        identifier: identifier,
        description: description,
        instructions: instructions
    });
    spec.set_usage(usage);

    return spec.asdict().toJs({dict_converter: Object.fromEntries});
}

// export function editSpecification(spec_id, {name = null, ifcVersion = null, identifier = null, description = null, instructions = null, usage = null}) {
//     const spec = Instances.specifications.get(spec_id);
//     if (name) spec.name = name;
//     if (ifcVersion) spec.ifcVersion = ifcVersion;
//     if (identifier) spec.identifier = identifier;
//     if (description) spec.description = description;
//     if (instructions) spec.instructions = instructions;
//     if (usage) spec.set_usage(usage);
// }

// export function deleteSpecification(spec_id) {
//     Instances.specifications.delete(spec_id);
// }

// export function addSpecificationIDS(ids_id, spec_id) {
//     const ids = Instances.ids.get(ids_id);
//     const spec = Instances.specifications.get(spec_id);
//     ids.specifications.append(spec);
// }

// export function removeSpecificationIDS(ids_id, spec_id) {
//     const ids = Instances.ids.get(ids_id);
//     const spec = Instances.specifications.get(spec_id);
//     ids.specifications.remove(spec);
// }

// export function editFacet(facet_id, props) {
//     const facet = Instances.facets.get(facet_id);
//     for (const [key, value] of Object.entries(props)) {
//         if (value !== null) {
//             facet[key] = value;
//         }
//     }
// }

// @instructions
export function createEntityFacet(clause, {name = "IFCWALL", predefinedType = null, instructions = null}) {
    const entity = Entity.callKwargs({
        name: name,
        predefinedType: predefinedType,
        instructions: instructions
    });
    return entity.asdict(clause).toJs({dict_converter: Object.fromEntries});
}

// @cardinality, @instructions
export function createAttributeFacet(clause, {name = "Name", value = null, cardinality = "required", instructions = null}) {
    const attribute = Attribute.callKwargs({
        name: name,
        value: value,
        cardinality: cardinality,
        instructions: instructions
    });
    return attribute.asdict(clause).toJs({dict_converter: Object.fromEntries});
}

// @uri, @cardinality, @instructions
export function createClassificationFacet(clause, {value = null, system = null, uri = null, cardinality = "required", instructions = null}) {
    const classification = Classification.callKwargs({
        value: value,
        system: system,
        uri: uri,
        cardinality: cardinality,
        instructions: instructions
    });
    return classification.asdict(clause).toJs({dict_converter: Object.fromEntries});
}

// @relation, @cardinality, @instructions
export function createPartOfFacet(clause, {name = "IFCWALL", predefinedType = null, relation = null, cardinality = "required", instructions = null}) {
    const part_of = PartOf.callKwargs({
        name: name,
        predefinedType: predefinedType,
        relation: relation,
        cardinality: cardinality,
        instructions: instructions
    });
    return part_of.asdict(clause).toJs({dict_converter: Object.fromEntries});
}

// @dataType, @uri, @cardinality, @instructions
export function createPropertyFacet(clause, {propertySet = "Property_Set", baseName = "propertyName", value = null, dataType = null, uri = null, cardinality = "required", instructions = null}) {
    const property = Property.callKwargs({
        propertySet: propertySet,
        baseName: baseName,
        value: value,
        dataType: dataType,
        uri: uri,
        cardinality: cardinality,
        instructions: instructions
    });
    return property.asdict(clause).toJs({dict_converter: Object.fromEntries});
}

// @uri, @cardinality, @instructions
export function createMaterialFacet(clause, {value = null, uri = null, cardinality = "required", instructions = null}) {
    const material = Material.callKwargs({
        value: value,
        uri: uri,
        cardinality: cardinality,
        instructions: instructions
    });
    return material.asdict(clause).toJs({dict_converter: Object.fromEntries});
}

// export function deleteFacet(facet_id) {
//     Instances.facets.delete(facet_id);
// }

// export function addFacet(spec_id, facet_id, type) {
//     const spec = Instances.specifications.get(spec_id);
//     const facet = Instances.facets.get(facet_id);
//     if (type === "applicability") {
//         spec.applicability.append(facet);
//     } else if (type === "requirement") {
//         spec.requirements.append(facet);
//     }
// }

// export function removeFacet(spec_id, facet_id, type) {
//     const spec = Instances.specifications.get(spec_id);
//     const facet = Instances.facets.get(facet_id);
//     if (type === "applicability") {
//         spec.applicability.remove(facet);
//     } else if (type === "requirement") {
//         spec.requirements.remove(facet);
//     }
// }

// Helper function to convert date to ISO format string
export function formatDate(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

// Expose interface
export const API = {
    "createIDS": createIDS,
    "openIDS": openIDS,
    // "editIDS": editIDS,
    "validateIDS": validateIDS,
    "exportIDS": exportIDS,
    // "deleteIDS": deleteIDS,
    "createSpecification": createSpecification,
    // "editSpecification": editSpecification,
    // "deleteSpecification": deleteSpecification,
    // "addSpecificationIDS": addSpecificationIDS,
    // "removeSpecificationIDS": removeSpecificationIDS,
    // "editFacet": editFacet,
    "createEntityFacet": createEntityFacet,
    "createAttributeFacet": createAttributeFacet,
    "createClassificationFacet": createClassificationFacet,
    "createPartOfFacet": createPartOfFacet,
    "createPropertyFacet": createPropertyFacet,
    "createMaterialFacet": createMaterialFacet,
    // "deleteFacet": deleteFacet,
    // "addFacet": addFacet,
    // "removeFacet": removeFacet
};