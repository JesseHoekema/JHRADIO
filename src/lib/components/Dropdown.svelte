<script lang="ts">
 import CheckIcon from "@lucide/svelte/icons/check";
 import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
 import { tick } from "svelte";
 import * as Command from "$lib/components/ui/command/index.js";
 import * as Popover from "$lib/components/ui/popover/index.js";
 import { Button } from "$lib/components/ui/button/index.js";
 import { cn } from "$lib/utils.js";
 
 interface Item {
  value: string;
  label: string;
 }
 
 interface Props {
  items: Item[];
  placeholder?: string;
  emptyMessage?: string;
  width?: string;
  onSelect?: (value: string) => void;
  initialValue?: string;
  loading?: boolean;
  value?: string;
 }
 
 let {
  items,
  placeholder = "Select an item...",
  emptyMessage = "No item found.",
  width = "w-[200px]",
  onSelect,
  initialValue = "",
  loading = false,
  value = $bindable("")
 }: Props = $props();
 
 let open = $state(false);
 let searchQuery = $state("");
 
 // Sync value with initialValue prop on mount
 $effect(() => {
  if (initialValue && !value) {
   value = initialValue;
  }
 });
 
 // Reset search query when dropdown closes
 $effect(() => {
  if (!open) {
   searchQuery = "";
  }
 });
 
 const selectedValue = $derived(
  items.find((f) => f.value === value)?.label
 );
 
 // Filter items based on search query and ensure unique values
 const filteredItems = $derived(
  (() => {
   const query = searchQuery.toLowerCase().trim();
   const itemsToFilter = query 
     ? items.filter((item) =>
         item.label.toLowerCase().includes(query) ||
         item.value.toLowerCase().includes(query)
       )
     : items;
   
   // Remove duplicates based on value
   const seen = new Set();
   return itemsToFilter.filter((item) => {
     if (seen.has(item.value)) {
       return false;
     }
     seen.add(item.value);
     return true;
   });
  })()
 );
 
 function handleSelect(itemValue: string) {
  value = itemValue;
  onSelect?.(itemValue);
  open = false;
 }
</script>
 
<Popover.Root bind:open>
 <Popover.Trigger>
  {#snippet child({ props })}
   <Button
    {...props}
    variant="outline"
    class="{width} justify-between"
    role="combobox"
    aria-expanded={open}
   >
   {#if loading}
    Loading...
   {:else}
    {selectedValue || placeholder}
    <ChevronsUpDownIcon class="opacity-50" />
   {/if}
   </Button>
  {/snippet}
 </Popover.Trigger>
 <Popover.Content class="p-0 w-[400px]" align="start">
  <Command.Root shouldFilter={false}>
   <Command.Input 
    placeholder="Search..." 
    bind:value={searchQuery}
   />
   <Command.List>
    <Command.Empty>{emptyMessage}</Command.Empty>
    <Command.Group>
     {#each filteredItems as item (item.value)}
      <Command.Item
       value={item.value}
       onSelect={() => handleSelect(item.value)}
       class="whitespace-normal"
      >
       {#snippet children()}
        <CheckIcon
         class={cn("mr-2 h-4 w-4 flex-shrink-0", value !== item.value && "text-transparent")}
        />
        <span class="flex-1">{item.label}</span>
       {/snippet}
      </Command.Item>
     {/each}
    </Command.Group>
   </Command.List>
  </Command.Root>
 </Popover.Content>
</Popover.Root>