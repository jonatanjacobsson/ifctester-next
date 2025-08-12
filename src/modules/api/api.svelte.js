import wasm from "$src/modules/wasm";

export let Autocompletions = $state({
    entityClasses: [],
    materialCategories: [],
    classificationSystems: {},
    isLoaded: false
});

// Preload autocompletions on initialization
wasm.init().then(async () => {
    await preloadAutocompletions();
});

export async function preloadAutocompletions() {
    try {
        const schemas = ["IFC2X3", "IFC4"]; // TODO: IFC4X3 is excluded for now because of an error
        const entitySets = await Promise.all(
            schemas.map(schema => wasm.getAllEntityClasses(schema))
        );
        
        // Deduplicate entity classes across all schemas
        const allEntities = new Set();
        entitySets.forEach(entities => {
            entities.forEach(entity => allEntities.add(entity));
        });
        
        const [materialCategories, classificationSystems] = await Promise.all([
            wasm.getMaterialCategories(),
            wasm.getStandardClassificationSystems()
        ]);
        
        Autocompletions.entityClasses = Array.from(allEntities).sort();
        Autocompletions.materialCategories = materialCategories;
        Autocompletions.classificationSystems = classificationSystems;
        Autocompletions.isLoaded = true;
        
        console.log('Autocompletions preloaded');
    } catch (error) {
        console.error('Failed to preload autocompletions:', error);
    }
}

export async function getPredefinedTypes(schema, entity) {
    return await wasm.getPredefinedTypes(schema, entity);
}

export async function getEntityAttributes(schema, entity) {
    return await wasm.getEntityAttributes(schema, entity);
}

export async function getApplicablePsets(schema, entity, predefinedType = '') {
    return await wasm.getApplicablePsets(schema, entity, predefinedType);
}

export function getEntityClasses() {
    return Autocompletions.entityClasses;
}

export function getMaterialCategories() {
    return Autocompletions.materialCategories;
}

export function getClassificationSystems() {
    return Autocompletions.classificationSystems;
}