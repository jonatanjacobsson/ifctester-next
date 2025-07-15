<script>
    import * as IDS from "$src/modules/api/ids.svelte.js";
    import AppHeader from "$src/components/AppHeader.svelte";
    import AppRibbon from "$src/components/AppRibbon.svelte";
    import AppToolbar from "$src/components/AppToolbar.svelte";
    import IdsTabs from "$src/components/IdsTabs.svelte";
    import IdsMetadataEditor from "./IdsMetadataEditor.svelte";
    import SpecificationEditor from "./SpecificationEditor.svelte";
    import ApplicabilityPanel from "./ApplicabilityPanel.svelte";
    import RequirementsPanel from "./RequirementsPanel.svelte";
    import {onMount} from "svelte";

    let activeTab = $state('info');
    let activeDocument = $derived(IDS.Module.activeDocument ? IDS.Module.documents[IDS.Module.activeDocument.id] : null);
    let activeSpecification = $derived(activeDocument && IDS.Module.activeDocument?.specification !== null && activeDocument.specifications?.specification ? 
        activeDocument.specifications.specification[IDS.Module.activeDocument.specification] : null);
    
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
                                <span class="spec-name">{activeDocument?.info.title || "New IDS"}</span>
                            </div>
                            {#if activeDocument?.specifications?.specification}
                                {#each activeDocument.specifications.specification as spec, index}
                                    <div class="spec-item" class:active={IDS.Module.activeDocument?.specification === index} onclick={() => selectSpecification(index)}>
                                        <span class="spec-icon">📄</span>
                                        <span class="spec-name">{spec["@name"] || "Specification " + (index + 1)}</span>
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
                        <IdsMetadataEditor />
                    {:else}
                        <div class="specification-editor">
                            <div class="spec-header">
                                <h2>Specification</h2>
                                <div class="spec-tabs">
                                    <button class="btn tab-btn" class:active={activeTab === 'info'} onclick={() => activeTab = 'info'}>Info</button>
                                    <button class="btn tab-btn" class:active={activeTab === 'applicability'} onclick={() => activeTab = 'applicability'}>Applicability</button>
                                    <button class="btn tab-btn" class:active={activeTab === 'requirements'} onclick={() => activeTab = 'requirements'}>Requirements</button>
                                </div>
                            </div>
                            
                            {#if activeTab === 'info'}
                                <SpecificationEditor />
                            {:else if activeTab === 'applicability'}
                                <ApplicabilityPanel activeTab />
                            {:else if activeTab === 'requirements'}
                                <RequirementsPanel activeTab />
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
    <AppRibbon />
</div>