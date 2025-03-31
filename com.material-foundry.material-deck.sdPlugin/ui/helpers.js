import { settingsConfig } from "./propertyInspector.js";
import { generateElement } from "./elementGenerator.js";
import { SD } from "./streamDeck.js";

export let settingsTable = [];
export let syncedSettings = {};

export function addSyncedSetting(id, sync) {
    if (!syncedSettings[sync]) syncedSettings[sync] = [id];
    else if (!syncedSettings[sync].find(s => s === id))syncedSettings[sync].push(id);
}

export function generateSettingsTable(settingsConfig, clear=false, parent) {
    if (clear) settingsTable = [];

    for (let s of settingsConfig) {
        if (parent) s.parent = parent;
        s.isVisible = isVisible(s);
        settingsTable.push(s);

        if (s.type === 'wrapper' || s.type === 'multiItem') generateSettingsTable(s.settings, false, s.id);
        if (s.type === 'table') {
            for (let i=0; i<s.rows.length; i++) {
                const row = s.rows[i];

                for (let j=0; j<row.length; j++) {
                    let item = row[j];
                    
                    let columnVisibility;
                    if (s.columnVisibility === undefined) columnVisibility = true;
                    else columnVisibility = s.columnVisibility[j];
                    if (columnVisibility === undefined) columnVisibility = true;
                    item.parent = s.id;
                    item.isVisible = isVisible(item);
                    item.visibility = columnVisibility;
                    settingsTable.push(item);
                }
            }
        }
    }
}

/**
 * Populate the settings element on load
 */
export function populateHtml(settingsConfig) {
    let settingsElmt = document.getElementById("settings");
    settingsElmt.innerHTML = "";

    if (!settingsConfig) {
        console.warn(`Could not find settingsConfig for action '${SD.action}'`);
        return;
    }
    generateElement(settingsElmt, settingsConfig);
    SD.saveSetting(undefined, true);
}

/**
 * Update the settings element on settings change
 */
export function updateHtml(returnValue) {

    //Find all settings that have a showOn or hideOn property with relevant key
    const impactedSettings = settingsTable.filter(s => 
        s.visibility?.showOn?.find(a => a.hasOwnProperty(returnValue.key)) ||
        s.visibility?.hideOn?.find(a => a.hasOwnProperty(returnValue.key))
    )

    //Check if setting needs to be displayed or hidden
    for (let s of impactedSettings) {
        if (s.parent) {
            const parent = settingsTable.find(t => t.id === s.parent);
            if (parent.type === 'table') {
                const settings = window.SD.settings;
                const elmnt = document.getElementById(parent.id);
                if (elmnt === null) continue;
                const visible = isVisible(parent);
                elmnt.style.display = visible ? "" : "none";
                const rows = elmnt.getElementsByTagName('tr');
    
                for (let row=0; row<rows.length; row++) {
                    if (row > 0 && parent.rowVisibility && parent.rowVisibility[row-1])
                        rows[row-1].style.display = isVisible({visibility:parent.rowVisibility[row-1]}, settings) ? "" : "none";
    
                    let columns = rows[row].getElementsByTagName(row == 0 ? 'th' : 'td');
                    for (let column=0; column<columns.length; column++) {
                        if (parent.columnVisibility && parent.columnVisibility[column])
                            columns[column].style.display = isVisible({visibility:parent.columnVisibility[column]}, settings) ? "" : "none";
                    }
                }
                continue;
            }
        }

        if (isVisible(s)) {
            document.getElementById(s.elementId).style.display = '';
            s.isVisible = true;
        }
        else {
            s.isVisible = false;
            document.getElementById(s.elementId).style.display = 'none';
        }
    }
}

/**
 * Check if a setting should be visible
 */
export function isVisible(data) {
    const settings = window.SD.settings;
    const dataType = typeof data.visibility;

    if (data.visibility === undefined) return true;
    else if (dataType == "boolean") return data.visibility;
    else if (dataType == "object") {
        if (data.visibility.hideOn) {
            for (let s of data.visibility.hideOn) {
                const keys = Object.keys(s)
                let hideCount = 0;

                for (let key of keys) {
                    //Get setting of hideOn
                    const hideOnSetting = getSetting([key], settingsConfig);
                    if (hideOnSetting.permission === false) return false;
                    if (hideOnSetting?.options?.find(o=>o.value === settings?.[key])?.permission === false) return false;
                    //if (settings?.[key] === s?.[key]) hideCount++;
                    if (SD.getSettingValue(key) === s?.[key]) hideCount++;
                }
                if (hideCount === keys.length) return false;
            }
        }
        if (data.visibility.showOn) {
            for (let s of data.visibility.showOn) {
                const keys = Object.keys(s)
                let showCount = 0;

                for (let key of keys) {
                    //Get setting of showOn
                    const showOnSetting = getSetting([key], settingsConfig);
                    if (showOnSetting.permission === false) continue;
                    if (showOnSetting.options?.find(o=>o.value === s?.[key])?.permission === false) continue;
                    if (showOnSetting.appendOptions?.find(o=>o.value === s?.[key])?.permission === false) continue;
                    if (SD.getSettingValue(key) === s?.[key]) showCount++;
                }
                if (showCount === keys.length) return true;
            }
            return false;
        }
    }
    return true;
}

/**
 * Get a setting from the settingsConfig
 */
function getSetting(id, settingsConfig) {
    //first check base level
    const s = settingsConfig.find(s => s.id == id)
    if (s != undefined) return s;

    //then look for wrappers
    const wrappers = settingsConfig.filter(s => s.type == "wrapper")
    for (let wrapper of wrappers) {
        const s = getSetting(id, wrapper.settings);
        if (s) return s;
    }
    return false;
}