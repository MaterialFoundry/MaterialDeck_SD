import streamDeck from "@elgato/streamdeck";
import WebSocket, { WebSocketServer } from 'ws';
import { debug, info, foundryVersion, moduleVersion, settingsConfig, setSettingsConfig, sendToPropertyInspector, setTitle, setImage, getLastSection, sendData, setBufferedImage, removeBufferedImage, clearImageBuffer, globalSyncedSettings, pageSyncedSettings } from "./common.js";

export class Websocket {
    wss = undefined;
    ip = "localhost";
    port;
    buffer = [];

    async start(port) {

        if (!port) {
            let globalSettings = await streamDeck.settings.getGlobalSettings();
            if (!globalSettings.wsPort) {
                globalSettings.wsPort = 3005;
                streamDeck.settings.setGlobalSettings(globalSettings);
            }
            this.port = globalSettings.wsPort;
        }
        else 
            this.port = port;

        if (this.wss) {
            debug('Closing existing websocket connection');
            this.wss?.clients?.forEach(async function each(client) {
                await client.close();
            });
            await this.wss.close();
        }

        this.wss = new WebSocketServer({ port: this.port });
        let parent = this;
        info(`Websocket server started: "${this.ip}:${this.port}"`);
        
        this.wss.on('connection', function connection(ws) {
            parent.buffer = [];
            parent.sendInitialization();
            info(`Opened websocket connection`, this.clients?.size);
            //info('buffer', parent.buffer)

            ws.on('message', function message(data) {
                parent.analyzeMessage(data); 
            });
            
            ws.on('close', function close() {
                info(`Closed websocket`, this.clients?.size ? this.clients?.size : '0');
                streamDeck.ui.current?.sendToPropertyInspector({
                    type: 'connectionClosed'
                })
            })
        });
    }

    async sendInitialization() {
    
        let devices = [];
        for (let d of streamDeck.devices) {
            if (!d.isConnected) continue;

            let buttons = [];
            for (let a of d.actions) {
                buttons.push({
                    action: getLastSection(a.manifestId),
                    context: a.id,
                    device: d.id,
                    payload: { settings: await a.getSettings() }
                })
            }

            const data = {
                device: d.id,
                deviceInfo: {
                    name: d.name,
                    size: d.size,
                    type: d.type
                },
                buttons
            }
            devices.push(data);
        }

        this.send({
            type: 'connected',
            version: streamDeck.info.plugin.version,
            devices,
            syncedSettings: {
                global: globalSyncedSettings,
                page: pageSyncedSettings
            }
        })
    }

    send(msg) {
        const data = JSON.stringify(msg);
        //debug(`sending message: `,msg);

        if (this.wss?.clients) {
            this.wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        }
        else
            this.buffer.push(msg);
        
    }

    analyzeMessage(msg) {
        //debug(`Received: ${msg}`);
        const data = JSON.parse(msg);
        //debug('data', data)
        if (data.type === 'init') {
            clearImageBuffer(data);
            setSettingsConfig(data.settingsConfig);
            sendToPropertyInspector({
                settingsConfig
            })
        }
        else if (data.event === 'setTitle') setTitle(data);
        else if (data.event === 'setImage') setImage(data);
        else if (data.type === 'settingsConfig') setSettingsConfig(data.settingsConfig, true);
        else if (data.event === 'sendData') sendData(data.payload);
        else if (data.event === 'setBufferedImage') setBufferedImage(data);
        else if (data.event === 'removeBufferedImage') removeBufferedImage(data);
        else {
            debug('Unknown WS message', data)
        }
    }
}
