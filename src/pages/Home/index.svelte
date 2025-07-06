<script>
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import * as Menubar from "$lib/components/ui/menubar/index.js";
    import wasm from "../../modules/wasm/wasm.js";
    
    let output = '';
    let loading = false;
    let initialized = false;
    
    async function initWasm() {
        if (initialized) return;
        
        loading = true;
        output = 'Initializing WASM module...';
        
        try {
            await wasm.init();
            initialized = true;
            output = 'WASM module initialized successfully!';
        } catch (error) {
            output = `Error initializing WASM: ${error.message}`;
        } finally {
            loading = false;
        }
    }
    
    async function testGetPredefinedTypes() {
        if (!initialized) await initWasm();
        
        loading = true;
        output = 'Getting predefined types for IfcWall...';
        
        try {
            const types = await wasm.getPredefinedTypes('IFC4', 'IfcWall');
            output = `Predefined types for IfcWall: ${JSON.stringify(types, null, 2)}`;
        } catch (error) {
            output = `Error: ${error.message}`;
        } finally {
            loading = false;
        }
    }
    
    async function testGetEntityAttributes() {
        if (!initialized) await initWasm();
        
        loading = true;
        output = 'Getting entity attributes for IfcWall...';
        
        try {
            const attributes = await wasm.getEntityAttributes('IFC4', 'IfcWall');
            output = `Entity attributes for IfcWall: ${JSON.stringify(attributes, null, 2)}`;
        } catch (error) {
            output = `Error: ${error.message}`;
        } finally {
            loading = false;
        }
    }
    
    async function testCreateIDS() {
        if (!initialized) await initWasm();
        
        loading = true;
        output = 'Creating IDS instance...';
        
        try {
            const ids = await wasm.createIDS({
                title: "Building Elements Requirements",
                copyright: "Copyright (C) 2025",
                author: "me@seyan.co",
                date: new Date(),
                version: "1.0"
            });

            const spec = await wasm.addSpecification(ids, {
                name: "All walls must have a name",
                ifcVersion: ["IFC4"],
                usage: "required"
            });
            
            const entityFacet = await wasm.createEntityFacet({ name: 'IFCWALL', predefinedType: "IfcWall" });
            await wasm.addApplicability(ids, spec, entityFacet);

            const attributeFacet = await wasm.createAttributeFacet({ name: "Name" });
            await wasm.addRequirement(ids, spec, attributeFacet);

            const isValid = await wasm.validateIDS(ids);
            const xmlString = await wasm.exportIDS(ids);
            
            output = `IDS created successfully!
ID: ${ids}
Specification ID: ${spec}
Valid: ${isValid}
XML: ${xmlString}`;
        } catch (error) {
            output = `Error: ${error.message}`;
        } finally {
            loading = false;
        }
    }
</script>

<div class="app">
    <header class="app-header">
        <div class="logo"></div>
        <div class="menu">
            <Menubar.Root>
                <Menubar.Menu>
                    <Menubar.Trigger>File</Menubar.Trigger>
                    <Menubar.Content>
                        <Menubar.Item>
                            New IDS file
                            <Menubar.Shortcut>⌘N</Menubar.Shortcut>
                        </Menubar.Item>
                        <Menubar.Item>
                            Open IDS file
                            <Menubar.Shortcut>⌘O</Menubar.Shortcut>
                        </Menubar.Item>
                        <Menubar.Item>
                            Save IDS file
                            <Menubar.Shortcut>⌘S</Menubar.Shortcut>
                        </Menubar.Item>
                        <Menubar.Separator />
                        <Menubar.Item>Save to Google Drive</Menubar.Item>
                    </Menubar.Content>
                </Menubar.Menu>
                <Menubar.Menu>
                    <Menubar.Trigger>IFC</Menubar.Trigger>
                    <Menubar.Content>
                        <Menubar.Item>Open IFC model</Menubar.Item>
                        <Menubar.Separator />
                        <Menubar.Item>Run Audit</Menubar.Item>
                    </Menubar.Content>
                </Menubar.Menu>
                <Menubar.Menu>
                    <Menubar.Trigger>Help</Menubar.Trigger>
                    <Menubar.Content>
                        <Menubar.Item>OSArch Forum</Menubar.Item>
                        <Menubar.Separator />
                        <Menubar.Item>About</Menubar.Item>
                    </Menubar.Content>
                </Menubar.Menu>
            </Menubar.Root>
        </div>
    </header>
    <div class="main-body">
        <div class="toolbar">
            <div class="buttons">
                <Tooltip.Provider>
                    <Tooltip.Root disableHoverableContent="true">
                        <Tooltip.Trigger>
                            <button class="btn" aria-label="Home">
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
                            <button class="btn" aria-label="Bonsai Integration">
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
                    <h1>Home</h1>
                    <button aria-label="Close Toolbar">
                        <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.99994 10 7 11.9999l1.99994 2M12 5v14M5 4h14c.5523 0 1 .44772 1 1v14c0 .5523-.4477 1-1 1H5c-.55228 0-1-.4477-1-1V5c0-.55228.44772-1 1-1Z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div class="main-content">
            <div class="demo-container">
                <h2>WASM Module Demo</h2>
                <div class="demo-buttons">
                    <button on:click={initWasm} disabled={loading}>Initialize WASM</button>
                    <button on:click={testGetPredefinedTypes} disabled={loading}>Get Predefined Types</button>
                    <button on:click={testGetEntityAttributes} disabled={loading}>Get Entity Attributes</button>
                    <button on:click={testCreateIDS} disabled={loading}>Create IDS</button>
                </div>
                <div class="demo-output">
                    <h3>Output:</h3>
                    <pre>{output}</pre>
                </div>
            </div>
        </div>
    </div>
    <div class="app-ribbon">
        App ribbon
    </div>
</div>

<style>
    .demo-container {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
    }
    
    .demo-buttons {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }
    
    .demo-buttons button {
        padding: 10px 15px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .demo-buttons button:hover:not(:disabled) {
        background-color: #0056b3;
    }
    
    .demo-buttons button:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
    }
    
    .demo-output {
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 15px;
        background-color: #f8f9fa;
        color: black;
    }
    
    .demo-output h3 {
        margin-top: 0;
        margin-bottom: 10px;
    }
    
    .demo-output pre {
        background-color: #f1f3f4;
        padding: 10px;
        border-radius: 4px;
        overflow-x: auto;
        white-space: pre-wrap;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.4;
    }
</style>