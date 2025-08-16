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
    import IdsViewer from "./IdsViewer.svelte";
    import {onMount} from "svelte";

    let activeDocument = $derived(IDS.Module.activeDocument ? IDS.Module.documents[IDS.Module.activeDocument] : null);
    let documentState = $derived(IDS.Module.activeDocument ? IDS.Module.states[IDS.Module.activeDocument] : null);
    let activeSpecification = $derived(activeDocument && documentState?.activeSpecification !== null && activeDocument.specifications?.specification ? 
        activeDocument.specifications.specification[documentState.activeSpecification] : null);
    
    async function addNewSpecification() {
        if (!IDS.Module.activeDocument) return;
        await IDS.createSpecification(IDS.Module.activeDocument);
    }
    
    function selectSpecification(index) {
        if (IDS.Module.activeDocument) {
            IDS.setDocumentState(IDS.Module.activeDocument, { activeSpecification: index });
        }
    }
    
    async function deleteSpecification(specIndex) {
        if (!IDS.Module.activeDocument) return;
        await IDS.deleteSpecification(IDS.Module.activeDocument, specIndex);
    }
    
    async function exportIDS() {
        if (!IDS.Module.activeDocument) {
            alert('No document to export.');
            return;
        }
        
        try {
            await IDS.exportDocument(IDS.Module.activeDocument);
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
                {#if IDS.Module.activeDocument && documentState?.viewMode !== 'viewer'}
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
                        <div class="specifications-list scrollbar">
                            <div class="spec-item" class:active={documentState?.activeSpecification === null} onclick={() => { if (IDS.Module.activeDocument) IDS.setDocumentState(IDS.Module.activeDocument, { activeSpecification: null }); }}>
                                <span class="spec-icon">ℹ️</span>
                                <span class="spec-name">IDS Information</span>
                            </div>
                            {#if activeDocument?.specifications?.specification}
                                {#each activeDocument.specifications.specification as spec, index}
                                    <div class="spec-item" class:active={documentState?.activeSpecification === index} onclick={() => selectSpecification(index)}>
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
                    </div>
                {/if}
                <div class="main-panel" class:full-width={!IDS.Module.activeDocument} class:scrollbar={true}>
                    {#if !IDS.Module.activeDocument}
                        <div class="no-document">
                            <h2>No Active Document</h2>
                            <p>Please create or open an existing IDS file.</p>
                        </div>
                    {:else}
                        <!-- Editor/Viewer Toggle -->
                        <div class="view-mode-toggle">
                            <button class="toggle-btn" class:active={documentState?.viewMode === 'editor'} onclick={() => IDS.setDocumentState(IDS.Module.activeDocument, { viewMode: 'editor' })}>
                                Editor
                            </button>
                            <button class="toggle-btn" class:active={documentState?.viewMode === 'viewer'} onclick={() => IDS.setDocumentState(IDS.Module.activeDocument, { viewMode: 'viewer' })}>
                                Viewer
                            </button>
                        </div>

                        {#if documentState?.viewMode === 'viewer'}
                            <IdsViewer />
                        {:else if documentState?.activeSpecification === null}
                            <IdsMetadataEditor />
                        {:else}
                            <div class="specification-editor">
                                <div class="spec-header">
                                    <h2>{activeSpecification ? activeSpecification["@name"] || "Specification" : "Specification"}</h2>
                                    <div class="spec-tabs">
                                        <button class="btn tab-btn" class:active={documentState?.activeTab === 'info'} onclick={() => IDS.setDocumentState(IDS.Module.activeDocument, { activeTab: 'info' })}>Info</button>
                                        <button class="btn tab-btn" class:active={documentState?.activeTab === 'applicability'} onclick={() => IDS.setDocumentState(IDS.Module.activeDocument, { activeTab: 'applicability' })}>Applicability</button>
                                        <button class="btn tab-btn" class:active={documentState?.activeTab === 'requirements'} onclick={() => IDS.setDocumentState(IDS.Module.activeDocument, { activeTab: 'requirements' })}>Requirements</button>
                                    </div>
                                </div>
                                
                                {#if documentState?.activeTab === 'info'}
                                    <SpecificationEditor />
                                {:else if documentState?.activeTab === 'applicability'}
                                    <ApplicabilityPanel activeTab />
                                {:else if documentState?.activeTab === 'requirements'}
                                    <RequirementsPanel activeTab />
                                {/if}
                            </div>
                        {/if}
                    {/if}
                </div>
            </div>
        </div>
    </div>
    <AppRibbon />
</div>