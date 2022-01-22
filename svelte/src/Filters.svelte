<script lang="ts">
    let filters_active = false;
    function clickCollapsible(e: Event) {
        filters_active = !filters_active;
        let target = e.target as HTMLElement;
        let content = target.nextElementSibling as HTMLElement;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    }
</script>

<button class="collapsible" on:click={(e) => clickCollapsible(e)}>
    {#if filters_active}
        <i class="fa fa-caret-down fa-caret" />
    {:else}
        <i class="fa fa-caret-right fa-caret" />
    {/if}
    Filters
</button>
<div class="tree-item-children">
    <slot />


    <!-- <div class="setting-item mod-slider">
        <div class="setting-item-info">
            Score threshold: {$settings.scoreThreshold}
        </div>
        <Slider
            bind:value={$settings.scoreThreshold}
            min={0}
            max={10}
            step={0.01}
            label="Popularity threshold"
        />
    </div>
    <div class="setting-item mod-slider">
        <div class="setting-item-info">
            Year: {$settings.startYear} - {$settings.endYear}
        </div>
        <Slider
            range
            bind:start={$settings.startYear}
            bind:end={$settings.endYear}
            min={1960}
            max={2026}
            step={1}
            label="Year range"
        />
    </div> -->
</div>

<style>
    .collapsible {
        cursor: pointer;
        padding: 0;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        outline: none;
        font-size: 15px;
        color: var(--color-d-gray-20);
    }

    .fa-caret {
        margin-right: 5px;
        width: 10px;
    }
    .tree-item-children {
        margin-top: 8px;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--background-modifier-border);
        /* margin-left: 20px; */
        width: 100%;

        max-height: 0;
        overflow: hidden;
        transition: max-height 0.2s ease-out;
    }

   
   
</style>
