import streamDeck  from "@elgato/streamdeck";
import { Websocket } from "./websocket.js"
import { fontData } from "./fontData.js";
import { ImageBuffer } from "./imageBuffer.js";
import objectPath from "object-path";

export let websocketServer = new Websocket();
export let settingsConfig = {};
export let foundryVersion;
export let moduleVersion;
export let pageSyncedSettings = {};
export let globalSyncedSettings = {};
let syncTable = {};

let imageBuffer = new ImageBuffer;

export function debug() {
    streamDeck.logger.debug(...arguments);
}

export function info() {
    streamDeck.logger.info(...arguments);
}

export function error() {
    streamDeck.logger.error(...arguments);
}

function findSyncedSettings(obj, syncedSettings) {
    const synced = obj.filter(s => s.sync);
    for (let s of synced) objectPath.push(syncedSettings, [s.sync], s.id);
    
    const wrappers = obj.filter(s => s.settings);
    for (let w of wrappers) findSyncedSettings(w.settings, syncedSettings);
}

function generateSyncTable(settingsConfig) {
    for (let [action, settings] of Object.entries(settingsConfig)) {
        let syncedSettings = {};
        findSyncedSettings(settings, syncedSettings)
        syncTable[action] = syncedSettings;
    }
}


export async function setSettingsConfig(conf, refresh=false) {
    //debug('setSettingsConf', conf)
    for (let action of Object.keys(conf)) {
        //debug('conf', action, conf[action])
        settingsConfig[action] = conf[action];
    }
    //settingsConfig = conf;
    if (refresh)
        sendToPropertyInspector({settingsConfig:conf})
     
    generateSyncTable(settingsConfig);

    if (Object.keys(globalSyncedSettings).length === 0) {
        //Check each device
        for (let d of streamDeck.devices) {
            //Check each button
            for (let button of d.actions) {
                const action = getLastSection(button.manifestId);
                let settings = await button.getSettings();
                for (let [syncKey, syncSettings] of Object.entries(syncTable[action])) {
                    const syncSetting = objectPath.get(settings, syncKey);
                    if (syncSetting !== 'global') continue;
                    for (let sett of syncSettings) 
                        objectPath.push(globalSyncedSettings, [action, syncKey], {key: sett, value: objectPath.get(settings, sett)})
                }

            }
        }
    }
    if (Object.keys(pageSyncedSettings).length === 0) {
        //Check each device
        for (let d of streamDeck.devices) {
            //Check each button
            for (let button of d.actions) {
                const action = getLastSection(button.manifestId);
                let settings = await button.getSettings();
                for (let [syncKey, syncSettings] of Object.entries(syncTable[action])) {
                    const syncSetting = objectPath.get(settings, syncKey);
                    if (!syncSetting || syncSetting === 'false') continue;
                    for (let sett of syncSettings) 
                        objectPath.push(pageSyncedSettings, [action, syncKey], {key: sett, value: objectPath.get(settings, sett)})
                }
            }
        }
    }

}
 
export function getLastSection(val) {
    const split = val.split('.');
    const len = split.length-1;
    return split[len];
}

export function transmitButtonEvent(ev) {
    const action = getLastSection(ev.action.manifestId);
    const context = ev.action.id;
    const device = ev.action.device.id;

    const json = {
        action,
        context,
        device,
        event: ev.type,
        payload: ev.payload,
        syncedSettings: {
            global: globalSyncedSettings,
            page: pageSyncedSettings
        }
    }
    websocketServer.send(json);
    //debug('transmitButtonEvent', ev.type, json)
}

export function sendToPropertyInspector(payload) {
    streamDeck.ui.current?.sendToPropertyInspector(payload);
}

export async function onSendToPlugin(ev) {
    const payload = ev.payload;
    const action = ev.action.manifestId;
    const context = ev.action.id;
    const device = ev.action.device.id
    //debug('rec from PI:', payload, action, context, device);

    if (payload.type === 'setSettings') {
        ev.type = 'didReceiveSettings';
        transmitButtonEvent(ev);
        await ev.action.setSettings(payload.settings)
    }
    else if (payload.type === 'syncedSettingChanged') {
        onSyncedSettingChange(payload.setting, action, context, device, payload.syncType)
    }
    else if (payload.type === 'getSyncedSettings') {
        onGetSyncedSettings(payload.key, payload.settings, payload.syncType, action, context, device);
    }
    else if (payload.type === 'setWebsocketPort') {
        setWebsocketPort(payload.wsPort, true)
    }
    else if (payload.type === 'openUrl') {
        streamDeck.system.openUrl(payload.url);
    }
}

/**
 * Search if a setting corresponds with a global synced setting
 */
export async function searchSyncedGlobalSettings(settings, action) {

    //debug('settings', action, settings)
    let changed = false;

    //Store global synced settings if they do not exist
    if (!globalSyncedSettings[action]) {
        if (syncTable[action]) {
            for (let [syncKey, syncSettings] of Object.entries(syncTable[action])) {
                const syncSetting = objectPath.get(settings, syncKey);
                if (syncSetting !== 'global') continue;
                for (let sett of syncSettings) 
                    objectPath.push(globalSyncedSettings, [action, syncKey], {key: sett, value: objectPath.get(settings, sett)})
            }
        }
    }
    //Otherwise check if button settings need to be changed to global settings
    else {
        for (let [syncKey, syncSettings] of Object.entries(globalSyncedSettings[action])) {
            const synced = objectPath.get(settings, syncKey);
            if (!synced || synced === 'false' || syncSettings.length === 0) continue;
    
            for (let sett of syncSettings) {
                objectPath.set(settings, sett.key, sett.value);
                changed = true;
            }
        }
    }

    //Store page synced settings if they do not exist
    if (!pageSyncedSettings[action]) {
        if (syncTable[action]) {
            for (let [syncKey, syncSettings] of Object.entries(syncTable[action])) {
                const syncSetting = objectPath.get(settings, syncKey);
                if (!syncSetting || syncSetting === 'false' || syncSetting === 'global') continue;
                for (let sett of syncSettings) 
                    objectPath.push(pageSyncedSettings, [action, syncKey], {key: sett, value: objectPath.get(settings, sett)})
            }
        }
    }

    return changed;
}

/**
 * If PI requests synced settings
 */
async function onGetSyncedSettings(key, settings, syncType, action, context, device) {
    //debug('getSynced', key, settings, syncType, action);
    let syncedSettings = [];
    if (syncType === true || syncType === 'page') {
        const d = streamDeck.devices.find(d => d.id === device);
        if (!d) return;
        const buttons = d.actions.filter(b => b.manifestId === action && b.id !== context);
        for (let button of buttons) {
            let buttonSettings = await button.getSettings();
            let val = getNestedObjectVal(key, buttonSettings)
            if (!val || val !== syncType) continue;
            for (let s of settings)
                syncedSettings.push({key: s, value: getNestedObjectVal(s, buttonSettings)});
          
            break;
        }
    }
    if (syncType === 'global') {
        syncedSettings = globalSyncedSettings[getLastSection(action)]?.[key];
    }
    //debug('syncedSettings', syncedSettings)
    if (syncedSettings && syncedSettings.length > 0) {
        sendToPropertyInspector({syncedSettings})
        return syncedSettings;
    }
    else
        return false
}

function getNestedObjectVal(key, obj) {
    if (!obj) return;
    const syncSplit = key.split('.');
    let sett = structuredClone(obj);
    for (let segment of syncSplit) {
        sett = sett[segment]
        if (!sett) break;
    }
    return sett;
}

/**
 * If a synced settings was changed, search all buttons of this device for settings that have to be changed
 */
async function onSyncedSettingChange(data, action, context, device, syncType='page') {
    action = getLastSection(action);

    //debug('sync changed. Data:', data, 'Sync:', data.sync, syncSplit, 'Setting:', data.setting, 'Action:', action, 'SyncType', syncType);

    //Store changes
    objectPath.ensureExists(syncType === 'page' ? pageSyncedSettings : globalSyncedSettings, [action, data.sync], [])
    let storedSyncedSettings = objectPath.get(syncType === 'page' ? pageSyncedSettings : globalSyncedSettings, [action, data.sync])

    if (data.setting) {
        let existing = storedSyncedSettings.find(s => s.key === data.setting.key);
        if (existing) existing.value = data.setting.value;
        else storedSyncedSettings.push(data.setting)
    } 
    if (data.settings) {
        storedSyncedSettings = data.settings;
    }

    objectPath.set(syncType === 'page' ? pageSyncedSettings : globalSyncedSettings, [action, data.sync], storedSyncedSettings)

    const d = streamDeck.devices.find(d => d.id === device);
    if (!d) return;

    //All buttons except for the current one
    const buttons = d.actions.filter(b => b.manifestId.includes(action) && b.id !== context);

    for (let button of buttons) {
        //Get and button settings
        let settings = await button.getSettings();

        const isSyncedButton = objectPath.get(settings, data.sync) === true || objectPath.get(settings, data.sync) === syncType;
        if (!isSyncedButton) continue;

        for (let sett of storedSyncedSettings) {
            objectPath.set(settings, sett.key, sett.value);
        }

        websocketServer.send({
            action,
            context: button.id,
            device,
            event: 'didReceiveSettings',
            payload: {settings},
            syncedSettings: {
                global: globalSyncedSettings,
                page: pageSyncedSettings
            }
        });
        await button.setSettings(settings);
    }
    
}

export async function onDeviceDidConnect(device) {
    websocketServer.send({
        event: "deviceDidConnect",
        device: device.id,
        deviceInfo: {
            name: device.name,
            size: device.size,
            type: device.type
        }
    });
    info("Device Connected:", device.name, device.id);

    transmitDeviceButtons(device);
}

async function transmitDeviceButtons(device) {
    for (let action of device.actions) {
        transmitButtonEvent({
            type: "willAppear",
            payload: { settings: await action.getSettings() },
            action
        })
    }
}

export function onDeviceDidDisconnect(device) {
    websocketServer.send({
        event: "deviceDidDisconnect",
        device: device.id
    });
    info("Device Disconnected:", device.id);
}

export function setTitle(data) {
    const { context, device, payload } = data;
    //debug("setTitle", device, context, payload);
    const button = getButton(data);
    if (button && button.titleParameters) {
        button.titleRaw = structuredClone(data.payload.title);
        const formattedTitle = formatTitle(data.payload.title, button.titleParameters);
        button.setTitle(formattedTitle);
        button.title = formattedTitle;
        //debug('TEST', data.payload.title)
    }
}

export function setImage(data) {
    //debug("setImage", device, context, payload);

    if (data.payload.id)
        imageBuffer.add(data);

    const button = getButton(data);
    if (button) {
        button.setImage(data.payload.image);
    }
}

export function setBufferedImage(data) {
    const imageData = imageBuffer.get(data);

    if (imageData) {
        const button = getButton(data);
        if (button) {
            button.setImage(imageData.image);
        }
    }
    else {
        error("Buffered image not found", data)
        data.event = 'bufferedImageNotFound';
        data.source = 'MaterialDeck_Device';
        data.target = 'MaterialDeck_Foundry';
        websocketServer.send(data);
    }
}

export function removeBufferedImage(data) {
    imageBuffer.remove(data);
}

export function clearImageBuffer(data) {
    imageBuffer.clear(data);
}

//When data is sent from Foundry to SD
export function sendData(payload) { 
    //debug("rec data from Foundry", payload)
    const data = payload.payload;
    if (payload.type === 'setPageSync') {
        onSyncedSettingChange(data, data.action, data.context, data.device, 'page');
    }
    else if (payload.type === 'setGlobalSync') {
        onSyncedSettingChange(data, data.action, data.context, data.device, 'global');
    }
    
}

function getButton(data) {
    const device = getDevice(data);
    if (!device) return;
    return device.actions.find(b => b.id === data.context);
}

function getDevice(data) {
    return streamDeck.devices.find(d => d.id === data.device);
}

export function formatTitle(text, parameters) {
    if (text == '' || text == undefined) return '';

    //Get the font
    let font;
    if (parameters) {
        font = '';
        if (parameters.fontStyle.includes("Bold")) font += "bold ";
        if (parameters.fontStyle.includes("Italic")) font += "italic ";
        font += `${parameters.fontSize}pt `;
        font += parameters.fontFamily === '' ? "system-ui" : parameters.fontFamily;
    }

    const maxSize = 50;
    let formattedText = "";
    
    //text = text.replaceAll("/", "/\n");
    const sections = text.split(/\n/);
    //debug('sections',text, sections)

    const spaceSize = measureText(" ", parameters);
    const dashSize = measureText("-", parameters);

    for (let i=0; i<sections.length; i++) {
        //For each section, get the section size
        const section = sections[i];
        const size = measureText(section, parameters);

        //If the size is smaller than maxSize, add it to the new text
        if (size <= maxSize) {
            formattedText += section;
            if (i<sections.length-1) formattedText += '\n';
            continue;
        } 

        //Else split section by words
        let words = section.split(/[\s]+/);

        //Get an array of word sizes
        let wordSizes = [];
        for (let word of words) 
            wordSizes.push(measureText(word, parameters));

        let combined = [];
        for (let j=0; j<words.length; j++) {

            //Check if the word is too long
            if (wordSizes[j] > maxSize) {
                let syllables = syllabify(words[j], parameters);

                //Check if syllables can be added to previous array element
                if (j > 0) {
                    let lastArrayElmnt = combined[combined.length-1];
                    const lastArrayElmntSize = measureText(lastArrayElmnt, parameters);

                    for (let k=syllables.elements.length-1; k>=0; k--) {
                        const element = syllables.elements[k];
                        if (element.startLength + lastArrayElmntSize + dashSize <= maxSize) {
                            combined[combined.length-1] += " " + element.start + '-';
                            words[j] = element.end;
                            wordSizes[j] = element.endLength;
                            syllables = syllabify(words[j], parameters);
                            break;
                        }
                    }
                }

                //Check if syllables can be added to next array element
                if (wordSizes[j] > maxSize && j < words.length-1) {
                    let nextArrayElmnt = words[j+1];
                    const nextArrayElmntSize = measureText(nextArrayElmnt, parameters);

                    for (let k=syllables.elements.length-1; k>=0; k--) {
                        const element = syllables.elements[k];
                        //If start is too long, continue
                        if (element.startLength + dashSize > maxSize) continue;
                        if (element.endLength + nextArrayElmntSize <= maxSize) {
                            words[j] = element.start + '-';
                            wordSizes[j] = element.endLength;
                            words[j+1] = element.end + ' ' + words[j+1];
                            wordSizes[j+1] = measureText(words[j+1], parameters);
                            syllables = syllabify(words[j], parameters);
                            break;
                        }
                    }
                }

                //Spread syllables into multiple sections
                if (wordSizes[j] > maxSize) {
                    let smallestDifference = 100;
                    let smallestDifferenceElement;
                    for (let k=0; k<syllables.elements.length; k++) {
                        const element = syllables.elements[k];
                        if (element.startLength < maxSize && element.endLength < maxSize) {
                            const difference = Math.abs(element.startLength - element.endLength);
                            if (difference < smallestDifference) smallestDifferenceElement = element;
                        }
                    }

                    if (smallestDifferenceElement) {
                        combined.push(smallestDifferenceElement.start + '-');
                        combined.push(smallestDifferenceElement.end);
                        continue;
                    }                 
                }
            }

            //If a word is left, add it to the end
            if (j  == words.length-1) {
                combined.push(words[j]);
                continue;
            }

            const combinedSize = wordSizes[j] + wordSizes[j+1] + spaceSize;
            if (combinedSize <= maxSize) {
                combined.push(words[j] + ' ' + words[j+1]);
                j++;
                continue;
            }
            
            combined.push(words[j]);
        }

        for (let section of combined)
            formattedText += section + '\n';
    }

    while(formattedText[formattedText.length-1] == '\n') {
        formattedText = formattedText.slice(0, -1)
    }
    return formattedText;
}

function measureText(text, parameters) {
    let fontFamily = fontData?.find(f => f.fontFamily == parameters.fontFamily);
    if (!fontFamily) fontFamily = fontData[0];
    if (!fontFamily) {
        error("No Font Family Found")
        return false;
    }
    let typeData = fontFamily.typeData.find(t => t.fontType == parameters.fontStyle);
    if (!typeData) typeData = fontFamily.typeData[0];

    const charTable = typeData.charTable;
    //debug('fontFamily', fontFamily)

    let length = 0;
    for (let char of text) {
        const charSize = charTable[char];
        length += charSize === undefined ? typeData.avgSize : charSize;
       // debug('char', char, length)
    }

    return length * fontFamily.sizeMultiplier * parameters.fontSize;
}

function syllabify(words, parameters) {
    let data = {}
    data.syllables = words.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi);
    if (!data.syllables) data.syllables = words

    data.elements = [];
    const arrayLength = data.syllables.length;
    for (let i=0; i<arrayLength-1; i++) {
        let start = "";
        let end = "";
        for (let j=0; j<data.syllables.length; j++) {
            if (j<=i) start += data.syllables[j];
            else end += data.syllables[j];
        }
        const startLength = measureText(start, parameters);
        const endLength = measureText(end, parameters); 
        data.elements.push( {
            start,
            end,
            startLength,
            endLength
        })
    }

    return data;
}

export async function setWebsocketPort(newPort, reconnect=false) {
    let globalSettings = await streamDeck.settings.getGlobalSettings();
    globalSettings['wsPort'] = newPort;
    //debug('Setting websocket port', globalSettings);
    streamDeck.settings.setGlobalSettings(globalSettings)

    if (!reconnect) {
        sendToPropertyInspector({
            wsPort: newPort
        })
    }
    else {
        websocketServer.start(newPort);
    }
    
}