function setUI(returnValue={key:null,value:null}) {
    let mode = settings.tokenMode ? settings.tokenMode : 'token';
    let onClick = settings.onClick ? settings.onClick : 'none';
    let stats = settings.stats ? settings.stats : 'none';
    let selection = settings.selection ? settings.selection: 'selected';
    let macroMode = settings.macroMode ? settings.macroMode : 'hotbar';
    let roll = settings.roll ? settings.roll : 'ability';
    let pageWideToken = settings.pageWideToken ? settings.pageWideToken : false;
    let pageTokenSelection = settings.pageTokenSelection ? settings.pageTokenSelection : false;

    if (returnValue.key == 'tokenMode') mode = returnValue.value;
    else if (returnValue.key == 'stats' || returnValue.key == 'statsDemonlord') stats = returnValue.value;
    else if (returnValue.key == 'onClick' || returnValue.key == 'onClickDemonlord') onClick = returnValue.value;
    else if (returnValue.key == 'selection') selection = returnValue.value;
    else if (returnValue.key == 'macroMode') macroMode = returnValue.value;
    else if (returnValue.key == 'roll') roll = returnValue.value;
    else if (returnValue.key == 'pageTokenSelection') pageTokenSelection = returnValue.value;
    
    if (debugEn) console.log('settings',settings)
    displayElement(`#tokenWrapper`,false);
    displayElement(`#itemWrapper`,false);
    displayElement(`#conditionWrapper`,false);
    displayElement(`#visionWrapper`,false);
    displayElement('#wildcardWrapper',false);
    displayElement('#customOnClickWrapper',false);
    displayElement('#cubConditionWrapper',false);
    displayElement('#tokenNameWrapper',false);
    displayElement(`#abilityContainer`,false);
    displayElement(`#saveContainer`,false);
    displayElement(`#customContainer`,false);
    displayElement('#macroWrapper',false);
    displayElement('#rollWrapper',false);
    displayElement('#rollAbilityContainer',false);
    displayElement('#rollSkillContainer',false);
    displayElement(`#rollSaveContainer`,false);
    displayElement('#skillContainer',false);
    displayElement('#moveWrapper',false);
    displayElement(`#rotateWrapper`,false);
    displayElement(`#pageWideWrapper`,false);
    displayElement(`#pageTokenNameWrapper`,false);

    if (returnValue.key == 'pageSettings') {
        
        if (pageWideToken) {
            if (settings.tokenName != pageSettings.tokenId) {
                saveSettings({key:'tokenName',value:settings.tokenName});
                document.querySelector('#tokenName').value = pageSettings.tokenId;
                settings.tokenName = pageSettings.tokenId;
            }
            if (settings.selection != pageSettings.tokenSelection) {
                saveSettings({key:'selection',value:selection});
                document.querySelector('#selection').value = pageSettings.tokenSelection;
                settings.selection = pageSettings.tokenSelection;
                selection = pageSettings.tokenSelection;
            }  
        }
    } 

    else if (returnValue.key == 'pageWideToken' && returnValue.checked) {
        if (pageSettings.tokenId == '' || pageSettings.tokenId == null || pageSettings.tokenId == undefined) pageSettings.tokenId = settings.tokenName;
        else {
            document.querySelector('#tokenName').value = pageSettings.tokenId;
            settings.tokenName = pageSettings.tokenId;
        }
        if (pageSettings.tokenSelection == '' || pageSettings.tokenSelection == null || pageSettings.tokenSelection == undefined) pageSettings.tokenSelection = selection;
        else {
            selection = pageSettings.tokenSelection;
            document.querySelector('#selection').value = pageSettings.tokenSelection;
        }
        const json = {
            action: $SD.actionInfo['action'],
            event: 'sendToPlugin',
            context: $SD.uuid,
            payload: {
                device: $SD.actionInfo['device'],
                pageSettings
            }
        }
        $SD.connection.send(JSON.stringify(json));
    }
    //else if (returnValue.key == 'pageWideToken') {
    //    $SD.emit('piDataChanged', {key:'pageSettings',value:null});
    //}

    else if (returnValue.key == 'tokenName' && pageWideToken) {
        pageSettings.tokenId = returnValue.value;
        const json = {
            action: $SD.actionInfo['action'],
            event: 'sendToPlugin',
            context: $SD.uuid,
            payload: {
                device: $SD.actionInfo['device'],
                pageSettings
            }
        }
        $SD.connection.send(JSON.stringify(json));
    }

    else if (returnValue.key == 'selection' && pageWideToken) {
        pageSettings.tokenSelection = returnValue.value;
        const json = {
            action: $SD.actionInfo['action'],
            event: 'sendToPlugin',
            context: $SD.uuid,
            payload: {
                device: $SD.actionInfo['device'],
                pageSettings
            }
        }
        $SD.connection.send(JSON.stringify(json));
        //$SD.emit('piDataChanged', {key:'pageSettings',value:pageSettings});
    }

    if (selection != 'selected') {
        displayElement('#tokenNameWrapper',true);
    }
    if (selection == 'tokenId' || selection == 'actorId') {
        element = document.querySelector('#tokenNameLabel');
        if (element != null) element.innerHTML = 'Id';
    }
    

    if (mode == 'token') {
        displayElement(`#tokenWrapper`,true);
        
        
        if (onClick == 'condition') displayElement(`#conditionWrapper`,true);
        else if (onClick == 'vision') displayElement(`#visionWrapper`,true);
        else if (onClick == 'wildcard') displayElement('#wildcardWrapper',true);
        else if (onClick == 'custom') displayElement('#customOnClickWrapper',true);
        else if (onClick == 'cubCondition') displayElement('#cubConditionWrapper',true);
        else if (onClick == 'macro') {
            displayElement('#macroWrapper',true);
            if (macroMode == 'name') {
                displayElement('#macroArgsWrapper',true);
                element = document.querySelector('#macroNumberLabel');
                if (element != null) element.innerHTML = 'Macro Name';
            }
            else displayElement('#macroArgsWrapper',false);
        }
        else if (onClick == 'roll') {
            displayElement('#rollWrapper',true);
            if (roll == 'ability') displayElement('#rollAbilityContainer',true);
            else if (roll == 'save') displayElement(`#rollSaveContainer`,true);
            else if (roll == 'skill') displayElement('#rollSkillContainer',true);
        }
        else if (onClick == 'move') {
            displayElement('#moveWrapper',true); 
        }
        else if (onClick == 'rotate') {
            displayElement(`#rotateWrapper`,true);   
        }
        else if (onClick == 'setPageWideToken') {
            displayElement(`#pageWideWrapper`,true);
            if (pageTokenSelection != 'selected') {
                displayElement('#pageTokenNameWrapper',true);
            }
            if (pageTokenSelection == 'tokenId' || pageTokenSelection == 'actorId') {
                element = document.querySelector('#pageTokenNameLabel');
                if (element != null) element.innerHTML = 'Id';
            }
        }
    
        if (stats == 'custom') displayElement(`#customContainer`,true);
        else if (stats == 'Ability' || stats == 'AbilityMod') displayElement(`#abilityContainer`,true);
        else if (stats == 'Save') displayElement(`#saveContainer`,true);
        else if (stats == 'Skill') displayElement(`#skillContainer`,true);
    }
    else {
        displayElement(`#itemWrapper`,true);
        displayElement(`#inventoryWrapper`,false);
        displayElement(`#featureWrapper`,false);
        displayElement(`#spellWrapper`,false);
        if (mode == 'inventory') displayElement(`#inventoryWrapper`,true);
        else if (mode == 'features') displayElement(`#featureWrapper`,true);
        else if (mode == 'spellbook') displayElement(`#spellWrapper`,true);
    }
    
    
}

function setSystemDependentElements() {
    setElements('stats');
    setElements('ability');
    setElements('rollAbility');
    setElements('onClick');
    setElements('condition');
    setElements('rollSkill');
    setElements('skill');
    setElements('roll');
    setElements('save');
    setElements('rollSave');
    setElements('inventoryType');
    setElements('featureType');

    autoScaleElement('custom');
    autoScaleElement('customOnClickFormula');
}

function setPageSettings(pageSettings) {

}

window.onload = function() {
    document.getElementById("custom").onkeyup = function() {
        autoScaleElement('custom');
    };
    document.getElementById("customOnClickFormula").onkeyup = function() {
        autoScaleElement('customOnClickFormula');
    };
}

function autoScaleElement(id) {
    let element = document.getElementById(id);
    element.style.height = "auto";
    element.style.height = (element.scrollHeight) + "px";
}