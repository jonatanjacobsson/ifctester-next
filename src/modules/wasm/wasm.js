/**
 * WASM module
 * Exposes an API that abstracts the underlying WASM thread
 */

import hyperid from "hyperid";
import EventEmitter from "eventemitter3";

// Message types
export const MessageType = {
    // Initialize the WASM module
    INIT: 'init',

    // API call
    API_CALL: 'api_call',

    // Ready to serve API calls
    READY: 'ready',

    // API response
    API_RESPONSE: 'api_response',

    // Error
    ERROR: 'error',

    // WASM module disposed
    DISPOSED: 'disposed'
};

class WASMModule extends EventEmitter {
    id = hyperid();
    ready = false;
    worker = null;
    pendingMessages = new Map();

    async init() {
        if (this.ready === true) return;
        else if (this.ready instanceof Promise) return this.ready;

        this.worker = new Worker(new URL('./worker/worker.js', import.meta.url), {type: 'module'});

        this.worker.onmessage = (event) => {
            this._handleWorkerMessage(event.data);
        };

        this.worker.onerror = (error) => {
            console.error('[WASM] Web worker error:', error);
            this._rejectPendingMessages(error);
        };

        this.ready = new Promise(async (resolve, reject) => {
            try {
                await this._sendMessage(MessageType.INIT);
                resolve(true);
            } catch (error) {
                console.error('[WASM] Failed to initialize:', error);
                this.ready = false;
                reject(error);
            }
        });

        return this.ready;
    }

    async _sendMessage(type, payload = {}) {
        if (!this.worker) throw new Error('Worker not initialized');

        const id = this.id();

        return new Promise((resolve, reject) => {
            this.pendingMessages.set(id, { resolve, reject });
            
            this.worker.postMessage({
                type,
                payload,
                id
            });
        });
    }

    _handleWorkerMessage({ type, payload, id }) {
        const pendingMessage = this.pendingMessages.get(id);
        
        if (!pendingMessage) {
            console.warn('[WASM] Received response for unknown message ID:', id);
            return;
        }

        this.pendingMessages.delete(id);
        const { resolve, reject } = pendingMessage;

        switch (type) {
            case MessageType.READY:
                this.emit(MessageType.READY);
                resolve();
                break;
            case MessageType.API_RESPONSE:
                resolve(payload);
                break;
            case MessageType.ERROR:
                reject(new Error(payload.message));
                break;
            default:
                console.warn('[WASM] Unknown message type:', type);
                reject(new Error(`Unknown message type: ${type}`));
        }
    }

    _rejectPendingMessages(error) {
        for (const { reject } of this.pendingMessages.values()) {
            reject(error);
        }
        this.pendingMessages.clear();
    }

    async _apiCall(method, ...args) {
        if (!this.ready) await this.init();

        const result = await this._sendMessage(MessageType.API_CALL, { method, args });
        return result;
    }

    /**
     * Get predefined types for a given IFC entity
     * @param {string} schema - IFC schema (e.g., 'IFC4', 'IFC2X3')
     * @param {string} entity - Entity name (e.g., 'IfcWall')
     * @returns {Promise<string[]>} Array of predefined type names
     */
    async getPredefinedTypes(schema, entity) {
        return this._apiCall('getPredefinedTypes', schema, entity);
    }

    /**
     * Get all attributes for a given IFC entity
     * @param {string} schema - IFC schema (e.g., 'IFC4', 'IFC2X3')
     * @param {string} entity - Entity name (e.g., 'IfcWall')
     * @returns {Promise<Object[]>} Array of attribute objects
     */
    async getEntityAttributes(schema, entity) {
        return this._apiCall('getEntityAttributes', schema, entity);
    }

    /**
     * Get applicable property sets for a given IFC entity
     * @param {string} schema - IFC schema (e.g., 'IFC4', 'IFC2X3')
     * @param {string} entity - Entity name (e.g., 'IfcWall')
     * @param {string} [predefinedType] - Optional predefined type
     * @returns {Promise<string[]>} Array of applicable property set names
     */
    async getApplicablePsets(schema, entity, predefinedType = '') {
        return this._apiCall('getApplicablePsets', schema, entity, predefinedType);
    }

    /**
     * Get standard material categories
     * @returns {Promise<string[]>} Array of material category names
     */
    async getMaterialCategories() {
        return this._apiCall('getMaterialCategories');
    }

    /**
     * Get standard classification systems
     * @returns {Promise<Object>} Object mapping classification system names to their configurations
     */
    async getStandardClassificationSystems() {
        return this._apiCall('getStandardClassificationSystems');
    }

    /**
     * Audit an IFC file against IDS specifications
     * @param {Uint8Array|ArrayBuffer} ifcData - IFC file data
     * @param {Uint8Array|ArrayBuffer} idsData - IDS file data
     * @param {string} ifcId - IFC file identifier
     * @param {string} idsId - IDS file identifier
     * @returns {Promise<Object>} Audit report as JSON
     */
    async auditIfc(ifcData, idsData, ifcId, idsId) {
        const ifcBytes = ifcData instanceof ArrayBuffer ? new Uint8Array(ifcData) : ifcData;
        const idsBytes = idsData instanceof ArrayBuffer ? new Uint8Array(idsData) : idsData;

        return this._apiCall('auditIfc', Array.from(ifcBytes), Array.from(idsBytes), ifcId, idsId);
    }

    // IDS API Methods

    /**
     * Create a new IDS instance
     * @param {Object} options - IDS creation options
     * @param {string} [options.title="Untitled"] - IDS title
     * @param {string} [options.copyright=null] - Copyright information
     * @param {string} [options.version=null] - Version
     * @param {string} [options.description=null] - Description
     * @param {string} [options.author=null] - Author
     * @param {string|Date} [options.date=null] - Date
     * @param {string} [options.purpose=null] - Purpose
     * @param {string} [options.milestone=null] - Milestone
     * @returns {Promise<number>} IDS instance ID
     */
    async createIDS(options = {}) {
        return this._apiCall('createIDS', options);
    }

    /**
     * Add a specification to an IDS instance
     * @param {number} idsId - IDS instance ID
     * @param {Object} options - Specification options
     * @param {string} [options.name="Unnamed"] - Specification name
     * @param {number} [options.minOccurs=0] - Minimum occurrences
     * @param {number|string} [options.maxOccurs="unbounded"] - Maximum occurrences
     * @param {string} [options.ifcVersion=null] - IFC version
     * @param {string} [options.identifier=null] - Identifier
     * @param {string} [options.description=null] - Description
     * @param {string} [options.instructions=null] - Instructions
     * @param {string} [options.usage="required"] - Usage type
     * @returns {Promise<number>} Specification index
     */
    async addSpecification(idsId, options = {}) {
        return this._apiCall('addSpecification', idsId, options);
    }

    /**
     * Create an entity facet
     * @param {Object} options - Entity facet options
     * @param {string} [options.name="IFCWALL"] - Entity name
     * @param {string} [options.predefinedType=null] - Predefined type
     * @param {string} [options.instructions=null] - Instructions
     * @returns {Promise<Object>} Entity facet instance ID
     */
    async createEntityFacet(options = {}) {
        return this._apiCall('createEntityFacet', options);
    }

    /**
     * Create an attribute facet
     * @param {Object} options - Attribute facet options
     * @param {string} [options.name="Name"] - Attribute name
     * @param {string} [options.value=null] - Attribute value
     * @param {string} [options.cardinality="required"] - Cardinality
     * @param {string} [options.instructions=null] - Instructions
     * @returns {Promise<Object>} Attribute facet instance ID
     */
    async createAttributeFacet(options = {}) {
        return this._apiCall('createAttributeFacet', options);
    }

    /**
     * Create a property facet
     * @param {Object} options - Property facet options
     * @param {string} [options.propertySet=null] - Property set name
     * @param {string} [options.baseName=null] - Base name
     * @param {string} [options.value=null] - Property value
     * @param {string} [options.cardinality="required"] - Cardinality
     * @param {string} [options.instructions=null] - Instructions
     * @returns {Promise<Object>} Property facet instance ID
     */
    async createPropertyFacet(options = {}) {
        return this._apiCall('createPropertyFacet', options);
    }

    /**
     * Create a material facet
     * @param {Object} options - Material facet options
     * @param {string} [options.value=null] - Material value
     * @param {string} [options.cardinality="required"] - Cardinality
     * @param {string} [options.instructions=null] - Instructions
     * @returns {Promise<Object>} Material facet instance ID
     */
    async createMaterialFacet(options = {}) {
        return this._apiCall('createMaterialFacet', options);
    }

    /**
     * Create a classification facet
     * @param {Object} options - Classification facet options
     * @param {string} [options.system=null] - Classification system
     * @param {string} [options.value=null] - Classification value
     * @param {string} [options.cardinality="required"] - Cardinality
     * @param {string} [options.instructions=null] - Instructions
     * @returns {Promise<Object>} Classification facet instance ID
     */
    async createClassificationFacet(options = {}) {
        return this._apiCall('createClassificationFacet', options);
    }

    /**
     * Create a part-of facet
     * @param {Object} options - Part-of facet options
     * @param {string} [options.entity=null] - Entity name
     * @param {string} [options.cardinality="required"] - Cardinality
     * @param {string} [options.instructions=null] - Instructions
     * @returns {Promise<Object>} Part-of facet instance ID
     */
    async createPartOfFacet(options = {}) {
        return this._apiCall('createPartOfFacet', options);
    }

    /**
     * Add applicability facet to a specification
     * @param {number} idsId - IDS instance ID
     * @param {number} specId - Specification ID
     * @param {number} facetId - Facet ID
     * @returns {Promise<boolean>} Success status
     */
    async addApplicability(idsId, specId, facetId) {
        return this._apiCall('addApplicability', idsId, specId, facetId);
    }

    /**
     * Add requirement facet to a specification
     * @param {number} idsId - IDS instance ID
     * @param {number} specId - Specification ID
     * @param {number} facetId - Facet ID
     * @returns {Promise<boolean>} Success status
     */
    async addRequirement(idsId, specId, facetId) {
        return this._apiCall('addRequirement', idsId, specId, facetId);
    }

    /**
     * Validate an IDS instance
     * @param {number} idsId - IDS instance ID
     * @returns {Promise<boolean>} Validation result
     */
    async validateIDS(idsId) {
        return this._apiCall('validateIDS', idsId);
    }

    /**
     * Export IDS instance to XML string
     * @param {number} idsId - IDS instance ID
     * @returns {Promise<string>} IDS XML string
     */
    async exportIDS(idsId) {
        return this._apiCall('exportIDS', idsId);
    }

    /**
     * Cleanup resources
     */
    dispose() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        this.ready = false;
        this._rejectPendingMessages(new Error('WASM module disposed'));
        this.emit(MessageType.DISPOSED);
    }
}

// Export singleton instance
const wasm = new WASMModule();

export const {
    init,
    getPredefinedTypes,
    getEntityAttributes,
    getApplicablePsets,
    getMaterialCategories,
    getStandardClassificationSystems,
    auditIfc,
    createIDS,
    addSpecification,
    createEntityFacet,
    createAttributeFacet,
    createPropertyFacet,
    createMaterialFacet,
    createClassificationFacet,
    createPartOfFacet,
    addApplicability,
    addRequirement,
    validateIDS,
    exportIDS,
    dispose
} = wasm;

export default wasm;