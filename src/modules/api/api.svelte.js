import wasm from "$src/modules/wasm";

export let Autocompletions = $state({
    entityClasses: [],
    materialCategories: [],
    classificationSystems: {},
    isLoaded: false
});

export let IFCModels = $state({
    models: [],
    isLoading: false
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

export async function loadIfcModel(file) {
    try {
        IFCModels.isLoading = true;
        
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Load IFC model
        const ifcId = await wasm.loadIfc(Array.from(uint8Array));
        
        // Add to models list
        const model = {
            id: ifcId,
            fileName: file.name,
            fileSize: file.size,
            loadedAt: new Date()
        };
        IFCModels.models = [...IFCModels.models, model];
        
        console.log(`IFC model "${file.name}" loaded with ID: ${ifcId}`);
        return model;
    } catch (error) {
        console.error('Failed to load IFC model:', error);
        throw error;
    } finally {
        IFCModels.isLoading = false;
    }
}

export async function unloadIfcModel(modelId) {
    try {
        // Unload model
        await wasm.unloadIfc(modelId);
        
        // Remove from models list
        IFCModels.models = IFCModels.models.filter(model => model.id !== modelId);
        
        console.log(`IFC model with ID ${modelId} unloaded`);
    } catch (error) {
        console.error('Failed to unload IFC model:', error);
        throw error;
    }
}

export async function auditIfcModel(modelId, idsData) {
    try {
        let idsBytes;
        if (typeof idsData === 'string') {
            idsBytes = new TextEncoder().encode(idsData);
        } else if (idsData instanceof ArrayBuffer) {
            idsBytes = new Uint8Array(idsData);
        } else {
            idsBytes = idsData;
        }
        
        // Run audit
        const auditResult = await wasm.auditIfc(modelId, idsBytes);
        
        console.log(`Audit completed for model ${modelId}`);
        return auditResult;
    } catch (error) {
        console.error('Failed to audit IFC model:', error);
        throw error;
    }
}

export function getLoadedModels() {
    return IFCModels.models;
}

export function getModelById(modelId) {
    return IFCModels.models.find(model => model.id === modelId);
}