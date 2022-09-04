function setUI(returnValue={key:null,value:null}) {
    let mode = settings.otherMode ? settings.otherMode : 'pause';
    if (returnValue.key == 'otherMode') mode = returnValue.value;
    
    displayElement(`#pauseContainer`,false);
    displayElement(`#moveContainer`,false);
    displayElement(`#controlContainer`,false);
    displayElement(`#darknessContainer`,false);
    displayElement(`#rollDiceContainer`,false);
    displayElement(`#rollTableContainer`,false);
    displayElement(`#sidebarContainer`,false);
    displayElement(`#compendiumContainer`,false);
    displayElement(`#ringColorWrapper`,false);
    displayElement(`#chatMessageContainer`,false);
    displayElement(`#rollOptionsContainer`,false);
    displayElement(`#rollModeContainer`,false);

    if (mode == 'pause'){    //pause
        displayElement(`#pauseContainer`,true);
        displayElement(`#ringColorWrapper`,true);
    }
    else if (mode == 'move') {  //move canvas
        displayElement(`#moveContainer`,true);
    }
    else if (mode == 'controlButtons'){   //control buttons
        let controlMode = settings.control ? settings.control : 'dispControls';
        if (returnValue.key == 'control') controlMode = returnValue.value;
        let offsetType = settings.controlsOffsetType ? settings.controlsOffsetType : 'absoluteOffset';
        if (returnValue.key == 'controlsOffsetType') offsetType = returnValue.value;
        displayElement(`#controlContainer`,true);
        displayElement(`#displayedControlsContainer`,false);
        displayElement(`#toolContainer`,false);
        displayElement(`#controlsOffsetContainer`,false);

        if (controlMode == 'dispControls' || controlMode == 'dispTools') displayElement(`#displayedControlsContainer`,true);
        else if (controlMode == 'controlsOffset' || controlMode == 'toolsOffset') {
            displayElement(`#controlsOffsetContainer`,true);
            if (offsetType == 'absoluteOffset') displayElement(`#ringColorWrapper`,true);
            else displayElement(`#ringColorWrapper`,false);
        }
        else {
            if (returnValue.key != 'tool') getTools(controlMode);
            if (returnValue.key != undefined && returnValue.key != 'dispControls' && returnValue.key != 'dispTools') {
                const val = {
                    checked: undefined,
                    group: false,
                    index: returnValue.index,
                    key: 'tool',
                    selection: [],
                    type: 'select-one',
                    value: 'open'
                }
                saveSettings(val);
            }
            displayElement(`#toolContainer`,true);
        }
    }
    else if (mode == 'darkness'){   //darkness
        let darknessFunction = settings.darknessFunction ? settings.darknessFunction : 'value';
        if (returnValue.key == 'darknessFunction') darknessFunction = returnValue.value;
        
        displayElement(`#darknessContainer`,true);
        if (darknessFunction == 'value' || darknessFunction == 'incDec') {
            displayElement(`#darknessVal`,true);
            displayElement(`#darknessAnimation`,true);
        }
        else {
            displayElement(`#darknessVal`,false); 
            displayElement(`#darknessAnimation`,false);
        }     
    }
    else if (mode == 'rollDice')    //roll dice
        displayElement(`#rollDiceContainer`,true);
    else if (mode == 'rollTables')   //roll table
        displayElement(`#rollTableContainer`,true);
    else if (mode == 'sidebarTab'){   //sidebar
        displayElement(`#sidebarContainer`,true);
        displayElement(`#ringColorWrapper`,true);
    }
    else if (mode == 'compendium' || mode == 'journal')   //open compendium or journal
        displayElement(`#compendiumContainer`,true);
    else if (mode == 'chatMessage')
        displayElement(`#chatMessageContainer`,true);
    else if (mode == 'rollOptions') {
        displayElement(`#rollOptionsContainer`,true);
        displayElement(`#ringColorWrapper`,true);
    }
    else if (mode == 'rollMode') {
        displayElement(`#rollModeContainer`,true);
        displayElement(`#ringColorWrapper`,true);
    }
}

function setSystemDependentElements() {
    let otherModeElement = document.getElementById(`otherMode`);

    let newotherModeOptions = [];

    if (system == "pf2e") {
        newotherModeOptions.push({value:'compendiumBrowser',name:'Open Compendium Browser'});
    }

    for (let option of newotherModeOptions) {
        let newOption = document.createElement('option');
        newOption.value = option.value;
        newOption.innerHTML = option.name;
        otherModeElement.appendChild(newOption);
    }
    
    const otherModeSelection = settings.otherMode ? settings.otherMode : 'pause';
    otherModeElement.value = otherModeSelection;
}

function getTools(control) {
    let tools = [];
    if (control == 'token') {
        tools = [
            {value:'select',name:'Select Tokens'},
            {value:'target',name:'Select Targets'},
            {value:'ruler',name:'Measure Distance'}
        ]
    }
    else if (control == 'measure') {
        tools = [
            {value:'circle',name:'Circle Template'},
            {value:'cone',name:'Cone Template'},
            {value:'rect',name:'Rectangle Template'},
            {value:'ray',name:'Ray Template'},
            {value:'clear',name:'Clear Templates'}
        ]
    }
    else if (control == 'tiles') {
        tools = [
            {value:'select',name:'Select Tiles'},
            {value:'tile',name:'Place Tile'},
            {value:'browse',name:'Tile Browser'},
            {value:'foreground',name:'Foreground Layer'}
        ]
    }
    else if (control == 'drawings') {
        tools = [
            {value:'select',name:'Select Drawings'},
            {value:'rect',name:'Draw Rectangle'},
            {value:'ellipse',name:'Draw Ellipse'},
            {value:'polygon',name:'Draw Polygon'},
            {value:'freehand',name:'Draw Freehand'},
            {value:'text',name:'Draw Text'},
            {value:'configure',name:'Configure Drawing'},
            {value:'clear',name:'Clear Drawings'}
        ]
    }
    else if (control == 'walls') {
        tools = [
            {value:'select',name:'Select Walls'},
            {value:'walls',name:'Draw Walls'},
            {value:'terrain',name:'Terrain Walls'},
            {value:'invisible',name:'Invisible Walls'},
            {value:'ethereal',name:'Ethereal Walls'},
            {value:'doors',name:'Draw Doors'},
            {value:'secret',name:'Secret Doors'},
            {value:'clone',name:'Clone Walls'},
            {value:'snap',name:'Force Snap to Grid'},
            {value:'clear',name:'Clear Walls'}
        ]
    }
    else if (control == 'lighting') {
        tools = [
            {value:'light',name:'Draw Light Source'},
            {value:'day',name:'Transition to Daylight'},
            {value:'night',name:'Transition to Darkness'},
            {value:'reset',name:'Reset Fog of War'},
            {value:'clear',name:'Clear Lights'}
        ]
    }
    else if (control == 'sounds') {
        tools = [
            {value:'sound',name:'Draw Ambient Sound'},
            {value:'preview',name:'Preview Ambient Sounds'},
            {value:'clear',name:'Clear Sounds'}
        ]
    }
    else if (control == 'notes') {
        tools = [
            {value:'select',name:'Select Notes'},
            {value:'toggle',name:'Toggle Notes Display'},
            {value:'clear',name:'Clear Notes'}
        ]
    }

    let element = document.getElementById('tool');
    for(let i=element.options.length; i>0; i--) {
        element.remove(i);
    }
    for (let option of tools) {
        let newOption = document.createElement('option');
        newOption.value = option.value;
        newOption.innerHTML = option.name;
        element.appendChild(newOption);
    }
}

/*
else if (control == '') {
        tools = [
            {value:'',name:''},
            {value:'',name:''},
            {value:'',name:''}
        ]
    }
    */