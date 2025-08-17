<script>
    import * as Menubar from "$lib/components/ui/menubar";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as IDS from "$src/modules/api/ids.svelte.js";
    import * as API from "$src/modules/api/api.svelte.js";
    import { error, success, info } from "$src/modules/utils/toast.svelte.js";

    let { isOpen = false } = $props();

    function openForum() {
        window.open('https://community.osarch.org', '_blank');
    }
    
    function openAbout() {
        isOpen = true;
    }

    async function newIDSFile() {
        await IDS.createDocument();
    }

    async function openIDSFile() {
        try {
            await IDS.openDocument();
        } catch (err) {
            if (err.message !== 'File selection cancelled') {
                error('Error opening file: ' + err.message);
                console.error(err);
            }
        }
    }

    async function saveIDSFile() {
        if (!IDS.Module.activeDocument) {
            error('No document to save!');
            return;
        }
        try {
            await IDS.exportDocument(IDS.Module.activeDocument);
            success('Document saved successfully');
        } catch (err) {
            console.error("Error saving file: ", err);
            error('Error saving file: check console for details');
        }
    }

    async function runAudit() {
        try {
            await API.runAudit();
            success('Audit completed successfully');
        } catch (err) {
            console.error("Audit failed: ", err);
            error(`Audit failed: check console for details`);
        }
    }
</script>

<header class="app-header">
    <div class="logo"></div>
    <div class="menu">
        <Menubar.Root>
            <Menubar.Menu>
                <Menubar.Trigger>File</Menubar.Trigger>
                <Menubar.Content>
                    <Menubar.Item onclick={newIDSFile}>
                        New IDS file
                        <Menubar.Shortcut>⌘N</Menubar.Shortcut>
                    </Menubar.Item>
                    <Menubar.Item onclick={openIDSFile}>
                        Open IDS file
                        <Menubar.Shortcut>⌘O</Menubar.Shortcut>
                    </Menubar.Item>
                    <Menubar.Item onclick={saveIDSFile}>
                        Save IDS file
                        <Menubar.Shortcut>⌘S</Menubar.Shortcut>
                    </Menubar.Item>
                    <Menubar.Separator />
                    <Menubar.Item onclick={() => info("Coming soon!")}>Save to Google Drive</Menubar.Item>
                </Menubar.Content>
            </Menubar.Menu>
            <Menubar.Menu>
                <Menubar.Trigger>IFC</Menubar.Trigger>
                <Menubar.Content>
                    <Menubar.Item onclick={API.openIfc}>Open IFC model</Menubar.Item>
                    <Menubar.Separator />
                    <Menubar.Item onclick={runAudit}>Run Audit</Menubar.Item>
                </Menubar.Content>
            </Menubar.Menu>
            <Menubar.Menu>
                <Menubar.Trigger>Help</Menubar.Trigger>
                <Menubar.Content>
                    <Menubar.Item onclick={openForum}>OSArch Forum</Menubar.Item>
                    <Menubar.Separator />
                    <Menubar.Item onclick={openAbout}>About</Menubar.Item>
                </Menubar.Content>
            </Menubar.Menu>
        </Menubar.Root>
    </div>
</header>

<!-- About Dialog -->
<Dialog.Root bind:open={isOpen}>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>About IfcTester</Dialog.Title>
        </Dialog.Header>
        <div class="py-4">
            <p class="text-sm text-muted-foreground">
                IfcTester (Next). Designed and developed by Sayan J. Das as their Google Summer of Code 2025 project under the mentorship of Dion Moult.
            </p>
        </div>
        <Dialog.Footer>
            <Dialog.Close asChild>
                <button class="btn">Close</button>
            </Dialog.Close>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>