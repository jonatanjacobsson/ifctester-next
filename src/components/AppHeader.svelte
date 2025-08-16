<script>
    import * as Menubar from "$lib/components/ui/menubar";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as IDS from "$src/modules/api/ids.svelte.js";

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
        } catch (error) {
            if (error.message !== 'File selection cancelled') {
                alert('Error opening file: ' + error.message);
                console.error(error);
            }
        }
    }

    async function saveIDSFile() {
        if (!IDS.Module.activeDocument) {
            alert('No document to save.');
            return;
        }
        try {
            await IDS.exportDocument(IDS.Module.activeDocument);
        } catch (error) {
            alert('Error saving file: ' + error.message);
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