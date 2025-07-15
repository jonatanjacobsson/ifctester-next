<script>
    import * as IDS from "$src/modules/api/ids.svelte.js";
    
    let activeDocument = $derived(IDS.Module.activeDocument ? IDS.Module.documents[IDS.Module.activeDocument.id] : null);
    let activeSpecification = $derived(activeDocument && IDS.Module.activeDocument?.specification !== null && activeDocument.specifications?.specification ? 
        activeDocument.specifications.specification[IDS.Module.activeDocument.specification] : null);

    const getProp = (prop) => {
        return activeSpecification?.[prop] ?? "";
    };
    
    const setProp = (prop, value) => {
        activeSpecification[prop] = value;
    };

    const addIfcVersion = (e, version) => {
        if (activeSpecification) {
            if (!("@ifcVersion" in activeSpecification)) activeSpecification["@ifcVersion"] = [];
            if (e.target.checked) {
                if (!activeSpecification["@ifcVersion"].includes(version)) {
                    activeSpecification["@ifcVersion"] = [...activeSpecification["@ifcVersion"], version];
                }
            } else {
                activeSpecification["@ifcVersion"] = activeSpecification["@ifcVersion"].filter(v => v !== version);
            }
        }
    };
</script>

<div class="spec-info">
    <div class="form-grid">
        <div class="form-group">
            <label for="spec-name">Name</label>
            <input id="spec-name" type="text" bind:value={() => getProp("@name"), (v) => setProp("@name", v)} placeholder="Enter specification name">
        </div>
        <div class="form-group">
            <label for="spec-identifier">Identifier</label>
            <input id="spec-identifier" type="text" bind:value={() => getProp("@identifier"), (v) => setProp("@identifier", v)} placeholder="Enter identifier">
        </div>
        <div class="form-group">
            <!-- TODO: Usage should set @minOccurs and @maxOccurs, fix this -->
            <label for="spec-cardinality">Usage</label>
            <select id="spec-cardinality">
                <option value="required">Required</option>
                <option value="optional">Optional</option>
                <option value="prohibited">Prohibited</option>
            </select>
        </div>
        <div class="form-group full-width">
            <label>IFC Version</label>
            <div class="radio-group">
                <label class="radio-label">
                    <input type="checkbox" value="IFC2X3" checked={activeSpecification?.["@ifcVersion"]?.includes('IFC2X3')} onchange={(e) => addIfcVersion(e, 'IFC2X3')}>
                    IFC2X3
                </label>
                <label class="radio-label">
                    <input type="checkbox" value="IFC4" checked={activeSpecification?.["@ifcVersion"]?.includes('IFC4')} onchange={(e) => addIfcVersion(e, 'IFC4')}>
                    IFC4
                </label>
                <label class="radio-label">
                    <input type="checkbox" value="IFC4X3_ADD2" checked={activeSpecification?.["@ifcVersion"]?.includes('IFC4X3_ADD2')} onchange={(e) => addIfcVersion(e, 'IFC4X3_ADD2')}>
                    IFC4X3_ADD2
                </label>
            </div>
        </div>
        <div class="form-group full-width">
            <label for="spec-description">Description</label>
            <textarea id="spec-description" bind:value={() => getProp("@description"), (v) => setProp("@description", v)} placeholder="Enter description" rows="3"></textarea>
        </div>
        <div class="form-group full-width">
            <label for="spec-instructions">Instructions</label>
            <textarea id="spec-instructions" bind:value={() => getProp("@instructions"), (v) => setProp("@instructions", v)} placeholder="Enter instructions" rows="3"></textarea>
        </div>
    </div>
</div>