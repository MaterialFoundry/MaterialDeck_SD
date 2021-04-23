function setUI(returnValue={key:null,value:null}) {
    let onClick = settings.onClick ? settings.onClick : 'none';
    let stats = settings.stats ? settings.stats : 'none';
    let selection = settings.selection ? settings.selection: 'selected';
    let macroMode = settings.macroMode ? settings.macroMode : 'hotbar';
    let roll = settings.roll ? settings.roll : 'ability';

    if (returnValue.key == 'stats' || returnValue.key == 'statsDemonlord') stats = returnValue.value;
    else if (returnValue.key == 'onClick' || returnValue.key == 'onClickDemonlord') onClick = returnValue.value;
    else if (returnValue.key == 'selection') selection = returnValue.value;
    else if (returnValue.key == 'macroMode') macroMode = returnValue.value;
    else if (returnValue.key == 'roll') roll = returnValue.value;
    
    if (debugEn) console.log('settings',settings)
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

    if (selection != 'selected') displayElement('#tokenNameWrapper',true);
    if (selection == 'tokenId' || selection == 'actorId') {
        element = document.querySelector('#tokenNameLabel');
        if (element != null) element.innerHTML = 'Id';
    }

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

    if (stats == 'custom') displayElement(`#customContainer`,true);
    else if (stats == 'Ability' || stats == 'AbilityMod') displayElement(`#abilityContainer`,true);
    else if (stats == 'Save') displayElement(`#saveContainer`,true);
    else if (stats == 'Skill') displayElement(`#skillContainer`,true);
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

    autoScaleElement('custom');
    autoScaleElement('customOnClickFormula');
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