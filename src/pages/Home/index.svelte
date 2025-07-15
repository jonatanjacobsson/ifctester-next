<script>
    import * as IDS from "$src/modules/api/ids.svelte.js";
    import AppHeader from "$src/components/AppHeader.svelte";
    import AppRibbon from "$src/components/AppRibbon.svelte";
    import AppToolbar from "$src/components/AppToolbar.svelte";
    import IdsTabs from "$src/components/IdsTabs.svelte";
    import {onMount} from "svelte";

    let selectedTab = $state('info');
    
    // Reactive getters for current document and specification with null safety
    let currentDoc = $derived(IDS.Module.activeDocument ? IDS.Module.documents[IDS.Module.activeDocument.id] : null);
    let currentSpec = $derived(currentDoc && IDS.Module.activeDocument?.specification !== null && currentDoc.specifications?.specification ? 
        currentDoc.specifications.specification[IDS.Module.activeDocument.specification] : null);
    
    // Safe accessors with reactive setters
    let docTitle = $derived.by(() => currentDoc?.info.title ?? "");
    let docAuthor = $derived.by(() => currentDoc?.info.author ?? "");
    let docVersion = $derived.by(() => currentDoc?.info.version ?? "");
    let docDate = $derived.by(() => currentDoc?.info.date ?? "");
    let docDescription = $derived.by(() => currentDoc?.info.description ?? "");
    let docPurpose = $derived.by(() => currentDoc?.info.purpose ?? "");
    let docMilestone = $derived.by(() => currentDoc?.info.milestone ?? "");
    let docCopyright = $derived.by(() => currentDoc?.info.copyright ?? "");
    
    let specName = $derived.by(() => currentSpec?.name ?? "");
    let specIdentifier = $derived.by(() => currentSpec?.identifier ?? "");
    let specUsage = $derived.by(() => currentSpec?.usage ?? "required");
    let specDescription = $derived.by(() => currentSpec?.description ?? "");
    let specInstructions = $derived.by(() => currentSpec?.instructions ?? "");
    
    function setDocProperty(prop, value) {
        if (currentDoc) {
            currentDoc.info[prop] = value;
        }
    }
    
    function setSpecProperty(prop, value) {
        if (currentSpec) {
            currentSpec[prop] = value;
        }
    }
    
    async function addNewSpecification() {
        if (!IDS.Module.activeDocument) return;
        await IDS.createSpecification(IDS.Module.activeDocument.id);
    }
    
    function selectSpecification(index) {
        if (IDS.Module.activeDocument) {
            IDS.Module.activeDocument.specification = index;
        }
    }
    
    async function deleteSpecification(specIndex) {
        if (!IDS.Module.activeDocument) return;
        await IDS.deleteSpecification(IDS.Module.activeDocument.id, specIndex);
    }
    
    async function addRestriction(facetType) {
        if (!IDS.Module.activeDocument || IDS.Module.activeDocument.specification === null) return;
        
        const clause = selectedTab === 'applicability' ? 'applicability' : 'requirements';
        await IDS.createFacet(
            IDS.Module.activeDocument.id, 
            IDS.Module.activeDocument.specification, 
            clause, 
            facetType
        );
    }
    
    function removeRestriction(facetIndex) {
        if (!currentSpec) return;
        
        const clause = selectedTab === 'applicability' ? 'applicability' : 'requirements';
        const facetType = Object.keys(currentSpec[clause])[Math.floor(facetIndex / Object.keys(currentSpec[clause]).length)];
        
        currentSpec[clause][facetType].splice(facetIndex % currentSpec[clause][facetType].length, 1);
    }
    
    async function exportIDS() {
        if (!IDS.Module.activeDocument) {
            alert('No document to export.');
            return;
        }
        
        try {
            await IDS.exportDocument(IDS.Module.activeDocument.id);
        } catch (error) {
            console.error('Error exporting IDS:', error);
            alert('Error exporting IDS: ' + error.message);
        }
    }
</script>

<div class="app">
    <AppHeader />
    <div class="main-body">
        <AppToolbar />
        <div class="main-content">
            {#if Object.keys(IDS.Module.documents).length > 0}
                <IdsTabs />
            {/if}
            <div class="ids-builder">
                {#if IDS.Module.activeDocument}
                    <div class="ids-sidebar">
                        <div class="sidebar-header">
                            <h3>Specifications</h3>
                            <button class="cta-btn" onclick={addNewSpecification}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="specifications-list">
                            <div class="spec-item" class:active={IDS.Module.activeDocument?.specification === null} onclick={() => { if (IDS.Module.activeDocument) IDS.Module.activeDocument.specification = null; }}>
                                <span class="spec-icon">📋</span>
                                <span class="spec-name">{currentDoc?.info.title || "New IDS"}</span>
                            </div>
                            {#if currentDoc?.specifications?.specification}
                                {#each currentDoc.specifications.specification as spec, index}
                                    <div class="spec-item" class:active={IDS.Module.activeDocument?.specification === index} onclick={() => selectSpecification(index)}>
                                        <span class="spec-icon">📄</span>
                                        <span class="spec-name">{spec.name || "Specification " + (index + 1)}</span>
                                        <button class="btn-delete" onclick={() => deleteSpecification(index)}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M18 6L6 18M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                {/each}
                            {/if}
                        </div>
                        <div class="sidebar-actions">
                            <button class="btn full-width" onclick={exportIDS}>Export IDS</button>
                        </div>
                    </div>
                {/if}
                <div class="main-panel" class:full-width={!IDS.Module.activeDocument}>
                    {#if !IDS.Module.activeDocument}
                        <div class="no-document">
                            <h2>No Active Document</h2>
                            <p>Please create or open an existing IDS file.</p>
                        </div>
                    {:else if IDS.Module.activeDocument?.specification === null}
                        <div class="ids-info">
                            <h2>IDS Information</h2>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Title</label>
                                    <input type="text" value={docTitle} oninput={(e) => setDocProperty('title', e.target.value)} placeholder="Enter IDS title">
                                </div>
                                <div class="form-group">
                                    <label>Author</label>
                                    <input type="text" value={docAuthor} oninput={(e) => setDocProperty('author', e.target.value)} placeholder="Enter author">
                                </div>
                                <div class="form-group">
                                    <label>Version</label>
                                    <input type="text" value={docVersion} oninput={(e) => setDocProperty('version', e.target.value)} placeholder="Enter version">
                                </div>
                                <div class="form-group">
                                    <label>Date</label>
                                    <input type="date" value={docDate} oninput={(e) => setDocProperty('date', e.target.value)}>
                                </div>
                                <div class="form-group full-width">
                                    <label>Description</label>
                                    <textarea value={docDescription} oninput={(e) => setDocProperty('description', e.target.value)} placeholder="Enter description" rows="3"></textarea>
                                </div>
                                <div class="form-group">
                                    <label>Purpose</label>
                                    <input type="text" value={docPurpose} oninput={(e) => setDocProperty('purpose', e.target.value)} placeholder="Enter purpose">
                                </div>
                                <div class="form-group">
                                    <label>Milestone</label>
                                    <input type="text" value={docMilestone} oninput={(e) => setDocProperty('milestone', e.target.value)} placeholder="Enter milestone">
                                </div>
                                <div class="form-group full-width">
                                    <label>Copyright</label>
                                    <input type="text" value={docCopyright} oninput={(e) => setDocProperty('copyright', e.target.value)} placeholder="Enter copyright">
                                </div>
                            </div>
                        </div>
                    {:else}
                        <div class="specification-editor">
                            <div class="spec-header">
                                <h2>Specification</h2>
                                <div class="spec-tabs">
                                    <button class="btn tab-btn" class:active={selectedTab === 'info'} onclick={() => selectedTab = 'info'}>Info</button>
                                    <button class="btn tab-btn" class:active={selectedTab === 'applicability'} onclick={() => selectedTab = 'applicability'}>Applicability</button>
                                    <button class="btn tab-btn" class:active={selectedTab === 'requirements'} onclick={() => selectedTab = 'requirements'}>Requirements</button>
                                </div>
                            </div>
                            
                            {#if selectedTab === 'info'}
                                <div class="spec-info">
                                    <div class="form-grid">
                                        <div class="form-group">
                                            <label for="spec-name">Name</label>
                                            <input id="spec-name" type="text" value={specName} oninput={(e) => setSpecProperty('name', e.target.value)} placeholder="Enter specification name">
                                        </div>
                                        <div class="form-group">
                                            <label for="spec-identifier">Identifier</label>
                                            <input id="spec-identifier" type="text" value={specIdentifier} oninput={(e) => setSpecProperty('identifier', e.target.value)} placeholder="Enter identifier">
                                        </div>
                                        <div class="form-group">
                                            <label for="spec-cardinality">Usage</label>
                                            <select id="spec-cardinality" value={specUsage} onchange={(e) => setSpecProperty('usage', e.target.value)}>
                                                <option value="required">Required</option>
                                                <option value="optional">Optional</option>
                                                <option value="prohibited">Prohibited</option>
                                            </select>
                                        </div>
                                        <div class="form-group full-width">
                                            <label>IFC Version</label>
                                            <div class="radio-group">
                                                <label class="radio-label">
                                                    <input type="radio" name="ifcVersion" value="IFC2X3" checked={currentSpec?.ifcVersion?.includes('IFC2X3')} onchange={(e) => { if (currentSpec && e.target.checked) { currentSpec.ifcVersion = ['IFC2X3']; } }}>
                                                    IFC2X3
                                                </label>
                                                <label class="radio-label">
                                                    <input type="radio" name="ifcVersion" value="IFC4" checked={currentSpec?.ifcVersion?.includes('IFC4')} onchange={(e) => { if (currentSpec && e.target.checked) { currentSpec.ifcVersion = ['IFC4']; } }}>
                                                    IFC4
                                                </label>
                                                <label class="radio-label">
                                                    <input type="radio" name="ifcVersion" value="IFC4X3_ADD2" checked={currentSpec?.ifcVersion?.includes('IFC4X3_ADD2')} onchange={(e) => { if (currentSpec && e.target.checked) { currentSpec.ifcVersion = ['IFC4X3_ADD2']; } }}>
                                                    IFC4X3_ADD2
                                                </label>
                                            </div>
                                        </div>
                                        <div class="form-group full-width">
                                            <label for="spec-description">Description</label>
                                            <textarea id="spec-description" value={specDescription} oninput={(e) => setSpecProperty('description', e.target.value)} placeholder="Enter description" rows="3"></textarea>
                                        </div>
                                        <div class="form-group full-width">
                                            <label for="spec-instructions">Instructions</label>
                                            <textarea id="spec-instructions" value={specInstructions} oninput={(e) => setSpecProperty('instructions', e.target.value)} placeholder="Enter instructions" rows="3"></textarea>
                                        </div>
                                    </div>
                                </div>
                            {:else if selectedTab === 'applicability'}
                                <div class="restrictions-panel">
                                    <div class="restrictions-header">
                                        <h3>Applicability</h3>
                                        <div class="restriction-buttons">
                                            <button class="btn-small" onclick={() => addRestriction('entity')}>+ Entity</button>
                                            <button class="btn-small" onclick={() => addRestriction('attribute')}>+ Attribute</button>
                                            <button class="btn-small" onclick={() => addRestriction('property')}>+ Property</button>
                                            <button class="btn-small" onclick={() => addRestriction('material')}>+ Material</button>
                                            <button class="btn-small" onclick={() => addRestriction('classification')}>+ Classification</button>
                                            <button class="btn-small" onclick={() => addRestriction('partOf')}>+ Part Of</button>
                                        </div>
                                    </div>
                                    <div class="restrictions-list">
                                        {#if currentSpec?.applicability}
                                            {#each Object.entries(currentSpec.applicability) as [facetType, facets]}
                                                {#each facets as facet, index}
                                                    <div class="restriction-item">
                                                        <div class="restriction-header">
                                                            <span class="restriction-type">{facetType.toUpperCase()}</span>
                                                            <span class="restriction-name">{facet?.name || facetType}</span>
                                                            <button class="btn-delete" onclick={() => removeRestriction(index)} aria-label="Delete Restriction">
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                                    <path d="M18 6L6 18M6 6l12 12"></path>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <div class="restriction-form">
                                                            {#if facetType === 'entity'}
                                                                <div class="form-group">
                                                                    <label>Entity Name</label>
                                                                    <input type="text" value={facet?.name?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.name) facet.name = {}; facet.name.simpleValue = e.target.value; } }} placeholder="e.g., IfcWall">
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Predefined Type</label>
                                                                    <input type="text" value={facet?.predefinedType?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.predefinedType) facet.predefinedType = {}; facet.predefinedType.simpleValue = e.target.value; } }} placeholder="e.g., SOLIDWALL">
                                                                </div>
                                                            {:else if facetType === 'attribute'}
                                                                <div class="form-group">
                                                                    <label>Attribute Name</label>
                                                                    <input type="text" value={facet?.name?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.name) facet.name = {}; facet.name.simpleValue = e.target.value; } }} placeholder="e.g., Name">
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Value</label>
                                                                    <input type="text" value={facet?.value?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.value) facet.value = {}; facet.value.simpleValue = e.target.value; } }} placeholder="Optional value">
                                                                </div>
                                                            {:else if facetType === 'property'}
                                                                <div class="form-group">
                                                                    <label>Property Set</label>
                                                                    <input type="text" value={facet?.propertySet?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.propertySet) facet.propertySet = {}; facet.propertySet.simpleValue = e.target.value; } }} placeholder="e.g., Pset_WallCommon">
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Base Name</label>
                                                                    <input type="text" value={facet?.baseName?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.baseName) facet.baseName = {}; facet.baseName.simpleValue = e.target.value; } }} placeholder="e.g., FireRating">
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Value</label>
                                                                    <input type="text" value={facet?.value?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.value) facet.value = {}; facet.value.simpleValue = e.target.value; } }} placeholder="Optional value">
                                                                </div>
                                                            {:else if facetType === 'material'}
                                                                <div class="form-group">
                                                                    <label>Material Value</label>
                                                                    <input type="text" value={facet?.value?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.value) facet.value = {}; facet.value.simpleValue = e.target.value; } }} placeholder="e.g., Concrete">
                                                                </div>
                                                            {:else if facetType === 'classification'}
                                                                <div class="form-group">
                                                                    <label>System</label>
                                                                    <input type="text" value={facet?.system?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.system) facet.system = {}; facet.system.simpleValue = e.target.value; } }} placeholder="e.g., Uniclass 2015">
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Value</label>
                                                                    <input type="text" value={facet?.value?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.value) facet.value = {}; facet.value.simpleValue = e.target.value; } }} placeholder="e.g., EF_25_10_25">
                                                                </div>
                                                            {:else if facetType === 'partOf'}
                                                                <div class="form-group">
                                                                    <label>Entity</label>
                                                                    <input type="text" value={facet?.entity?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.entity) facet.entity = {}; facet.entity.simpleValue = e.target.value; } }} placeholder="e.g., IfcSpace">
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Relation</label>
                                                                    <select value={facet?.relation?.simpleValue || ''} onchange={(e) => { if (facet) { if (!facet.relation) facet.relation = {}; facet.relation.simpleValue = e.target.value; } }}>
                                                                        <option value="">Select relation...</option>
                                                                        <option value="IFCRELAGGREGATES">IFCRELAGGREGATES</option>
                                                                        <option value="IFCRELASSIGNSTOGROUP">IFCRELASSIGNSTOGROUP</option>
                                                                        <option value="IFCRELCONTAINEDINSPATIALSTRUCTURE">IFCRELCONTAINEDINSPATIALSTRUCTURE</option>
                                                                        <option value="IFCRELNESTS">IFCRELNESTS</option>
                                                                        <option value="IFCRELVOIDSELEMENT IFCRELFILLSELEMENT">IFCRELVOIDSELEMENT IFCRELFILLSELEMENT</option>
                                                                    </select>
                                                                </div>
                                                            {/if}
                                                            <div class="form-group">
                                                                <label>Cardinality</label>
                                                                <select value={facet?.cardinality?.simpleValue || 'required'} onchange={(e) => { if (facet) { if (!facet.cardinality) facet.cardinality = {}; facet.cardinality.simpleValue = e.target.value; } }}>
                                                                    <option value="required">Required</option>
                                                                    <option value="optional">Optional</option>
                                                                    <option value="prohibited">Prohibited</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                {/each}
                                            {/each}
                                        {/if}
                                    </div>
                                </div>
                            {:else if selectedTab === 'requirements'}
                                <div class="restrictions-panel">
                                    <div class="restrictions-header">
                                        <h3>Restrictions</h3>
                                        <div class="restriction-buttons">
                                            <button class="btn-small" onclick={() => addRestriction('entity')}>+ Entity</button>
                                            <button class="btn-small" onclick={() => addRestriction('attribute')}>+ Attribute</button>
                                            <button class="btn-small" onclick={() => addRestriction('property')}>+ Property</button>
                                            <button class="btn-small" onclick={() => addRestriction('material')}>+ Material</button>
                                            <button class="btn-small" onclick={() => addRestriction('classification')}>+ Classification</button>
                                            <button class="btn-small" onclick={() => addRestriction('partOf')}>+ Part Of</button>
                                        </div>
                                    </div>
                                    <div class="restrictions-list">
                                        {#if currentSpec?.requirements}
                                            {#each Object.entries(currentSpec.requirements) as [facetType, facets]}
                                                {#each facets as facet, index}
                                                    <div class="restriction-item">
                                                        <div class="restriction-header">
                                                            <span class="restriction-type">{facetType.toUpperCase()}</span>
                                                            <span class="restriction-name">{facet?.name || facetType}</span>
                                                            <button class="btn-delete" onclick={() => removeRestriction(index)}>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                                    <path d="M18 6L6 18M6 6l12 12"></path>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <div class="restriction-form">
                                                            {#if facetType === 'entity'}
                                                                <div class="form-group">
                                                                    <label>Entity Name</label>
                                                                    <input type="text" value={facet?.name?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.name) facet.name = {}; facet.name.simpleValue = e.target.value; } }} placeholder="e.g., IfcWall">
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Predefined Type</label>
                                                                    <input type="text" value={facet?.predefinedType?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.predefinedType) facet.predefinedType = {}; facet.predefinedType.simpleValue = e.target.value; } }} placeholder="e.g., SOLIDWALL">
                                                                </div>
                                                            {:else if facetType === 'attribute'}
                                                                <div class="form-group">
                                                                    <label>Attribute Name</label>
                                                                    <input type="text" value={facet?.name?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.name) facet.name = {}; facet.name.simpleValue = e.target.value; } }} placeholder="e.g., Name">
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Value</label>
                                                                    <input type="text" value={facet?.value?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.value) facet.value = {}; facet.value.simpleValue = e.target.value; } }} placeholder="Optional value">
                                                                </div>
                                                            {:else if facetType === 'property'}
                                                                <div class="form-group">
                                                                    <label>Property Set</label>
                                                                    <input type="text" value={facet?.propertySet?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.propertySet) facet.propertySet = {}; facet.propertySet.simpleValue = e.target.value; } }} placeholder="e.g., Pset_WallCommon">
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Base Name</label>
                                                                    <input type="text" value={facet?.baseName?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.baseName) facet.baseName = {}; facet.baseName.simpleValue = e.target.value; } }} placeholder="e.g., FireRating">
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Value</label>
                                                                    <input type="text" value={facet?.value?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.value) facet.value = {}; facet.value.simpleValue = e.target.value; } }} placeholder="Optional value">
                                                                </div>
                                                            {:else if facetType === 'material'}
                                                                <div class="form-group">
                                                                    <label>Material Value</label>
                                                                    <input type="text" value={facet?.value?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.value) facet.value = {}; facet.value.simpleValue = e.target.value; } }} placeholder="e.g., Concrete">
                                                                </div>
                                                            {:else if facetType === 'classification'}
                                                                <div class="form-group">
                                                                    <label>System</label>
                                                                    <input type="text" value={facet?.system?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.system) facet.system = {}; facet.system.simpleValue = e.target.value; } }} placeholder="e.g., Uniclass 2015">
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Value</label>
                                                                    <input type="text" value={facet?.value?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.value) facet.value = {}; facet.value.simpleValue = e.target.value; } }} placeholder="e.g., EF_25_10_25">
                                                                </div>
                                                            {:else if facetType === 'partOf'}
                                                                <div class="form-group">
                                                                    <label>Entity</label>
                                                                    <input type="text" value={facet?.entity?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.entity) facet.entity = {}; facet.entity.simpleValue = e.target.value; } }} placeholder="e.g., IfcSpace">
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Relation</label>
                                                                    <select value={facet?.relation?.simpleValue || ''} onchange={(e) => { if (facet) { if (!facet.relation) facet.relation = {}; facet.relation.simpleValue = e.target.value; } }}>
                                                                        <option value="">Select relation...</option>
                                                                        <option value="IFCRELAGGREGATES">IFCRELAGGREGATES</option>
                                                                        <option value="IFCRELASSIGNSTOGROUP">IFCRELASSIGNSTOGROUP</option>
                                                                        <option value="IFCRELCONTAINEDINSPATIALSTRUCTURE">IFCRELCONTAINEDINSPATIALSTRUCTURE</option>
                                                                        <option value="IFCRELNESTS">IFCRELNESTS</option>
                                                                        <option value="IFCRELVOIDSELEMENT IFCRELFILLSELEMENT">IFCRELVOIDSELEMENT IFCRELFILLSELEMENT</option>
                                                                    </select>
                                                                </div>
                                                            {/if}
                                                            <div class="form-group">
                                                                <label>Cardinality</label>
                                                                <select value={facet?.cardinality?.simpleValue || 'required'} onchange={(e) => { if (facet) { if (!facet.cardinality) facet.cardinality = {}; facet.cardinality.simpleValue = e.target.value; } }}>
                                                                    <option value="required">Required</option>
                                                                    <option value="optional">Optional</option>
                                                                    <option value="prohibited">Prohibited</option>
                                                                </select>
                                                            </div>
                                                            {#if selectedTab === 'requirements' && facetType !== 'entity'}
                                                                <div class="form-group full-width">
                                                                    <label>Instructions</label>
                                                                    <textarea value={facet?.instructions?.simpleValue || ''} oninput={(e) => { if (facet) { if (!facet.instructions) facet.instructions = {}; facet.instructions.simpleValue = e.target.value; } }} placeholder="Optional instructions for IFC authors" rows="2"></textarea>
                                                                </div>
                                                            {/if}
                                                        </div>
                                                    </div>
                                                {/each}
                                            {/each}
                                        {/if}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
    <AppRibbon />
</div>