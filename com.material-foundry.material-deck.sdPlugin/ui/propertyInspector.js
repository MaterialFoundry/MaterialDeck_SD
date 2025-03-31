import { SD } from "./streamDeck.js";
import { generateSettingsTable, populateHtml, settingsTable, updateHtml, syncedSettings } from "./helpers.js";
import { SettingsWindow } from "./settingsWindow.js";

let settingsWindow = new SettingsWindow();
export let settingsConfig;
let loaded = false;

const startTimeout = setTimeout(()=>{
    if (!loaded) {
        console.warn('No connection to Foundry detected')
        document.getElementById('loading').style.display = 'none';
        document.getElementById('noConnect').style.display = '';
    }
}, 2000);

//Register callback function for when data is received from the plugin
SD.client.sendToPropertyInspector.subscribe(onSendToPropertyInspector);

//Register callback function for when something is changed in the property inspector
SD.registerEvent('piChanged', onPiChanged);

/**
 * Callback function to handle data sent from the plugin
 */
function onSendToPropertyInspector(ev) {
    
    const payload = ev.payload;

    //If settingsconfig is received
    if (payload.settingsConfig) {
        //console.log('settConfig received', payload.settingsConfig)
        if (!payload.settingsConfig[SD.action]) {
            //console.log('undefined sett')
            return;
        }
        settingsConfig = payload.settingsConfig[SD.action];
        generateSettingsTable(settingsConfig, true);
        let t = [];
        for (let s of settingsTable)
            t.push([s.id, s.isVisible, s])

        populateHtml(settingsConfig);
    }
    //If synced settings are received
    if (payload.syncedSettings) {
        //console.log('syncedSettings', payload.syncedSettings)
        SD.saveSyncedSettings(payload.syncedSettings);
        populateHtml(settingsConfig);
    }

    if (payload.wsPort) {
        settingsWindow.newPort(payload.wsPort)
    }

    

    if (!loaded) {
        loaded = true;
        document.getElementById('loading').style.display = 'none';
        document.getElementById('noConnect').style.display = 'none';
        document.getElementById('settings').style.display = '';
    }

    if (payload.type === 'connectionClosed') {
        loaded = false;
        document.getElementById('loading').style.display = 'none';
        document.getElementById('noConnect').style.display = '';
        document.getElementById('settings').style.display = 'none';
    }
}

/**
 * Callback function to handle 'piChanged' event
 */
function onPiChanged(payload) {
    //console.log('piChanged', payload, SD.settings);

    //Save the changed setting
    SD.saveSetting(payload.setting);

    //If a synced setting is changed
    let syncedSettingType = SD.getSettingValue(payload.sync);
    if (syncedSettingType === 'false') syncedSettingType = false;
    if (payload.sync && syncedSettingType) {
        payload.syncType = syncedSettingType;
        onSyncedSettingChange(payload);
    }

    //Check if setting is sync target
    if (payload.setting.value && payload.setting.value !== 'false' && syncedSettings[payload.setting.key]) {
        //console.log('syncTarget', payload.setting.value)
        getSyncedSettings(payload.setting.key, syncedSettings[payload.setting.key], payload.setting.value)
    }

    //Update the settings element on settings change
    updateHtml(payload.setting);
}

//Notify synced setting has changed to plugin so it can change other buttons
function onSyncedSettingChange(payload) {
    //console.log('synced setting changed', payload)
    SD.sendToPlugin({
        type: 'syncedSettingChanged',
        syncType: payload.syncType,
        setting: payload
    })
}

//Request synced settings from plugin
function getSyncedSettings(key, settings, syncType) {
    //console.log('getSyncedSettings', key, syncType, settings)
    SD.sendToPlugin({
        type: 'getSyncedSettings',
        key,
        settings,
        syncType
    })
}

SD.testFontSize = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let fontData = [];
    const testString = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,;:/?`~!@#$%^&*()_+-=<>[]{}"
    for (let f of fontList) {
        //console.log('FONT', f)
        let d = {
            fontFamily: f
        }
        ctx.font = `bold 10pt ${f}`;

        let typeData = [];
        for (let type of fontTypes) {
            let data = {
                fontType: type
            };
            //get character table
            let charTable = {};
            let avg = 0;
            let min = 9999;
            let max = 0;
            for (let c of testString) {
                ctx.font = `${type === 'Regular' ? '' : type} 6pt ${f}`;
                const charSize = ctx.measureText(c).width;
                charTable[c] = charSize;
                avg += charSize;
                if (charSize < min) min = charSize;
                if (charSize > max) max = charSize;
            }
            data.charTable = charTable;
            data.minSize = min;
            data.maxSize = max;
            data.avgSize = avg/testString.length;

            typeData.push(data);
        }
        d.typeData = typeData;

        //get size multiplier
        ctx.font = `6pt ${f}`;
        const size6 = ctx.measureText(testString).width;
        ctx.font = `16pt ${f}`;
        const size16 = ctx.measureText(testString).width;
        d.sizeMultiplier = (size16/size6)/16;

        fontData.push(d);
    }
    //console.log('fontData', fontData)
    //console.log(JSON.stringify(fontData))
}

SD.measureText = (text, font, size) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
        ctx.font = `${size}pt ${font}`;
        //console.log('f', font, ctx.measureText(text).width)
    
    
    return ctx.measureText(text).width;
};

const fontTypes = ['Regular', 'Bold', 'Italic', 'Bold Italic'];
const fontList = ['system-ui', 'Arial', 'Arial Black', 'Comic Sans MS', 'Courier', 'Courier New', 'Georgia', 'Impact', 'Microsoft Sans Serif', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings']


window.addEventListener('DOMContentLoaded',function () {
    //settingsWindow.open();

    document.getElementById('settingsButton').addEventListener('click', ()=>{
        settingsWindow.open();
    })

    for (let linkElmnt of document.getElementsByTagName('hyperlink')) {
        linkElmnt.addEventListener('click', ()=> {
            SD.sendToPlugin({
                type: 'openUrl',
                url: linkElmnt.dataset.url
            })
        })
    }

/*
    SD.sendToPlugin({
        type: 'openUrl',
        url: "https://elgato.com"
    })
*/
});