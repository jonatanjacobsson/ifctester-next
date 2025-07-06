/**
 * WASM worker
*/

import { MessageType } from '../wasm';
import config from '../../../config.json';
import * as IDS from './ids.js';
import * as API from './api';

let pyodide = null;
let ready = false;

self.addEventListener('message', async (event) => {
    console.log("[worker] Received message:", event.data);
    const { type, payload, id } = event.data;

    try {
        switch (type) {
            case MessageType.INIT:
                await initializePyodide();
                self.postMessage({
                    type: MessageType.READY,
                    payload: { success: true },
                    id
                });
                break;

            case MessageType.API_CALL:
                if (!ready) {
                    throw new Error('[worker] Pyodide not initialized');
                }
                const result = await handleApiCall(payload);
                self.postMessage({
                    type: MessageType.API_RESPONSE,
                    payload: result,
                    id
                });
                break;

            default:
                throw new Error(`[worker] Unknown message type: ${type}`);
        }
    } catch (error) {
        self.postMessage({
            type: MessageType.ERROR,
            payload: {
                message: error.message,
                stack: error.stack
            },
            id
        });
    }
});

async function initializePyodide() {
    if (ready) return;

    // Load Pyodide
    const { loadPyodide } = await import('https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide.mjs');
    pyodide = await loadPyodide({
        convertNullToNone: true
    });

    // Load required packages
    await pyodide.loadPackage('micropip');
    await pyodide.loadPackage('numpy');

    const micropip = pyodide.pyimport('micropip');

    // Install IfcOpenShell wheel
    await micropip.install(config.wasm.wheel_url);

    // Install IfcTester dependencies
    await micropip.install(config.wasm.odfpy_url);
    await pyodide.loadPackage("shapely");

    // Install IfcTester
    await micropip.install('ifctester');

    // Initialize IDS and API
    await API.init(pyodide);
    await IDS.init(pyodide);

    console.log("[worker] Environment initialized");

    ready = true;
}

async function handleApiCall({ method, args = [] }) {
    if (method in API.API) {
        return await API.API[method](...args);
    } else if (method in IDS.API) {
        return await IDS.API[method](...args);
    } else {
        throw new Error(`[worker] Unknown API method: ${method}`);
    }
}