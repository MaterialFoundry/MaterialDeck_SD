function setUI(returnValue={key:null,value:null}) {
    let mode = settings.combatTrackerMode ? settings.combatTrackerMode : 'combatants';
    let func = settings.combatTrackerFunction ? settings.combatTrackerFunction : 'startStop';
    let dispositionFilter = settings.dispositionFilter ? settings.dispositionFilter : 'all';
    let visibilityFilter = settings.visibilityFilter ? settings.visibilityFilter : 'none';
    let sceneMode = settings.sceneMode ? settings.sceneMode : 'current';
    
    if (returnValue.key == 'combatTrackerMode') mode = returnValue.value;
    if (returnValue.key == 'combatTrackerFunction') func = returnValue.value;
    if (returnValue.key == 'sceneMode') sceneMode = returnValue.value;

    displayElement(`#funcWrapper`,false);
    displayElement(`#combatantWrapper`,false);
    displayElement(`#turnDisplay`,false);

    if (sceneMode == 'name') displayElement(`#sceneNameContainer`,true);
    else displayElement(`#sceneNameContainer`,false);
    
    if (mode == 'combatants' || mode == 'currentCombatant'){
        if (returnValue.key == 'dispositionFilter') dispositionFilter = returnValue.value; 
        if (returnValue.key == 'visibilityFilter') visibilityFilter = returnValue.value;

        let system = settings.system ? settings.system : 'dnd5e';
        if (returnValue.key == 'system') system = returnValue.value;
        let stats = settings.stats ? settings.stats : 'none';
        if (returnValue.key == 'stats') {
            stats = returnValue.value;
        }
        if (system == 'demonlord') {
            stats = settings.statsDemonlord ? settings.statsDemonlord : 'none';
            if (returnValue.key == 'statsDemonlord') stats = returnValue.value;
        }
        displayElement(`#combatantWrapper`,true);
        displayElement(`#combatantNrSel`,false);
        displayElement(`#dnd5eWrapper`,false);
        displayElement(`#dnd35eWrapper`,false);
        displayElement(`#pf2eWrapper`,false);
        displayElement(`#demonlordWrapper`,false);
        displayElement(`#onClickWrapper`,false);
        displayElement(`#onClickDemonWrapper`,false);

        if (mode == 'combatants') displayElement(`#combatantNrSel`,true);

        if (stats == 'custom') displayElement(`#customContainer`,true);
        else displayElement(`#customContainer`,false);

        if (system == 'dnd5e'){
            displayElement(`#dnd5eWrapper`,true);
            displayElement(`#onClickWrapper`,true);
        }
        else if (system == 'dnd3.5e' || system == 'pf1e'){
            displayElement(`#dnd35eWrapper`,true);
            displayElement(`#onClickWrapper`,true);
        }
        else if (system == 'pf2e'){
            displayElement(`#pf2eWrapper`,true);
            displayElement(`#onClickWrapper`,true);
        }
        else if (system == 'demonlord'){
            displayElement(`#demonlordWrapper`,true);
            displayElement(`#onClickDemonWrapper`,true);
        }

        
        if (dispositionFilter == 'all') displayElement(`#dispModeWrapper`,false);
        else displayElement(`#dispModeWrapper`,true);

        if (visibilityFilter == 'none') displayElement(`#visibilityModeWrapper`,false);
        else displayElement(`#visibilityModeWrapper`,true);
    }
    else if (mode == 'function'){
        displayElement(`#funcWrapper`,true);
        displayElement(`#selectCombatantWrapper`,true);
        
        if (func == 'turnDisplay')
            displayElement(`#turnDisplay`,true);
        else
            displayElement(`#turnDisplay`,false);

        if (func == 'turnDisplay' || func == 'startStop' || func == 'addTokens') displayElement(`#selectCombatantWrapper`,false);
    }
}



function setSystemDependentElements() {
    setElements('stats');
    setElements('onClick');
}