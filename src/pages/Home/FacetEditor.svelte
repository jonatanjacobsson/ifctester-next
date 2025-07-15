<script>
    /**
     * Applicability facets wont have: "@uri", "@instructions", "@cardinality"
     * @ in name --> simple string value
     * else --> can be simpleValue, Restriction or list of Restrictions
    */
    let { facet, facetType, activeTab, removeFacet, index } = $props();

    const getSpecialProp = (prop) => {
        return facet[prop] ?? "";
    };
    const setSpecialProp = (prop, value) => {
        facet[prop] = value;
    };

    const getProp = (type, prop) => {
        if (type == "simpleValue") {
            return facet[prop]?.simpleValue ?? "";
        }
    };
    const setProp = (type, prop, value) => {
        if (type == "simpleValue") {
            if (!facet[prop]) facet[prop] = {};
            facet[prop].simpleValue = value;
        }
    };
</script>

<div class="restriction-item">
    <div class="restriction-header">
        <span class="restriction-type">{facetType.toUpperCase()}</span>
        <span class="restriction-name">{facet?.name?.simpleValue || facetType}</span>
        <button class="btn-delete" onclick={() => removeFacet(facetType, index)} aria-label="Delete Restriction">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
        </button>
    </div>
    <div class="restriction-form">
        {#if facetType === 'entity'}
            <div class="form-group">
                <label>Entity Name</label>
                <input type="text" bind:value={() => getProp("simpleValue", "name"), (v) => setProp("simpleValue", "name", v)} placeholder="e.g., IfcWall">
            </div>
            <div class="form-group">
                <label>Predefined Type</label>
                <input type="text" bind:value={() => getProp("simpleValue", "predefinedType"), (v) => setProp("simpleValue", "predefinedType", v)} placeholder="e.g., SOLIDWALL">
            </div>
        {:else if facetType === 'attribute'}
            <div class="form-group">
                <label>Attribute Name</label>
                <input type="text" bind:value={() => getProp("simpleValue", "name"), (v) => setProp("simpleValue", "name", v)} placeholder="e.g., Name">
            </div>
            <div class="form-group">
                <label>Value</label>
                <input type="text" bind:value={() => getProp("simpleValue", "value"), (v) => setProp("simpleValue", "value", v)} placeholder="Optional value">
            </div>
        {:else if facetType === 'property'}
            <div class="form-group">
                <label>Property Set</label>
                <input type="text" bind:value={() => getProp("simpleValue", "propertySet"), (v) => setProp("simpleValue", "propertySet", v)} placeholder="e.g., Pset_WallCommon">
            </div>
            <div class="form-group">
                <label>Base Name</label>
                <input type="text" bind:value={() => getProp("simpleValue", "baseName"), (v) => setProp("simpleValue", "baseName", v)} placeholder="e.g., FireRating">
            </div>
            <div class="form-group">
                <label>Value</label>
                <input type="text" bind:value={() => getProp("simpleValue", "value"), (v) => setProp("simpleValue", "value", v)} placeholder="Optional value">
            </div>
            <div class="form-group">
                <label>Data Type</label>
                <input type="text" bind:value={() => getSpecialProp('@dataType'), (v) => setSpecialProp('@dataType', v)} placeholder="Optional data type">
            </div>
        {:else if facetType === 'material'}
            <div class="form-group">
                <label>Material Value</label>
                <input type="text" bind:value={() => getProp("simpleValue", "value"), (v) => setProp("simpleValue", "value", v)} placeholder="e.g., Concrete">
            </div>
        {:else if facetType === 'classification'}
            <div class="form-group">
                <label>System</label>
                <input type="text" bind:value={() => getProp("simpleValue", "system"), (v) => setProp("simpleValue", "system", v)} placeholder="e.g., Uniclass 2015">
            </div>
            <div class="form-group">
                <label>Value</label>
                <input type="text" bind:value={() => getProp("simpleValue", "value"), (v) => setProp("simpleValue", "value", v)} placeholder="e.g., EF_25_10_25">
            </div>
        {:else if facetType === 'partOf'}
            <div class="form-group">
                <label>Entity Name</label>
                <input type="text" bind:value={() => getProp("simpleValue", "name"), (v) => setProp("simpleValue", "name", v)} placeholder="e.g., IfcSpace">
            </div>
            <div class="form-group">
                <label>Predefined Type</label>
                <input type="text" bind:value={() => getProp("simpleValue", "predefinedType"), (v) => setProp("simpleValue", "predefinedType", v)} placeholder="e.g., SOLIDWALL">
            </div>
            <div class="form-group">
                <label>Relation</label>
                <select bind:value={() => getSpecialProp("@relation"), (v) => setSpecialProp("@relation", v)}>
                    <option value="">Select relation...</option>
                    <option value="IFCRELAGGREGATES">IFCRELAGGREGATES</option>
                    <option value="IFCRELASSIGNSTOGROUP">IFCRELASSIGNSTOGROUP</option>
                    <option value="IFCRELCONTAINEDINSPATIALSTRUCTURE">IFCRELCONTAINEDINSPATIALSTRUCTURE</option>
                    <option value="IFCRELNESTS">IFCRELNESTS</option>
                    <option value="IFCRELVOIDSELEMENT IFCRELFILLSELEMENT">IFCRELVOIDSELEMENT IFCRELFILLSELEMENT</option>
                </select>
            </div>
        {/if}
        {#if activeTab === 'requirements'}
            {#if facetType !== 'entity'}
                <div class="form-group">
                    <label>Cardinality</label>
                    <select bind:value={() => getSpecialProp("@cardinality"), (v) => setSpecialProp("@cardinality", v)}>
                        <option value="required">Required</option>
                        <option value="optional">Optional</option>
                        <option value="prohibited">Prohibited</option>
                    </select>
                </div>
            {/if}
            <div class="form-group full-width">
                <label>Instructions</label>
                <textarea bind:value={() => getSpecialProp("@instructions"), (v) => setSpecialProp("@instructions", v)} placeholder="Optional instructions for IFC authors" rows="2"></textarea>
            </div>
        {/if}
    </div>
</div>