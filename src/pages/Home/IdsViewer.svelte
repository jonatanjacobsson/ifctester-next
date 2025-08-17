<script>
    import * as IDS from "$src/modules/api/ids.svelte.js";
    import { getAuditReportById } from "$src/modules/api/api.svelte.js";

    let activeDocument = $derived(IDS.Module.activeDocument ? IDS.Module.documents[IDS.Module.activeDocument] : null);
    let documentState = $derived(IDS.Module.activeDocument ? IDS.Module.states[IDS.Module.activeDocument] : null);
    let auditReport = $derived(documentState?.auditReport ? getAuditReportById(documentState.auditReport) : null);
    let expandedSpecs = $state(new Set());
    let expandedRequirements = $state(new Set());

    // Open Editor mode and jump to a specific specification
    function editSpecification(index) {
        if (IDS.Module.activeDocument) {
            IDS.setDocumentState(IDS.Module.activeDocument, { 
                viewMode: 'editor',
                activeSpecification: index,
                activeTab: 'info',
                auditReport: null // Clear audit report when going to editor
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

    function getSpecificationStatus(specIndex, auditData) {
        const spec = auditData.specifications[specIndex];
        if (!spec) return null;
        
        // If no applicable elements and no checks, and it passed, it's actually skipped
        if (spec.total_applicable === 0 && spec.total_checks === 0 && spec.status === true) {
            return 'skipped';
        }
        
        return spec.status;
    }

    function getSpecificationStats(specIndex, auditData) {
        const spec = auditData.specifications[specIndex];
        if (!spec) return null;
        return {
            requirements: `${spec.total_requirements || 0}`,
            requirementsPassed: `${spec.total_requirements_pass || 0}`,
            checksTotal: `${spec.total_checks || 0}`,
            checksPassed: `${spec.total_checks_pass || 0}`,
            applicableTotal: `${spec.total_applicable || 0}`,
            applicablePassed: `${spec.total_applicable_pass || 0}`
        };
    }

    function getSpecificationReason(specIndex, auditData) {
        const spec = auditData.specifications[specIndex];
        if (!spec) return null;
        
        const status = getSpecificationStatus(specIndex, auditData);
        
        if (status === 'skipped') {
            return "Skipped because no applicable entities were found and the cardinality is OPTIONAL or PROHIBITED";
        }
        
        if (status === false) { // Failed
            if (spec.total_applicable === 0) {
                return "Failed because no applicable entities were found but the cardinality is REQUIRED";
            } else {
                const failedChecks = spec.total_checks - spec.total_checks_pass;
                return `Failed because ${failedChecks}/${spec.total_checks} checks did not pass`;
            }
        }
        
        return null; // No reason needed for passed specifications
    }

    function getRequirementStatus(specIndex, reqIndex, auditData) {
        const spec = auditData.specifications[specIndex];
        if (!spec || !spec.requirements || !spec.requirements[reqIndex]) return null;
        return spec.requirements[reqIndex];
    }

    function toggleRequirementDetails(specIndex, reqIndex) {
        const key = `${specIndex}-${reqIndex}`;
        if (expandedRequirements.has(key)) {
            expandedRequirements.delete(key);
        } else {
            expandedRequirements.add(key);
        }
        expandedRequirements = new Set(expandedRequirements);
    }

    function isRequirementDetailsExpanded(specIndex, reqIndex) {
        return expandedRequirements.has(`${specIndex}-${reqIndex}`);
    }
</script>

<div class="ids-viewer">
    <div class="viewer-header">
        <h1>{auditReport ? (auditReport.data.title || "Audit Report") : (activeDocument?.info?.title || "IDS Document")}</h1>
        
        <div class="document-meta">
            {#if auditReport}
                <span class="meta-item">Model: {auditReport.modelName}</span>
            {/if}
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
        
        {#if auditReport}
            <div class="audit-summary">
                <div class="summary-item overall-status {auditReport.data.status ? 'pass' : 'fail'}">
                    {auditReport.data.status ? 'PASS' : 'FAIL'}
                </div>
                <div class="summary-stats">
                    <div class="stat-group">
                        <span class="stat-label">Specifications:</span>
                        <span class="stat-value">{auditReport.data.total_specifications_pass}/{auditReport.data.total_specifications}</span>
                        <span class="stat-percent">({auditReport.data.percent_specifications_pass}%)</span>
                    </div>
                    <div class="stat-group">
                        <span class="stat-label">Requirements:</span>
                        <span class="stat-value">{auditReport.data.total_requirements_pass}/{auditReport.data.total_requirements}</span>
                        <span class="stat-percent">({auditReport.data.percent_requirements_pass}%)</span>
                    </div>
                    <div class="stat-group">
                        <span class="stat-label">Checks:</span>
                        <span class="stat-value">{auditReport.data.total_checks_pass}/{auditReport.data.total_checks}</span>
                        <span class="stat-percent">({auditReport.data.percent_checks_pass}%)</span>
                    </div>
                </div>
            </div>
        {/if}
    </div>

    <div class="specifications-viewer">
        {#if activeDocument?.specifications?.specification && activeDocument.specifications.specification.length > 0}
            {#each activeDocument.specifications.specification as spec, index}
                <div class="specification-card {auditReport ? 'with-audit' : ''} {auditReport && getSpecificationStatus(index, auditReport.data) !== null ? (getSpecificationStatus(index, auditReport.data) === 'skipped' ? 'spec-skipped' : (getSpecificationStatus(index, auditReport.data) ? 'spec-pass' : 'spec-fail')) : ''}">
                    <div class="spec-card-header" onclick={() => toggleSpecification(index)}>
                        <div class="spec-title-section">
                            <div class="spec-title-row">
                                <h2>{spec["@name"] || `Specification ${index + 1}`}</h2>
                                {#if auditReport && getSpecificationStatus(index, auditReport.data) !== null}
                                    {@const status = getSpecificationStatus(index, auditReport.data)}
                                    <span class="spec-status {status === 'skipped' ? 'skipped' : (status ? 'pass' : 'fail')}">
                                        {status === 'skipped' ? 'SKIPPED' : (status ? 'PASS' : 'FAIL')}
                                    </span>
                                {/if}
                            </div>
                            {#if "@description" in spec}
                                <p class="spec-description">{spec["@description"]}</p>
                            {/if}
                            {#if auditReport}
                                {@const reason = getSpecificationReason(index, auditReport.data)}
                                {#if reason}
                                    <p class="spec-reason">{reason}</p>
                                {/if}
                                {@const stats = getSpecificationStats(index, auditReport.data)}
                                {@const status = getSpecificationStatus(index, auditReport.data)}
                                {#if stats && status !== 'skipped'}
                                    <div class="spec-stats">
                                        <span class="stat-item">Requirements: {stats.requirementsPassed}/{stats.requirements}</span>
                                        <span class="stat-item">Checks: {stats.checksPassed}/{stats.checksTotal}</span>
                                    </div>
                                {/if}
                            {/if}
                        </div>
                        <div class="spec-actions">
                            <button class="edit-btn" onclick={(e) => { e.stopPropagation(); editSpecification(index); }} aria-label="Edit specification">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <div class="expand-btn-container">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class:rotated={expandedSpecs.has(index)}>
                                    <polyline points="6,9 12,15 18,9"></polyline>
                                </svg>
                            </div>
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
                                                    {@const reqAuditData = auditReport ? getRequirementStatus(index, facetIndex, auditReport.data) : null}
                                                    {@const specStatus = auditReport ? getSpecificationStatus(index, auditReport.data) : null}
                                                    <div class="facet-item {auditReport && reqAuditData && specStatus !== 'skipped' ? (reqAuditData.status ? 'audit-pass' : 'audit-fail') : ''}">
                                                        <span class="facet-bullet">•</span>
                                                        <span class="facet-text">{@html IDS.stringifyFacet("requirements", facet, facetType, spec)}</span>
                                                        {#if auditReport && reqAuditData && specStatus !== 'skipped'}
                                                            <div class="requirement-audit-details">
                                                                {#if reqAuditData.total_applicable > 0}
                                                                    <button class="audit-details-toggle" onclick={() => toggleRequirementDetails(index, facetIndex)}>
                                                                        {reqAuditData.status ? 'PASS' : 'FAIL'} ({reqAuditData.total_pass}/{reqAuditData.total_applicable})
                                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class:rotated={isRequirementDetailsExpanded(index, facetIndex)}>
                                                                            <polyline points="6,9 12,15 18,9"></polyline>
                                                                        </svg>
                                                                    </button>
                                                                {:else}
                                                                    <span class="audit-status-badge">
                                                                        {reqAuditData.status ? 'PASS' : 'FAIL'}
                                                                    </span>
                                                                {/if}
                                                                {#if isRequirementDetailsExpanded(index, facetIndex)}
                                                                    <div class="entity-tables">
                                                                        {#if reqAuditData.passed_entities && reqAuditData.passed_entities.length > 0}
                                                                            <div class="entity-table-section pass">
                                                                                <h4>Passed Elements ({reqAuditData.passed_entities.length})</h4>
                                                                                <div class="entity-table-container">
                                                                                    <table class="entity-table">
                                                                                        <thead>
                                                                                            <tr>
                                                                                                <th>Class</th>
                                                                                                <th>PredefinedType</th>
                                                                                                <th>Name</th>
                                                                                                <th>Description</th>
                                                                                                <th>GlobalId</th>
                                                                                                <th>Tag</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            {#each reqAuditData.passed_entities.slice(0, 10) as entity}
                                                                                                <tr>
                                                                                                    <td>{entity.class}</td>
                                                                                                    <td>{entity.predefined_type || '-'}</td>
                                                                                                    <td>{entity.name || '-'}</td>
                                                                                                    <td>{entity.description || '-'}</td>
                                                                                                    <td>{entity.global_id || '-'}</td>
                                                                                                    <td>{entity.tag || '-'}</td>
                                                                                                </tr>
                                                                                            {/each}
                                                                                            {#if reqAuditData.passed_entities.length > 10}
                                                                                                <tr class="more-row">
                                                                                                    <td colspan="6">... {reqAuditData.passed_entities.length - 10} more passing elements not shown ...</td>
                                                                                                </tr>
                                                                                            {/if}
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                            </div>
                                                                        {/if}
                                                                        
                                                                        {#if reqAuditData.failed_entities && reqAuditData.failed_entities.length > 0}
                                                                            <div class="entity-table-section fail">
                                                                                <h4>Failed Elements ({reqAuditData.failed_entities.length})</h4>
                                                                                <div class="entity-table-container">
                                                                                    <table class="entity-table">
                                                                                        <thead>
                                                                                            <tr>
                                                                                                <th>Class</th>
                                                                                                <th>PredefinedType</th>
                                                                                                <th>Name</th>
                                                                                                <th>Description</th>
                                                                                                <th>Warning</th>
                                                                                                <th>GlobalId</th>
                                                                                                <th>Tag</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            {#each reqAuditData.failed_entities.slice(0, 10) as entity}
                                                                                                <tr>
                                                                                                    <td>{entity.class}</td>
                                                                                                    <td>{entity.predefined_type || '-'}</td>
                                                                                                    <td>{entity.name || '-'}</td>
                                                                                                    <td>{entity.description || '-'}</td>
                                                                                                    <td>{entity.reason || '-'}</td>
                                                                                                    <td>{entity.global_id || '-'}</td>
                                                                                                    <td>{entity.tag || '-'}</td>
                                                                                                </tr>
                                                                                            {/each}
                                                                                            {#if reqAuditData.failed_entities.length > 10}
                                                                                                <tr class="more-row">
                                                                                                    <td colspan="7">... {reqAuditData.failed_entities.length - 10} more failing elements not shown ...</td>
                                                                                                </tr>
                                                                                            {/if}
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                            </div>
                                                                        {/if}
                                                                    </div>
                                                                {/if}
                                                            </div>
                                                        {/if}
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


    .audit-summary {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 12px;
    }

    .overall-status {
        padding: 5px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .overall-status.pass {
        background: #10b98122;
        color: #10b981;
        border: 1px solid #10b98133;
    }

    .overall-status.fail {
        background: #ef444422;
        color: #ef4444;
        border: 1px solid #ef444433;
    }

    .summary-stats {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
    }

    .stat-group {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
    }

    .stat-label {
        color: #b0b0b0;
    }

    .stat-value {
        color: #e0e0e0;
        font-weight: 500;
    }

    .stat-percent {
        color: #9ca3af;
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

    .specification-card.with-audit.spec-pass {
        border-color: #10b98155;
        background: #10b98108;
    }

    .specification-card.with-audit.spec-fail {
        border-color: #ff838355;
        background: #ff9c9c08;
    }

    .specification-card.with-audit.spec-skipped {
        border-color: #8b8d8f55;
        background: #8b8d8f08;
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
        background: none;
        border: none;
        color: inherit;
        text-align: left;
        width: 100%;
    }

    .spec-card-header:hover {
        background: #ffffff0d;
    }

    .spec-title-section {
        flex: 1;
    }

    .spec-title-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
    }

    .spec-status {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .spec-status.pass {
        background: #10b98122;
        color: #10b981;
    }

    .spec-status.fail {
        background: #ef444422;
        color: #ef4444;
    }

    .spec-status.skipped {
        background: #8b8d8f22;
        color: #8b8d8f;
    }

    .spec-stats {
        display: flex;
        gap: 16px;
        margin-top: 8px;
    }

    .stat-item {
        font-size: 12px;
        color: #9ca3af;
    }

    .spec-title-section h2 {
        margin: 0;
        font-size: 20px;
        color: #e0e0e0;
    }

    .spec-description {
        margin: 0;
        font-size: 14px;
        color: #b0b0b0;
        line-height: 1.4;
    }

    .spec-reason {
        display: inline-block;
        margin: 8px 0 0 0;
        font-size: 13px;
        color: #9ca3af;
        line-height: 1.4;
        font-style: italic;
        padding: 6px 10px;
        background: #ffffff08;
        border-radius: 6px;
    }

    .spec-actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .edit-btn {
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

    .edit-btn:hover {
        background: #ffffff12;
        border-color: #ffffff1f;
    }

    .expand-btn-container {
        padding: 8px;
        border: 1px solid #5555556e;
        border-radius: 50px;
        color: #b0b0b0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .expand-btn-container svg {
        transition: transform 0.2s;
    }

    .expand-btn-container svg.rotated {
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
        flex-wrap: wrap;
    }

    .facet-item:last-child {
        margin-bottom: 0;
    }

    .facet-bullet {
        font-weight: bold;
        margin-top: 2px;
        color: #ffffff73;
        flex: 0 0 1%;
    }

    .facet-text {
        font-size: 15px;
        line-height: 1.4;
        color: #e0e0e0;
        flex: 0 0 calc(99% - 8px);

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

    /* Audit-specific styles */
    .facet-item.audit-pass {
        background: #10b98110;
        border-left: 1px solid #10b981;
        padding: 12px 0px 12px 12px;
    }

    .facet-item.audit-fail {
        background: #ffdfdf10;
        border-left: 1px solid #ff7171;
        padding: 12px 0px 12px 12px;
    }

    .requirement-audit-details {
        flex: 1;
        max-width: calc(100% - 12px);
    }

    .audit-details-toggle {
        background: none;
        border: 1px solid #5555556e;
        border-radius: 16px;
        padding: 4px 8px;
        cursor: pointer;
        color: #b0b0b0;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s;
    }

    .audit-details-toggle:hover {
        background: #ffffff12;
        border-color: #ffffff1f;
        color: #e0e0e0;
    }

    .audit-details-toggle svg {
        transition: transform 0.2s;
    }

    .audit-details-toggle svg.rotated {
        transform: rotate(180deg);
    }

    .audit-status-badge {
        background: none;
        border: 1px solid #5555556e;
        border-radius: 16px;
        padding: 4px 8px;
        color: #b0b0b0;
        font-size: 12px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }

    .entity-tables {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .entity-table-section h4 {
        margin: 0 0 8px 0;
        font-size: 13px;
        font-weight: 600;
        color: #e0e0e0;
    }

    .entity-table-section.pass h4 {
        color: #10b981;
    }

    .entity-table-section.fail h4 {
        color: #e87c7c;
    }

    .entity-table-container {
        border: 1px solid #5555556e;
        border-radius: 8px;
        overflow: hidden;
        background: #ffffff02;
    }

    .entity-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
    }

    .entity-table th {
        background: #ffffff12;
        color: #b0b0b0;
        padding: 8px 12px;
        text-align: left;
        font-weight: 500;
        border-bottom: 1px solid #5555556e;
    }

    .entity-table td {
        padding: 6px 12px;
        border-bottom: 1px solid #55555530;
        color: #e0e0e0;
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .entity-table tbody tr:hover {
        background: #ffffff08;
    }

    .entity-table .more-row td {
        text-align: center;
        font-style: italic;
        color: #9ca3af;
        padding: 12px;
    }
</style>