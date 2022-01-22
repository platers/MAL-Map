<script lang="ts">
    import Slider from "@smui/slider/src/Slider.svelte";
    import { Writable } from "svelte/store";
    export let value: Writable<number>;
    export let min: number;
    export let max: number;
    export let step: number;
    export let label: string;
</script>

<div class="setting-item mod-slider">
    <div class="setting-item-info">
        {label}: {$value}
    </div>
    <Slider bind:value={$value} {min} {max} {step} {label} />
</div>

<style>
    .setting-item {
        align-items: center;
        border-top: 1px solid var(--background-modifier-border);
        padding-top: var(--scale-8-1);
        padding-bottom: var(--scale-8-1);
        margin-right: 0;
    }

    .setting-item:first-child {
        border-top: none;
    }

    .setting-item.mod-slider {
        flex-direction: column;
        width: 100%;
    }

    .setting-item-info {
        flex: 1 1 auto;
        flex-grow: 1;
        width: 100%;
        margin-right: 0;
        font-size: 14px;
        display: inline-block;
        color: var(--color-d-gray-10);
    }
</style>
