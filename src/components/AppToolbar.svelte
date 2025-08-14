<script>
    import * as Tooltip from "$lib/components/ui/tooltip";
    import { IFCModels, loadIfcModel, unloadIfcModel, auditIfcModel } from "$src/modules/api/api.svelte.js";
    import * as IDS from "$src/modules/api/ids.svelte.js";
    
    let fileInput = $state();
    let isAuditing = $state(false);
    let auditResults = $state(null);
    
    const handleFileSelect = async (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            
            // Check if it's an IFC file
            if (!file.name.toLowerCase().endsWith('.ifc')) {
                alert('Please select a valid IFC file (.ifc)');
                return;
            }
            
            try {
                await loadIfcModel(file);
            } catch (error) {
                alert(`Failed to load IFC model: ${error.message}`);
            }
        }
        
        // Reset input
        if (fileInput) {
            fileInput.value = '';
        }
    };
    
    const handleLoadModel = () => {
        fileInput?.click();
    };
    
    const handleUnloadModel = async (modelId) => {
        try {
            await unloadIfcModel(modelId);
        } catch (error) {
            alert(`Failed to unload model: ${error.message}`);
        }
    };
    
    const handleRunAudit = async () => {
        if (IFCModels.models.length === 0) {
            alert('Please load an IFC model first');
            return;
        }
        
        if (!IDS.Module.activeDocument) {
            alert('Please create or open an IDS document first');
            return;
        }
        
        try {
            isAuditing = true;
            auditResults = null;
            
            // Get the active IDS document XML
            const idsXml = await IDS.exportActiveDocument();
            
            // Run audit on all loaded models
            const results = [];
            for (const model of IFCModels.models) {
                const result = await auditIfcModel(model.id, idsXml);
                results.push({
                    modelId: model.id,
                    modelName: model.fileName,
                    result: result
                });
            }
            
            auditResults = results;
            console.log('Audit results:', auditResults);
            
        } catch (error) {
            alert(`Audit failed: ${error.message}`);
        } finally {
            isAuditing = false;
        }
    };
    
    const formatFileSize = (bytes) => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };
</script>

<div class="toolbar">
    <div class="buttons">
        <Tooltip.Provider>
            <Tooltip.Root disableHoverableContent="true">
                <Tooltip.Trigger>
                    <button class="tb-btn active" aria-label="Home">
                        <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/>
                        </svg>
                    </button>
                </Tooltip.Trigger>
                <Tooltip.Content side="right">
                    <p>Home</p>
                </Tooltip.Content>
            </Tooltip.Root>
            <Tooltip.Root disableHoverableContent="true">
                <Tooltip.Trigger>
                    <button class="tb-btn" aria-label="Bonsai Integration">
                        <svg style="height: 20px;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="32mm" height="32mm" version="1.1" viewBox="0 0 32 32" xml:space="preserve">
                            <defs><linearGradient id="a" x1="319.66" x2="414.22" y1="725.95" y2="631.1" gradientTransform="matrix(.34384 0 0 .34384 1065.6 -23.668)" gradientUnits="userSpaceOnUse"><stop stop-color="currentColor" offset="0" /><stop stop-color="currentColor" offset="1" /></linearGradient></defs>
                            <g transform="translate(-1274.3 -68)"><g transform="matrix(.89066 0 0 .89066 230.47 -102.44)" clip-rule="evenodd"><path d="m1177.3 192.49c-1.0334-2e-5 -1.8713 0.83759-1.8715 1.871v29.941c0 1.0336 0.8379 1.8716 1.8715 1.8715h19.461c0.4963-1.1e-4 0.9723-0.19737 1.3231-0.54839l7.8162-7.8161c0.7306-0.73081 0.7306-1.9154 0-2.6462l-5.0282-5.0282-2.3818 2.3818 3.9696 3.9696-6.3191 6.3191h-17.344v-26.946l17.321-0.0212 6.3429 6.3581-12.703 12.703-5.5574-5.5574 5.5574-5.5574 4.7635 4.7635 2.3818-2.3818-5.8217-5.8221c-0.7286-0.72842-1.9168-0.72974-2.6467 0l-7.6763 7.6763c-0.706 0.70636-0.733 1.8426-0.061 2.5817l7.7091 7.7091c0.7309 0.80387 1.9905 0.81846 2.7398 0.0317l14.796-14.864c0.7006-0.73553 0.6866-1.8956-0.032-2.614l-7.8253-7.8253c-0.351-0.35081-0.8269-0.54787-1.3231-0.54785z" fill="currentColor" fill-rule="evenodd"/><rect transform="matrix(.14035 0 0 .14035 1172 191.36)" x="-8.2421e-7" y="-1.0518e-16" width="256" height="256" fill="none"/></g></g>
                        </svg>
                    </button>
                </Tooltip.Trigger>
                <Tooltip.Content side="right">
                    <p>Bonsai Integration</p>
                </Tooltip.Content>
            </Tooltip.Root>
        </Tooltip.Provider>
    </div>
    <div class="content">
        <div class="content-header">
            <h1>IFC Models</h1>
            <button aria-label="Close Toolbar">
                <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.99994 10 7 11.9999l1.99994 2M12 5v14M5 4h14c.5523 0 1 .44772 1 1v14c0 .5523-.4477 1-1 1H5c-.55228 0-1-.4477-1-1V5c0-.55228.44772-1 1-1Z"/>
                </svg>
            </button>
        </div>
        
        <div class="content-body">
            <!-- File input (hidden) -->
            <input
                bind:this={fileInput}
                type="file"
                accept=".ifc"
                onchange={handleFileSelect}
                style="display: none;"
            />
            
            <!-- Load Model Button -->
            <div class="section">
                <button class="load-btn" onclick={handleLoadModel} disabled={IFCModels.isLoading}>
                    {#if IFCModels.isLoading}
                        <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 12a9 9 0 11-6.219-8.56"/>
                        </svg>
                        Loading...
                    {:else}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14,2 14,8 20,8"/>
                        </svg>
                        Load IFC Model
                    {/if}
                </button>
            </div>
            
            <!-- Loaded Models -->
            {#if IFCModels.models.length > 0}
                <div class="section">
                    <h3>Loaded Models</h3>
                    <div class="models-list">
                        {#each IFCModels.models as model}
                            <div class="model-item">
                                <div class="model-info">
                                    <div class="model-name">{model.fileName}</div>
                                    <div class="model-meta">
                                        <span class="model-size">{formatFileSize(model.fileSize)}</span>
                                        <span class="model-time">Loaded {model.loadedAt.toLocaleTimeString()}</span>
                                    </div>
                                </div>
                                <button class="unload-btn" onclick={() => handleUnloadModel(model.id)} title="Unload model" aria-label="Unload model">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M18 6L6 18M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>
                        {/each}
                    </div>
                </div>
                
                <!-- Run Audit Button -->
                <div class="section">
                    <button class="audit-btn" onclick={handleRunAudit} disabled={isAuditing || !IDS.Module.activeDocument}>
                        {#if isAuditing}
                            <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 12a9 9 0 11-6.219-8.56"/>
                            </svg>
                            Running Audit...
                        {:else}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                            </svg>
                            Run Audit
                        {/if}
                    </button>
                    {#if !IDS.Module.activeDocument}
                        <p class="help-text">Create or open an IDS document to enable auditing</p>
                    {/if}
                </div>
                
                <!-- Audit Results -->
                {#if auditResults}
                    <div class="section">
                        <h3>Audit Results</h3>
                        <div class="audit-results">
                            {#each auditResults as result}
                                <div class="audit-result">
                                    <div class="result-header">
                                        <span class="model-name">{result.modelName}</span>
                                    </div>
                                    <div class="result-content">
                                        <pre>{JSON.stringify(result.result, null, 2)}</pre>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            {:else}
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14,2 14,8 20,8"/>
                    </svg>
                    <p>No IFC models loaded</p>
                    <p class="help-text">Load an IFC model to begin auditing</p>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .content-body {
        padding-top: 15px;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .section {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .section h3 {
        margin: 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: #acacac;
    }
    
    .load-btn, .audit-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .load-btn:hover:not(:disabled), .audit-btn:hover:not(:disabled) {
        background: #2563eb;
    }
    
    .load-btn:disabled, .audit-btn:disabled {
        background: #9ca3af;
        cursor: not-allowed;
    }
    
    .audit-btn {
        background: #197148;
    }
    
    .audit-btn:hover:not(:disabled) {
        background: #059669;
    }
    
    .audit-btn:disabled {
        background: #ffffff24;
    }
    
    .spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .models-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .model-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem;
        border: 1px solid #e5e7eb24;
        border-radius: 0.375rem;
    }
    
    .model-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex: 1;
    }
    
    .model-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: #ffffffd9;
    }
    
    .model-meta {
        display: flex;
        gap: 0.75rem;
        font-size: 0.75rem;
        color: #6b7280;
    }
    
    .unload-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        background: none;
        color: #6b7280;
        border-radius: 0.25rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .unload-btn:hover {
        color: #dc2626;
    }
    
    .help-text {
        font-size: 0.75rem;
        color: #6b7280;
        margin: 0;
    }
    
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;
        color: #6b7280;
        flex: 1;
    }
    
    .empty-state svg {
        margin-bottom: 1rem;
        opacity: 0.5;
    }
    
    .empty-state p {
        margin: 0.25rem 0;
    }
    
    .empty-state p:first-of-type {
        font-weight: 500;
        color: #667286;
    }
    
    .audit-results {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        background: #000000;
    }
    
    .audit-result {
        border: 1px solid #e5e7eb24;
        border-radius: 0.375rem;
        overflow: hidden;
    }
    
    .result-header {
        padding: 0.75rem;
        border-bottom: 1px solid #e5e7eb24;
        font-weight: 500;
        font-size: 0.875rem;
    }
    
    .result-content {
        padding: 0.75rem;
    }
    
    .result-content pre {
        margin: 0;
        font-size: 0.75rem;
        color: #77869e;
        white-space: pre-wrap;
        word-wrap: break-word;
        max-height: 300px;
        overflow-y: auto;
    }
</style>