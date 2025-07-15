<script>
    import * as Tooltip from "$lib/components/ui/tooltip";
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
            <h1>Home</h1>
            <button aria-label="Close Toolbar">
                <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.99994 10 7 11.9999l1.99994 2M12 5v14M5 4h14c.5523 0 1 .44772 1 1v14c0 .5523-.4477 1-1 1H5c-.55228 0-1-.4477-1-1V5c0-.55228.44772-1 1-1Z"/>
                </svg>
            </button>
        </div>
    </div>
</div>