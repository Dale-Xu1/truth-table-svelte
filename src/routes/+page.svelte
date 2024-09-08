<script lang="ts">
import Tree from "../lib/parser/Tree"
import Parser from "../lib/parser/Parser"
import Table, { Column } from "../lib/table/Table"

let table: Table | null = null
let error: string | null = null

let input: string = ""
let order: string = ""

$: columns = table === null ? [] : (table.identifiers as Column[]).concat(table.columns)

function submit()
{
    // Parse equation
    let parser = new Parser(input)

    let result = parser.parse()
    if (result instanceof Tree)
    {
        // Compile tree to table
        table = new Table()
        table.compile(result, order.replaceAll(" ", "").split(","))

        error = null
    }
    else error = result
}

</script>

<svelte:head>
    <title>Truth Table Generator</title>
</svelte:head>
<form on:submit={submit}>
    <input type="text" bind:value={input}>
    <input type="text" bind:value={order}>
    <input type="submit" value="Generate" />
</form>
{#if error !== null}
    <span class="error">{error}</span>
{/if}
{#if table !== null}
    <div class="table">
        {#each columns as column}
            <div>
                <div class="box">{column.string}</div>
                {#each column.column as row}
                    {#if row}
                        <div class="box true">T</div>
                    {:else}
                        <div class="box false">F</div>
                    {/if}
                {/each}
            </div>
        {/each}
    </div>
{/if}
<style>
:global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, Helvetica, sans-serif;
}

form {
    display: flex;
    margin: 16px;
}

input {
    margin-right: 8px;
    padding: 4px;
    border: 1px solid;
    border-radius: 0;
}

.error {
    margin: 16px;
    color: red;
}

.table {
    max-width: fit-content;
    margin: 16px;
    display: flex;
    border-bottom: 1px solid black;
    border-right: 1px solid black;
}

.box {
    min-width: 12px;
    padding: 8px;
    height: 36px;
    border-top: 1px solid black;
    border-left: 1px solid black;
    text-align: center;
}

.true {
    color: green;
}

.false {
    color: red;
}

</style>
