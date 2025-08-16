<script>
    import * as IDS from "$src/modules/api/ids.svelte.js";

    let activeDocument = $derived(IDS.Module.activeDocument ? IDS.Module.documents[IDS.Module.activeDocument] : null);
    let documentState = $derived(IDS.Module.activeDocument ? IDS.Module.states[IDS.Module.activeDocument] : null);
    let expandedSpecs = $state(new Set());

    // Open Editor mode and jump to a specific specification
    function editSpecification(index) {
        if (IDS.Module.activeDocument) {
            IDS.setDocumentState(IDS.Module.activeDocument, { 
                viewMode: 'editor',
                activeSpecification: index,
                activeTab: 'info'
            });
        }
    }

    function toggleSpecification(index) {
        if (expandedSpecs.has(index)) {
            expandedSpecs.delete(index);
        } else {
            expandedSpecs.add(index);
        }
        expandedSpecs = new Set(expandedSpecs);
    }
</script>

<div class="ids-viewer">
    <div class="viewer-header">
        <h1>{activeDocument?.info?.title || "IDS Document"}</h1>
        <div class="document-meta">
            {#if activeDocument?.info?.version}
                <span class="meta-item">Version: {activeDocument.info.version}</span>
            {/if}
            {#if activeDocument?.info?.author}
                <span class="meta-item">Author: {activeDocument.info.author}</span>
            {/if}
            {#if activeDocument?.info?.date}
                <span class="meta-item">Date: {activeDocument.info.date}</span>
            {/if}
        </div>
        {#if activeDocument?.info?.description}
            <p class="document-description">{activeDocument.info.description}</p>
        {/if}
    </div>

    <div class="specifications-viewer">
        {#if activeDocument?.specifications?.specification && activeDocument.specifications.specification.length > 0}
            {#each activeDocument.specifications.specification as spec, index}
                <div class="specification-card">
                    <div class="spec-card-header" onclick={() => toggleSpecification(index)}>
                        <div class="spec-title-section">
                            <h2>{spec["@name"] || `Specification ${index + 1}`}</h2>
                            {#if "@description" in spec}
                                <p class="spec-description">{spec["@description"]}</p>
                            {/if}
                        </div>
                        <div class="spec-actions">
                            <button class="edit-btn" onclick={(e) => { e.stopPropagation(); editSpecification(index); }} aria-label="Edit specification">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="expand-btn" aria-label={expandedSpecs.has(index) ? "Collapse specification" : "Expand specification"}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class:rotated={expandedSpecs.has(index)}>
                                    <polyline points="6,9 12,15 18,9"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {#if expandedSpecs.has(index)}
                        <div class="spec-content">
                            <!-- Applicability Section -->
                            <div class="facet-section">
                                <h3>Applicability</h3>
                                
                                <div class="facets-list">
                                    {#each Object.entries(spec.applicability || {}) as [facetType, facets]}
                                        {#if Array.isArray(facets) && facets.length > 0}
                                            <div class="facet-group">
                                                {#each facets as facet, facetIndex}
                                                    <div class="facet-item">
                                                        <span class="facet-bullet">•</span>
                                                        <span class="facet-text">{@html IDS.stringifyFacet("applicability", facet, facetType, spec)}</span>
                                                    </div>
                                                {/each}
                                            </div>
                                        {/if}
                                    {/each}
                                </div>
                            </div>

                            <!-- Requirements Section -->
                            <div class="facet-section">
                                <h3>Requirements</h3>
                                
                                <div class="facets-list">
                                    {#each Object.entries(spec.requirements || {}) as [facetType, facets]}
                                        {#if Array.isArray(facets) && facets.length > 0}
                                            <div class="facet-group">
                                                {#each facets as facet, facetIndex}
                                                    <div class="facet-item">
                                                        <span class="facet-bullet">•</span>
                                                        <span class="facet-text">{@html IDS.stringifyFacet("requirements", facet, facetType, spec)}</span>
                                                    </div>
                                                {/each}
                                            </div>
                                        {/if}
                                    {/each}
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>
            {/each}
        {:else}
            <div class="no-specifications">
                <p>No specifications defined in this IDS document.</p>
            </div>
        {/if}
    </div>
</div>

<style>
    .ids-viewer {
        max-width: 1000px;
        margin: 0;
        color: #e0e0e0;
    }

    .viewer-header {
        margin-bottom: 30px;
    }

    .viewer-header h1 {
        margin: 0 0 12px 0;
        font-size: 32px;
        color: white;
    }

    .document-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 12px;
    }

    .meta-item {
        font-size: 14px;
        color: #b0b0b0;
        background: #2d2d2d;
        padding: 4px 8px;
        border-radius: 4px;
    }

    .document-description {
        margin: 0;
        font-size: 16px;
        line-height: 1.5;
        color: #d0d0d0;
    }

    .specifications-viewer {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .specification-card {
        background: #ffffff05;
        border: 1px solid #5555556e;
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.2s;
    }

    .specification-card:hover {
        border-color: #555555;
    }
    .specification-card:hover .spec-content {
        border-color: #555555;
    }
    .specification-card:hover .spec-card-header {
        background: #ffffff0d;
    }

    .spec-card-header {
        padding: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        transition: background-color 0.2s;
    }

    .spec-card-header:hover {
        background: #ffffff0d;
    }

    .spec-title-section {
        flex: 1;
    }

    .spec-title-section h2 {
        margin: 0 0 8px 0;
        font-size: 20px;
        color: #e0e0e0;
    }

    .spec-description {
        margin: 0;
        font-size: 14px;
        color: #b0b0b0;
        line-height: 1.4;
    }

    .spec-actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .edit-btn, .expand-btn {
        background: none;
        border: 1px solid #5555556e;
        border-radius: 50px;
        padding: 8px;
        cursor: pointer;
        color: #b0b0b0;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .edit-btn:hover, .expand-btn:hover {
        background: #ffffff12;
        border-color: #ffffff1f;
    }

    .expand-btn svg {
        transition: transform 0.2s;
    }

    .expand-btn svg.rotated {
        transform: rotate(180deg);
    }

    .spec-content {
        padding: 0 20px 20px 20px;
        border-top: 1px solid #5555556e;
    }

    .facet-section {
        margin-bottom: 10px;
    }

    .facet-section:last-child {
        margin-bottom: 0;
    }

    .facet-section h3 {
        margin: 16px 0 8px 0;
        font-size: 13px;
        font-weight: 600;
        color: #e0e0e0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: inline-block;
        border: 1px solid #ffffff47;
        padding: 2px 10px;
        border-radius: 26px;
    }

    .facets-list {
        display: flex;
        flex-direction: column;
    }

    .facet-group {
        padding: 8px 12px;
    }

    .facet-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
    }

    .facet-item:last-child {
        margin-bottom: 0;
    }

    .facet-bullet {
        font-weight: bold;
        margin-top: 2px;
        color: #ffffff73;
    }

    .facet-text {
        flex: 1;
        font-size: 15px;
        line-height: 1.4;
        color: #e0e0e0;

        :global(strong) {
            color: #79ecb7;
            font-weight: 500;
        }

        :global(code) {
            display: inline-block;
            background-color: #ffffff17;
            padding: 1px 5px;
            color: #c0e2ff;
            border-radius: 5px;
        }
    }

    .no-specifications {
        text-align: center;
        padding: 48px 24px;
        color: #b0b0b0;
    }

    .no-specifications p {
        margin: 0;
        font-size: 16px;
    }
</style>