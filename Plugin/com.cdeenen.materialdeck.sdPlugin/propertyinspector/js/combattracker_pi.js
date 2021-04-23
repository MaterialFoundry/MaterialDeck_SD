function setUI(returnValue={key:null,value:null}) {
    let mode = settings.combatTrackerMode ? settings.combatTrackerMode : 'combatants';
    let func = settings.combatTrackerFunction ? settings.combatTrackerFunction : 'startStop';
    
    if (returnValue.key == 'combatTrackerMode') mode = returnValue.value;
    if (returnValue.key == 'combatTrackerFunction') func = returnValue.value;

    displayElement(`#funcWrapper`,false);
    displayElement(`#combatantWrapper`,false);
    displayElement(`#turnDisplay`,false);

    if (mode == 'combatants' || mode == 'currentCombatant'){
        let system = settings.system ? settings.system : 'dnd5e';
        if (returnValue.key == 'system') system = returnValue.value;
        let stats = settings.stats ? settings.stats : 'none';
        if (returnValue.key == 'stats') stats = returnValue.value;
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
    }
    else if (mode == 'function'){
        displayElement(`#funcWrapper`,true);
        
        if (func == 'turnDisplay')
            displayElement(`#turnDisplay`,true);
        else
            displayElement(`#turnDisplay`,false);
    }
}

function setSystemDependentElements() {
    let statsElement = document.getElementById(`stats`);
    let onClickElement = document.getElementById(`onClick`);
    
    let newStatOptions = [];
    let newOnClickOptions = [];

    if (system == 'D35E') {
        newStatOptions.push({value:'HP', name:'HP'});
        newStatOptions.push({value:'TempHP', name:'Temp HP'});
        newStatOptions.push({value:'AC', name:'AC'});
        newStatOptions.push({value:'Speed', name:'Speed'});
        newStatOptions.push({value:'Init', name:'Initiative'});
    }
    else if (system == 'pf1') {
        newStatOptions.push({value:'HP', name:'HP'});
        newStatOptions.push({value:'TempHP', name:'Temp HP'});
        newStatOptions.push({value:'AC', name:'AC'});
        newStatOptions.push({value:'Speed', name:'Speed'});
        newStatOptions.push({value:'Init', name:'Initiative'});
    }
    else if (system == 'pf2e') {
        newStatOptions.push({value:'HP', name:'HP'});
        newStatOptions.push({value:'TempHP', name:'Temp HP'});
        newStatOptions.push({value:'AC', name:'AC'});
        newStatOptions.push({value:'ShieldHP', name:'Shield HP'});
        newStatOptions.push({value:'Speed', name:'Speed'});
        newStatOptions.push({value:'Init', name:'Initiative'});
    }
    else if (system == 'demonlord') {
        newStatOptions.push({value:'HP', name:'HP'});
        newStatOptions.push({value:'AC', name:'Defense'});
        newStatOptions.push({value:'ShieldHP', name:'Shield HP'});
        newStatOptions.push({value:'Speed', name:'Speed'});
        newStatOptions.push({value:'Init', name:'Initiative'});

        newOnClickOptions.push({value:'initiative',name:'Toggle Initiative'});
    }
    else { //default/dnd5e
        newStatOptions.push({value:'HP', name:'HP'});
        newStatOptions.push({value:'TempHP', name:'Temp HP'});
        newStatOptions.push({value:'AC', name:'AC'});
        newStatOptions.push({value:'Speed', name:'Speed'});
        newStatOptions.push({value:'Init', name:'Initiative'});
        newStatOptions.push({value:'PassivePerception', name:'Passive Perception'});
        newStatOptions.push({value:'PassiveInvestigation', name:'Passive Investigation'});
    }

    for (let option of newStatOptions) {
        let newOption = document.createElement('option');
        newOption.value = option.value;
        newOption.innerHTML = option.name;
        statsElement.appendChild(newOption);
    }

    for (let option of newOnClickOptions) {
        let newOption = document.createElement('option');
        newOption.value = option.value;
        newOption.innerHTML = option.name;
        onClickElement.appendChild(newOption);
    }

    const statsSelection = settings.stats ? settings.stats : 'none';
    statsElement.value = statsSelection;

    const onClickSelection = settings.onClick ? settings.onClick : 'doNothing';
    onClickElement.value = onClickSelection;
}

