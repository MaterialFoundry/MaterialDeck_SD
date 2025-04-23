import { isVisible, settingsTable, syncedSettings, addSyncedSetting } from "./helpers.js";
import { SD } from "./streamDeck.js";

export function generateElement(elmnt, settingsConfig) {

    for (let s of settingsConfig) {
        if (s.permission === false) continue;
        if (s.type === 'textbox' || s.type === 'number' || s.type === 'textarea') elmnt.appendChild(generateTextboxElement(s));
        else if (s.type === 'text') elmnt.appendChild(generateTextElement(s));
        else if (s.type === 'checkbox') elmnt.appendChild(generateCheckboxElement(s));
        else if (s.type === 'range') elmnt.appendChild(generateRangeElement(s));
        else if (s.type === 'select') elmnt.appendChild(generateSelectElement(s));
        else if (s.type === 'wrapper') elmnt.appendChild(generateWrapperElement(s));
        else if (s.type === 'multiItem') elmnt.appendChild(generateMultiElement(s));
        else if (s.type === 'color') elmnt.appendChild(generateColorPickerElement(s));
        else if (s.type === 'table') elmnt.appendChild(generateTableElement(s));
        else if (s.type === 'note') elmnt.appendChild(generateNoteElement(s));
        else if (s.type === 'line') elmnt.appendChild(document.createElement("hr"));
        else if (s.type === 'line-right') {
            let lineElmnt = document.createElement("hr");
            lineElmnt.style.marginLeft = "107px"
            lineElmnt.style.width = "auto";
            elmnt.appendChild(lineElmnt);
        }
        else if (s.type === 'line-left') {
            let lineElmnt = document.createElement("hr");
            lineElmnt.style.width = "90px";
            elmnt.appendChild(lineElmnt);
        }
    }
}

//const settings = SD.settings;
//SD.saveSetting({ key: data.id, value: event.target.checked });
//SD.callEvent('piChanged', {setting: { key: data.id, value: event.target.value }, sync: event.target.dataset.sync });

/**
 * Generates a label for an element
 */
function generateLabelElement(data) {
    let div = document.createElement("div");
    div.setAttribute("class", "sdpi-item-label");

    let label = "";
    const dataType = typeof data.label;
    if (dataType == "function") label = data.label(settings);
    else if (data.label) label = data.label;

    let labelNode = document.createTextNode(label);

    if (data.link) {
        let link = document.createElement("a");
        link.setAttribute("href", data.link);
        link.setAttribute("target", "_blank");
        link.appendChild(labelNode);
        div.appendChild(link);
    }
    else {
        div.appendChild(labelNode);
    }
    
    return div;
}

function createLabel(data) {
    let label;

}

function generateNoteElement(data) {

    data.elementId = `${data.id}-item`;
    let elmnt = document.createElement("div");
    elmnt.setAttribute("class", "sdpi-item" + (data.indent ? " indent" : ""));
    elmnt.setAttribute("id", data.elementId);
    elmnt.style.display = isVisible(data) ? "" : "none";

    if (data.label && data.label !== "") elmnt.appendChild(generateLabelElement(data));
    else {
        let spacer = document.createElement("div");
        spacer.style.width = "94px"
        elmnt.appendChild(spacer);
    }

    let text = document.createElement("div");
    text.setAttribute("class", "sdpi-item-value");
    text.innerHTML = data.note;

    text.style.fontSize = data.fontSize + "px";
    if (data.center) text.style.textAlign = 'center'

    elmnt.appendChild(text);
    return elmnt;
}


function generateTextElement(data) {

    data.elementId = `${data.id}-item`;
    let elmnt = document.createElement("div");
    elmnt.setAttribute("class", "sdpi-item" + (data.indent ? " indent" : ""));
    elmnt.setAttribute("id", data.elementId);
    elmnt.style.display = isVisible(data) ? "" : "none";

    if (data.label) elmnt.appendChild(generateLabelElement(data));

    let text = document.createElement("div");
    text.setAttribute("class", "sdpi-item-value");
    text.innerHTML = data.value;

    if (data.center) text.style.textAlign = 'center'

    elmnt.appendChild(text);
    return elmnt;
}

/**
 * Generates a textbox or textarea element
 */
function generateTextboxElement(data) {
    data.elementId = `${data.id}-item`;
    let elmnt = document.createElement("div");
    elmnt.setAttribute("class", "sdpi-item" + (data.indent ? " indent" : ""));
    elmnt.setAttribute("id", data.elementId);
    elmnt.style.display = isVisible(data) ? "" : "none";
    elmnt.appendChild(generateLabelElement(data));
    elmnt.appendChild(createTextbox(data));
    return elmnt;
}

function createTextbox(data, maxWidth) {
    let textbox;
    if (data.type == 'textarea') {
        textbox = document.createElement("textarea");
        textbox.setAttribute("style", "word-break: break-word;");
    }
    else textbox = document.createElement("input");
    textbox.setAttribute("class", "sdpi-item-value");
    textbox.setAttribute("id", data.id);
    textbox.setAttribute("value", data.default);
    if (data.sync) {
        textbox.setAttribute("data-sync", data.sync);
        addSyncedSetting(data.id, data.sync)
    }
    if (data.type == 'number') {
        textbox.setAttribute("type", "number");
        if (data.min) textbox.setAttribute("min", data.min);
        if (data.max) textbox.setAttribute("max", data.max);
        if (data.step) textbox.setAttribute("step", data.step);
    }
    if (maxWidth) {
        textbox.setAttribute("style", `max-width: ${maxWidth}`)
    }

    const existingVal = SD.getSettingValue(data.id);
    if (existingVal !== undefined) textbox.value = existingVal;
    else if (data.default) {
        SD.saveSetting({ key: data.id, value: data.default }, false);
        textbox.value = data.default;
    }
    else {
        SD.saveSetting({ key: data.id, value: '' }, false);
        textbox.value = '';
    }

    textbox.oninput = function(event) {
        SD.callEvent('piChanged', {setting: { key: data.id, value: event.target.value }, sync: event.target.dataset.sync });
    }

    if (data.type == 'textarea') {
        textbox.addEventListener("input", (event) => {
            textbox.style.height = textbox.scrollHeight + "px";
        })
    
        setTimeout(()=>{
            textbox.style.height = textbox.scrollHeight + "px";
        },10);
    }

    return textbox;
}

/**
 * Generates a checkbox element
 */
function generateCheckboxElement(data) {
    data.elementId = `${data.id}-item`;
    let elmnt = document.createElement("div");
    elmnt.setAttribute("class", "sdpi-item" + (data.indent ? " indent" : ""));
    elmnt.setAttribute("id", data.elementId);
    elmnt.style.display = isVisible(data) ? "" : "none";
    elmnt.appendChild(generateLabelElement(data));
    elmnt.appendChild(createCheckbox(data));
    return elmnt;
}

function createCheckbox(data) {
    let div = document.createElement('div')

    let checkbox = document.createElement("input");
    checkbox.setAttribute("class", "sdpi-item-value");
    checkbox.setAttribute("id", data.id);
    checkbox.setAttribute("type", "checkbox");
    if (data.sync) {
        checkbox.setAttribute("data-sync", data.sync);
        addSyncedSetting(data.id, data.sync)
    }

    const existingVal = SD.getSettingValue(data.id);
    if (existingVal !== undefined) checkbox.checked = existingVal;
    else if (data.default) {
        SD.saveSetting({ key: data.id, value: data.default }, false);
        checkbox.checked = data.default;
    }
    else {
        SD.saveSetting({ key: data.id, value: false }, false);
        checkbox.checked = false;
    }

    checkbox.addEventListener("change", (event) => {
        SD.callEvent('piChanged', {setting: { key: data.id, value: event.target.checked }, sync: event.target.dataset.sync });
    })

    div.appendChild(checkbox);
    let label = document.createElement("label");
    label.setAttribute("for", data.id);
    let span = document.createElement("span");
    label.appendChild(span);
    div.appendChild(label);
    return div;
}

/**
 * Generates a select element
 */
function generateSelectElement(data) {
    data.elementId = `${data.id}-item`;
    let elmnt = document.createElement("div");
    elmnt.setAttribute("class", "sdpi-item" + (data.indent ? " indent" : ""));
    elmnt.setAttribute("id", data.elementId);
    elmnt.style.display = isVisible(data) ? "" : "none";
    elmnt.appendChild(generateLabelElement(data));
    elmnt.appendChild(createSelect(data));
    return elmnt;
}

const indentSpace = String.fromCharCode(8194)+String.fromCharCode(8194)+String.fromCharCode(8194);

function createSelect(data, className='', minWidth) {
    let select = document.createElement("select");
    select.setAttribute("class", `sdpi-item-value select ${className}`);
    select.setAttribute("id", data.id);
    select.setAttribute("type", "select");
    if (data.sync) {
        select.setAttribute("data-sync", data.sync);
        addSyncedSetting(data.id, data.sync)
    }
    if (minWidth) select.style.minWidth = minWidth;

    for (let option of data.options) {
        if (option.children) {
            let optGroupElmnt = document.createElement("optgroup");
            optGroupElmnt.setAttribute("label", option.label);
            for (let child of option.children) {
                let optionElmnt = document.createElement("option");

                if (child.folder) {
                    optionElmnt.setAttribute('style', 'font-style:italic');
                    optionElmnt.setAttribute('disabled', 'true')
                } 

                let indent = '';
                if (child.indent) {
                    if (parseInt(child.indent) > 1) {
                        for (let i=0; i<parseInt(child.indent); i++) indent += indentSpace;
                    }
                    else indent = indentSpace;
                }
                
                if (child.permission === false) {
                    optionElmnt.value = child.value;
                    optionElmnt.text = indent + child.label + " (No Permission)";
                }
                else {
                    optionElmnt.value = child.value;
                    optionElmnt.text = indent + child.label;         
                }
                optGroupElmnt.appendChild(optionElmnt);
            }
            select.add(optGroupElmnt);
            continue;
        }
        
        let optionElmnt = document.createElement("option");

        if (option.folder) {
            optionElmnt.setAttribute('style', 'font-style:italic');
            optionElmnt.setAttribute('disabled', 'true')
        } 

        let indent = '';
        if (option.indent) {
            if (parseInt(option.indent) > 1) {
                for (let i=0; i<parseInt(option.indent); i++) indent += indentSpace;
            }
            else indent = indentSpace;
        }

        if (option.permission === false) {
            optionElmnt.value = option.value;
            optionElmnt.text = indent + option.label + " (No Permission)";
        }
        else {
            optionElmnt.value = option.value;
            optionElmnt.text = indent + option.label;
        }
        select.add(optionElmnt);
    }

    const existingVal = SD.getSettingValue(data.id);
    if (existingVal !== undefined) select.value = existingVal;
    else if (data.default) {
        SD.saveSetting({ key: data.id, value: data.default }, false);
        select.value = data.default;
    }
    else {
        if (data.options.length === 0) 
            select.value = '';
        else {
            let selectedOption;
            for (let option of data.options) {
                if (option.folder || option.permission === false) continue;
                selectedOption = option;
                break;
            }

            if (selectedOption.children)
                select.value = selectedOption.children?.length > 0 ? selectedOption.children[0].value : '';
            else
                select.value = selectedOption.value;
        }
        
        
        SD.saveSetting({ key: data.id, value: select.value }, false);
    }

    if (data.event) {
        select.addEventListener(data.event, (event)=> {
            const option = data.options.find(o => o.value == event.target.value);
            for (let e of option.event) eventHandler(e);
        });
    }

    select.addEventListener("change", (event) => {
        SD.callEvent('piChanged', {setting: { key: data.id, value: event.target.value }, sync: event.target.dataset.sync });
    })

    return select;
}

/**
 * Generates a range element
 */
function generateRangeElement(data) {
    data.elementId = `${data.id}-item`;
    let elmnt = document.createElement("div");
    elmnt.setAttribute("class", "sdpi-item" + (data.indent ? " indent" : ""));
    elmnt.setAttribute("id", data.elementId);
    elmnt.style.display = isVisible(data) ? "" : "none";
    elmnt.appendChild(generateLabelElement(data));
    elmnt.appendChild(createRange(data));
    return elmnt;
}

function createRange(data) {

    let val;
    const existingVal = SD.getSettingValue(data.id);
    if (existingVal !== undefined) val = existingVal;
    else if (data.default) {
        SD.saveSetting({ key: data.id, value: data.default }, false);
        val = data.default;
    }
    else {
        SD.saveSetting({ key: data.id, value: 1 }, false);
        val = 1;
    }

    let div = document.createElement('div')
    div.setAttribute("style", "display:flex");
    div.setAttribute("class", "sdpi-item-value");

    let range = document.createElement("input");
    range.setAttribute("class", "sdpi-item-value");
    range.setAttribute("type", "range");
    range.setAttribute("id", data.id);
    //if (data.displayValue) range.setAttribute("style", `max-width:60%`);
    range.setAttribute("style", "flex-grow: 1; width: auto");
    if (data.min) range.setAttribute("min", data.min);
    if (data.max) range.setAttribute("max", data.max);
    if (data.step) range.setAttribute("step", data.step);
    range.setAttribute("value", val);
    if (data.sync) {
        range.setAttribute("data-sync", data.sync);
        addSyncedSetting(data.id, data.sync)
    }
    div.appendChild(range);

    range.addEventListener("change", (event) => {
        SD.callEvent('piChanged', {setting: { key: data.id, value: event.target.value }, sync: event.target.dataset.sync });
    })

    if (data.displayValue) {
        let value = document.createElement("input");
        value.setAttribute("class", "sdpi-item-value");
        value.setAttribute("style", "min-width:40px; max-width: 40px; margin-right:0");
        value.setAttribute("type", "number");
        value.setAttribute("min", data.min);
        value.setAttribute("max", data.max);
        value.setAttribute("step", data.step);
        value.setAttribute("value", val);
        if (data.sync) {
            value.setAttribute("data-sync", data.sync);
            addSyncedSetting(data.id, data.sync)
        }
        div.appendChild(value);

        range.addEventListener("input", event => { value.value = event.target.value; });
        value.addEventListener("change", event => { 
            range.value = event.target.value; 
            SD.callEvent('piChanged', {setting: { key: data.id, value: event.target.value }, sync: event.target.dataset.sync });
        });
    }

    return div;
}

/**
 * Generates a color picker element
 */
function generateColorPickerElement(data) {
    data.elementId = `${data.id}-item`;
    let elmnt = document.createElement("div");
    elmnt.setAttribute("class", "sdpi-item" + (data.indent ? " indent" : ""));
    elmnt.setAttribute("id", data.elementId);
    elmnt.style.display = isVisible(data) ? "" : "none";
    elmnt.appendChild(generateLabelElement(data));
    elmnt.appendChild(createColorPicker(data));
    elmnt.setAttribute("id", `wrapper-${data.id}`);
    return elmnt;
}

function createColorPicker(data) {
    let colorpicker = document.createElement("input");
    colorpicker.setAttribute("class", "sdpi-item-value");
    colorpicker.setAttribute("type", "color");
    colorpicker.setAttribute("id", data.id);
    colorpicker.setAttribute("value", data.default);
    if (data.sync) {
        colorpicker.setAttribute("data-sync", data.sync);
        addSyncedSetting(data.id, data.sync)
    }

    const existingVal = SD.getSettingValue(data.id);
    if (existingVal !== undefined) colorpicker.value = existingVal;
    else if (data.default) {
        SD.saveSetting({ key: data.id, value: data.default }, false);
        colorpicker.value = data.default;
    }
    else {
        colorpicker.value = '#000000';
        SD.saveSetting({ key: data.id, value: colorpicker.value }, false);
    }

    colorpicker.addEventListener("change", (event) => {
        SD.callEvent('piChanged', {setting: { key: data.id, value: event.target.value }, sync: event.target.dataset.sync });
    })
    return colorpicker;
}

/**
 * Generates a wrapper element
 */
function generateWrapperElement(data) {
    let expandable;

    data.elementId = data.id;
    let elmnt = document.createElement("div");
    elmnt.setAttribute("class", "wrapper" + (data.indent ? " indent" : ""));
    elmnt.style.display = isVisible(data) ? "" : "none";
    elmnt.setAttribute("id", data.id);

    if (data.label) {
        let label = document.createElement("h4");

        if (data.expandable) {
            let exp = document.createElement("img");
            exp.setAttribute("src", data.expanded ? "../imgs/down.png" : "../imgs/right.png");
            exp.setAttribute("class", "expandableIcon");
            exp.setAttribute("style", "width:12px");
            label.appendChild(exp);
            label.setAttribute("class", "expandable");
            label.addEventListener("click", () => {
                if (expandable.getAttribute("class")) {
                    expandable.setAttribute("class", "");
                    exp.setAttribute("src", "../imgs/down.png");
                    data.expanded = true;
                }
                else {
                    expandable.setAttribute("class", "collapsed");
                    exp.setAttribute("src", "../imgs/right.png");
                    data.expanded = false;
                }
            })
        }

        label.appendChild(document.createTextNode(data.label));
        elmnt.appendChild(label); 
    }

    if (data.label && data.expandable) {
        expandable = document.createElement("div");
        expandable.setAttribute("class", data.expanded ? "" : "collapsed");
        generateElement(expandable, data.settings);
        elmnt.appendChild(expandable);
        return elmnt;
    }
    else
        generateElement(elmnt, data.settings);

    return elmnt;
}

/**
 * Generates an element with multiple sub elements
 */
function generateMultiElement(data) {
    data.elementId = `${data.id}-multiItem`;
    let elmnt = document.createElement("div");
    elmnt.setAttribute("class", "sdpi-item" + (data.indent ? " indent" : ""));
    elmnt.setAttribute("id", data.elementId);
    elmnt.style.display = isVisible(data) ? "" : "none";
    elmnt.appendChild(generateLabelElement(data));

    let itemElmnt = document.createElement("div");
    itemElmnt.setAttribute("class", "sdpi-item-value");
    itemElmnt.setAttribute("style", "display:flex");
    for (let s of data.settings) {
        itemElmnt.appendChild(createSubElement(s));
    }
    elmnt.appendChild(itemElmnt)
    return elmnt;
}

function generateTableElement(data) {
    data.elementId = data.id;
    let elmnt = document.createElement("div");
    elmnt.setAttribute("class", "sdpi-item" + (data.indent ? " indent" : ""));
    elmnt.style.display = isVisible(data) ? "" : "none";

    elmnt.setAttribute("id", `${data.id}`);
    elmnt.appendChild(generateLabelElement(data));

    //Create table element
    let table = document.createElement("table");
    elmnt.appendChild(table);
    table.style.maxWidth = "500px"

    const nrOfHeaders = data.columns.length;
    const nrOfRows = data.rows.length;
    let columnVisibility = [];
    let rowVisibility = [];

    for (let i=0; i<nrOfHeaders; i++) {
        if (!data.columnVisibility) columnVisibility.push(true);
        else columnVisibility.push(isVisible({visibility:data.columnVisibility[i]}, settings));
    } 

    for (let i=0; i<nrOfRows; i++) {
        if (!data.rowVisibility) rowVisibility.push(true);
        else rowVisibility.push(isVisible({visibility:data.rowVisibility[i]}, settings));
    } 

    //Create header element
    let header = document.createElement("tr");
    header.style.maxWidth = "100%";
    table.appendChild(header);
    for (let i=0; i<nrOfHeaders; i++) {
        let headerElmnt = document.createElement('th');
        if (!columnVisibility[i] || (data.columnPermissions && data.columnPermissions[i] === false)) headerElmnt.style.display = "none"
        headerElmnt.style.maxWidth = "30%";
        header.appendChild(headerElmnt);
        if (!data.columns || !data.columns[i]) continue;
        if (!data.columns[i].link || data.columns[i].link === '') headerElmnt.innerHTML = data.columns[i].label;
        else headerElmnt.innerHTML = `<a href=${data.columns[i].link} target="_blank">${data.columns[i].label}</a>`
    }
        
    //Create row
    for (let row = 0; row<nrOfRows; row++) {
        let r = document.createElement('tr');
        if (!rowVisibility[row]) r.style.display = "none"
        r.style.maxWidth = "100%";
        table.appendChild(r);
        for (let column=0; column<nrOfHeaders; column++) {
            let rowElmnt = document.createElement('td');
            if (!columnVisibility[column]) rowElmnt.style.display = "none"
            else if (data.columnPermissions && data.columnPermissions[column] === false) rowElmnt.style.display = "none"
            else if (data.rowPermissions && data.rowPermissions[row] === false) rowElmnt.style.display = "none"
            rowElmnt.style.maxWidth = "30%"
            let subElementData = data.rows[row][column];

            if (subElementData.type === 'label') {
                let labelElmnt = document.createElement('div');
                labelElmnt.innerHTML = subElementData.label;
                const font = subElementData.font;
                if (font?.includes('bold')) labelElmnt.style.fontWeight = 'bold';
                if (font?.includes('italic')) labelElmnt.style.fontStyle = 'italic';
                rowElmnt.appendChild(labelElmnt);
            }
            else if (subElementData.isVisible) {

                rowElmnt.appendChild(createSubElement(subElementData, '100px'));
            }
            r.appendChild(rowElmnt)
        }
    }

    return elmnt;
}

function createSubElement(data, minWidth="125px") {
    if (data.type === 'textbox' || data.type === 'number' || data.type === 'textarea') return createTextbox(data, '60px');
    else if (data.type === 'checkbox') return createCheckbox(data);
    else if (data.type === 'select') return createSelect(data, "tableSelect", minWidth);
    else if (data.type === 'color') return createColorPicker(data);
    else if (data.type === 'range') return createRange(data);
    else if (data.type === 'label') return generateLabelElement(data);
    
    return document.createElement('p')
}