/* global addDynamicStyles, $SD, Utils, $TEST */
/* eslint-disable no-extra-boolean-cast */
/* eslint-disable no-else-return */

/**
 * This example contains a working Property Inspector, which already communicates
 * with the corresponding plugin throug settings and/or direct messages.
 * If you want to use other control-types, we recommend copy/paste these from the
 * PISamples demo-library, which already contains quite some example DOM elements
 */


/**
 * First we declare a global variable, which change all elements behaviour
 * globally. It installs the 'onchange' or 'oninput' event on the HTML controls and fiels.
 *
 * Change this, if you want interactive elements act on any modification (oninput),
 * or while their value changes 'onchange'.
 */

var onchangeevt = 'onchange'; // 'oninput';

/**
 * cache the static SDPI-WRAPPER, which contains all your HTML elements.
 * Please make sure, you put all HTML-elemenets into this wrapper, so they
 * are drawn properly using the integrated CSS.
 */

let sdpiWrapper = document.querySelector('.sdpi-wrapper');

/**
 * Since the Property Inspector is instantiated every time you select a key
 * in Stream Deck software, we can savely cache our settings in a global variable.
 */

let settings;

let system = 'dnd5e';

 /**
  * The 'connected' event is the first event sent to Property Inspector, after it's instance
  * is registered with Stream Deck software. It carries the current websocket, settings,
  * and other information about the current environmet in a JSON object.
  * You can use it to subscribe to events you want to use in your plugin.
  */

$SD.on('connected', (jsn) => {
    if (debugEn) console.log(jsn);
    /**
     * The passed 'applicationInfo' object contains various information about your
     * computer, Stream Deck version and OS-settings (e.g. colors as set in your
     * OSes display preferences.)
     * We use this to inject some dynamic CSS values (saved in 'common_pi.js'), to allow
     * drawing proper highlight-colors or progressbars.
     */

    if (debugEn) console.log("connected");
    addDynamicStyles($SD.applicationInfo.colors, 'connectSocket');

    /**
     * Current settings are passed in the JSON node
     * {actionInfo: {
     *      payload: {
     *          settings: {
     *                  yoursetting: yourvalue,
     *                  otherthings: othervalues
     * ...
     * To conveniently read those settings, we have a little utility to read
     * arbitrary values from a JSON object, eg:
     *
     * const foundObject = Utils.getProp(JSON-OBJECT, 'path.to.target', defaultValueIfNotFound)
     */

    settings = Utils.getProp(jsn, 'actionInfo.payload.settings', false);
    if (settings) {
        updateUI(settings);
    }
});

/**
 * The 'sendToPropertyInspector' event can be used to send messages directly from your plugin
 * to the Property Inspector without saving these messages to the settings.
 */

$SD.on('sendToPropertyInspector', jsn => {
    const pl = jsn.payload;

    if (pl.gameSystem != undefined) 
        system = pl.gameSystem;

    if (debugEn) console.log("Game system: ",system);

    let statsElement = document.getElementById(`stats`);
    let abilityElement = document.getElementById(`ability`);
    let onClickElement = document.getElementById(`onClick`);
    let conditionElement = document.getElementById('condition');
    
    let newStatOptions = [];
    let newAbilityScores = [];
    let newOnClickOptions = [];
    let newConditionOptions = [];


    if (system == 'D35E') {
        newStatOptions.push({value:'HP', name:'HP'});
        newStatOptions.push({value:'HPbox', name:'HP (box)'});
        newStatOptions.push({value:'TempHP', name:'Temp HP'});
        newStatOptions.push({value:'AC', name:'AC'});
        newStatOptions.push({value:'Speed', name:'Speed'});
        newStatOptions.push({value:'Init', name:'Initiative'});
        newStatOptions.push({value:'Ability', name:'Ability Scores'});
        newStatOptions.push({value:'AbilityMod', name:'Ability Score Modifiers'});
        newStatOptions.push({value:'Prof', name:'Proficiency'});

        newConditionOptions.push({value:'dead', name:'Dead'});
        newConditionOptions.push({value:'blind', name:'Blind'});
        newConditionOptions.push({value:'dazzled', name:'Dazzled'});
        newConditionOptions.push({value:'deaf', name:'Deaf'});
        newConditionOptions.push({value:'entangled', name:'Entangled'});
        newConditionOptions.push({value:'fatigued', name:'Fatigued'});
        newConditionOptions.push({value:'exhausted', name:'Exhausted'});
        newConditionOptions.push({value:'grappled', name:'Grappled'});
        newConditionOptions.push({value:'helpless', name:'Helpless'});
        newConditionOptions.push({value:'paralyzed', name:'Paralyzed'});
        newConditionOptions.push({value:'pinned', name:'Pinned'});
        newConditionOptions.push({value:'fear', name:'Fear'});
        newConditionOptions.push({value:'sickened', name:'Sickened'});
        newConditionOptions.push({value:'stunned', name:'Stunned'});
        newConditionOptions.push({value:'shaken', name:'Shaken'});
    }
    else if (system == 'pf1') {
        newStatOptions.push({value:'HP', name:'HP'});
        newStatOptions.push({value:'HPbox', name:'HP (box)'});
        newStatOptions.push({value:'TempHP', name:'Temp HP'});
        newStatOptions.push({value:'AC', name:'AC'});
        newStatOptions.push({value:'Speed', name:'Speed'});
        newStatOptions.push({value:'Init', name:'Initiative'});
        newStatOptions.push({value:'Ability', name:'Ability Scores'});
        newStatOptions.push({value:'AbilityMod', name:'Ability Score Modifiers'});
        newStatOptions.push({value:'Prof', name:'Proficiency'});

        newConditionOptions.push({value:'dead', name:'Dead'});
        newConditionOptions.push({value:'bleed', name:'Bleed'});
        newConditionOptions.push({value:'blind', name:'Blind'});
        newConditionOptions.push({value:'confused', name:'Confused'});
        newConditionOptions.push({value:'dazzled', name:'Dazzled'});
        newConditionOptions.push({value:'deaf', name:'Deaf'});
        newConditionOptions.push({value:'entangled', name:'Entangled'});
        newConditionOptions.push({value:'fatigued', name:'Fatigued'});
        newConditionOptions.push({value:'exhausted', name:'Exhausted'});
        newConditionOptions.push({value:'grappled', name:'Grappled'});
        newConditionOptions.push({value:'helpless', name:'Helpless'});
        newConditionOptions.push({value:'incorporeal', name:'Incorporeal'});
        newConditionOptions.push({value:'invisible', name:'Invisible'});
        newConditionOptions.push({value:'paralyzed', name:'Paralyzed'});
        newConditionOptions.push({value:'pinned', name:'Pinned'});
        newConditionOptions.push({value:'prone', name:'Prone'});
        newConditionOptions.push({value:'staggered', name:'Staggered'});
        newConditionOptions.push({value:'stunned', name:'Stunned'});
        newConditionOptions.push({value:'shaken', name:'Shaken'});
        newConditionOptions.push({value:'frightened', name:'Frightened'});
        newConditionOptions.push({value:'panicked', name:'Panicked'});
        newConditionOptions.push({value:'sickened', name:'Sickened'});
        newConditionOptions.push({value:'nauseated', name:'Nauseated'});
        newConditionOptions.push({value:'dazed', name:'Dazed'});
    }
    else if (system == 'pf2e') {
        newStatOptions.push({value:'HP', name:'HP'});
        newStatOptions.push({value:'HPbox', name:'HP (box)'});
        newStatOptions.push({value:'TempHP', name:'Temp HP'});
        newStatOptions.push({value:'AC', name:'AC'});
        newStatOptions.push({value:'ShieldHP', name:'Shield HP'});
        newStatOptions.push({value:'Speed', name:'Speed'});
        newStatOptions.push({value:'Init', name:'Initiative'});
        newStatOptions.push({value:'Ability', name:'Ability Scores'});
        newStatOptions.push({value:'AbilityMod', name:'Ability Score Modifiers'});
        newStatOptions.push({value:'Prof', name:'Proficiency'});

        newConditionOptions.push({value:'blinded', name:'Blinded'});
        newConditionOptions.push({value:'broken', name:'Broken'});
        newConditionOptions.push({value:'clumsy', name:'Clumsy'});
        newConditionOptions.push({value:'concealed', name:'Concealed'});
        newConditionOptions.push({value:'confused', name:'Confused'});
        newConditionOptions.push({value:'controlled', name:'Controlled'});
        newConditionOptions.push({value:'dazzled', name:'Dazzled'});
        newConditionOptions.push({value:'deafened', name:'Deafened'});
        newConditionOptions.push({value:'doomed', name:'Doomed'});
        newConditionOptions.push({value:'drained', name:'Drained'});
        newConditionOptions.push({value:'dying', name:'Drying'});
        newConditionOptions.push({value:'encumbered', name:'Encumbered'});
        newConditionOptions.push({value:'enfeebled', name:'Enfeebled'});
        newConditionOptions.push({value:'fascinated', name:'Fascinated'});
        newConditionOptions.push({value:'fatigued', name:'Fatigued'});
        newConditionOptions.push({value:'flatFooted', name:'Flat Footed'});
        newConditionOptions.push({value:'fleeing', name:'Fleeing'});
        newConditionOptions.push({value:'frightened', name:'Frightened'});
        newConditionOptions.push({value:'grabbed', name:'Grabbed'});
        newConditionOptions.push({value:'immobilized', name:'Immobilized'});
        newConditionOptions.push({value:'invisible', name:'Invisible'});
        newConditionOptions.push({value:'paralyzed', name:'Paralyzed'});
        newConditionOptions.push({value:'persistentDamage', name:'Persistent Damage'});
        newConditionOptions.push({value:'petrified', name:'Petrified'});
        newConditionOptions.push({value:'prone', name:'Prone'});
        newConditionOptions.push({value:'quickened', name:'Quickened'});
        newConditionOptions.push({value:'restrained', name:'Restrained'});
        newConditionOptions.push({value:'sickened', name:'Sickened'});
        newConditionOptions.push({value:'slowed', name:'Slowed'});
        newConditionOptions.push({value:'stunned', name:'Stunned'});
        newConditionOptions.push({value:'stupified', name:'Stupified'});
        newConditionOptions.push({value:'unconscious', name:'Unconscious'});
        newConditionOptions.push({value:'wounded', name:'Wounded'});
    }
    else if (system == 'demonlord') {
        newStatOptions.push({value:'HP', name:'HP'});
        newStatOptions.push({value:'HPbox', name:'HP (box)'});
        newStatOptions.push({value:'AC', name:'Defense'});
        newStatOptions.push({value:'ShieldHP', name:'Shield HP'});
        newStatOptions.push({value:'Speed', name:'Speed'});
        newStatOptions.push({value:'Init', name:'Initiative'});
        newStatOptions.push({value:'Ability', name:'Ability Scores'});
        newStatOptions.push({value:'AbilityMod', name:'Ability Score Modifiers'});
        newStatOptions.push({value:'Prof', name:'Proficiency'});

        newOnClickOptions.push({value:'initiative',name:'Toggle Initiative'});

        newConditionOptions.push({value:'asleep', name:'Asleep'});
        newConditionOptions.push({value:'blinded', name:'Blinded'});
        newConditionOptions.push({value:'charmed', name:'Charmed'});
        newConditionOptions.push({value:'compelled', name:'Compelled'});
        newConditionOptions.push({value:'dazed', name:'Dazed'});
        newConditionOptions.push({value:'deafened', name:'Deafened'});
        newConditionOptions.push({value:'defenseless', name:'Defenseless'});
        newConditionOptions.push({value:'diseased', name:'Diseased'});
        newConditionOptions.push({value:'fatigued', name:'Fatigued'});
        newConditionOptions.push({value:'frightened', name:'Frightened'});
        newConditionOptions.push({value:'horrified', name:'Horrified'});
        newConditionOptions.push({value:'grabbed', name:'Grabbed'});
        newConditionOptions.push({value:'immobilized', name:'Immobilized'});
        newConditionOptions.push({value:'impaired', name:'Impaired'});
        newConditionOptions.push({value:'poisoned', name:'Poisoned'});
        newConditionOptions.push({value:'prone', name:'Prone'});
        newConditionOptions.push({value:'slowed', name:'Slowed'});
        newConditionOptions.push({value:'stunned', name:'Stunned'});
        newConditionOptions.push({value:'surprised', name:'Surprised'});
        newConditionOptions.push({value:'unconscious', name:'Unconscious'});
        newConditionOptions.push({value:'injured', name:'Injured'});
    }
    else { //default/dnd5e
        newStatOptions.push({value:'HP', name:'HP'});
        newStatOptions.push({value:'HPbox', name:'HP (box)'});
        newStatOptions.push({value:'TempHP', name:'Temp HP'});
        newStatOptions.push({value:'AC', name:'AC'});
        newStatOptions.push({value:'Speed', name:'Speed'});
        newStatOptions.push({value:'Init', name:'Initiative'});
        newStatOptions.push({value:'Ability', name:'Ability Scores'});
        newStatOptions.push({value:'AbilityMod', name:'Ability Score Modifiers'});
        newStatOptions.push({value:'AbilitySave', name:'Ability Score Save'});
        newStatOptions.push({value:'PassivePerception', name:'Passive Perception'});
        newStatOptions.push({value:'PassiveInvestigation', name:'Passive Investigation'});
        newStatOptions.push({value:'Prof', name:'Proficiency'});

        newConditionOptions.push({value:'dead', name:'Dead'});
        newConditionOptions.push({value:'unconscious', name:'Unconscious'});
        newConditionOptions.push({value:'sleep', name:'Asleep'});
        newConditionOptions.push({value:'stun', name:'Stunned'});
        newConditionOptions.push({value:'prone', name:'Prone'});
        newConditionOptions.push({value:'restrain', name:'Restrained'});
        newConditionOptions.push({value:'paralysis', name:'Paralyzed'});
        newConditionOptions.push({value:'fly', name:'Flying'});
        newConditionOptions.push({value:'blind', name:'Blind'});
        newConditionOptions.push({value:'deaf', name:'Deaf'});
        newConditionOptions.push({value:'silence', name:'Silenced'});
        newConditionOptions.push({value:'fear', name:'Afraid'});
        newConditionOptions.push({value:'burning', name:'Burning'});
        newConditionOptions.push({value:'frozen', name:'Frozen'});
        newConditionOptions.push({value:'shock', name:'Shocked'});
        newConditionOptions.push({value:'corrode', name:'Corroding'});
        newConditionOptions.push({value:'bleeding', name:'Bleeding'});
        newConditionOptions.push({value:'disease', name:'Diseased'});
        newConditionOptions.push({value:'poison', name:'Poisoned'});
        newConditionOptions.push({value:'radiation', name:'Radioactive'});
        newConditionOptions.push({value:'regen', name:'Regeneration'});
        newConditionOptions.push({value:'degen', name:'Degeneration'});
        newConditionOptions.push({value:'upgrade', name:'Empowered'});
        newConditionOptions.push({value:'downgrade', name:'Weakened'});
        newConditionOptions.push({value:'target', name:'Targeted'});
        newConditionOptions.push({value:'eye', name:'Marked'});
        newConditionOptions.push({value:'curse', name:'Cursed'});
        newConditionOptions.push({value:'bless', name:'Blessed'});
        newConditionOptions.push({value:'fireShield', name:'Fire Shield'});
        newConditionOptions.push({value:'coldShield', name:'Ice Shield'});
        newConditionOptions.push({value:'magicShield', name:'Magic Shield'});
        newConditionOptions.push({value:'holyShield', name:'Holy Shield'});
    }

    if (system == 'demonlord') {
        newAbilityScores.push({value:'strength',name:'Strength'});
        newAbilityScores.push({value:'agility',name:'Agility'});
        newAbilityScores.push({value:'intellect',name:'Intellect'});
        newAbilityScores.push({value:'will',name:'Will'});
        newAbilityScores.push({value:'perception',name:'Perception'});
    }
    else {
        newAbilityScores.push({value:'str',name:'Strength'});
        newAbilityScores.push({value:'dex',name:'Dexterity'});
        newAbilityScores.push({value:'con',name:'Constitution'});
        newAbilityScores.push({value:'int',name:'Intelligence'});
        newAbilityScores.push({value:'wis',name:'Wisdom'});
        newAbilityScores.push({value:'cha',name:'Charisma'});
    }

    for (let option of newStatOptions) {
        let newOption = document.createElement('option');
        newOption.value = option.value;
        newOption.innerHTML = option.name;
        statsElement.appendChild(newOption);
    }

    for (let option of newAbilityScores) {
        let newOption = document.createElement('option');
        newOption.value = option.value;
        newOption.innerHTML = option.name;
        abilityElement.appendChild(newOption);
    }

    for (let option of newOnClickOptions) {
        let newOption = document.createElement('option');
        newOption.value = option.value;
        newOption.innerHTML = option.name;
        onClickElement.appendChild(newOption);
    }

    for (let option of newConditionOptions) {
        let newOption = document.createElement('option');
        newOption.value = option.value;
        newOption.innerHTML = option.name;
        conditionElement.appendChild(newOption);
    }

    const statsSelection = settings.stats ? settings.stats : 'none';
    statsElement.value = statsSelection;

    const abilitySelection = settings.ability ? settings.ability : 'str';
    abilityElement.value = abilitySelection;

    const onClickSelection = settings.onClick ? settings.onClick : 'doNothing';
    onClickElement.value = onClickSelection;

    const conditionSelection = settings.condition ? settings.condition : 'removeAll';
    conditionElement.value = conditionSelection;
});


const updateUI = (pl) => {
    if (debugEn) console.log("pl",pl);
    
    const onClick = settings.onClick ? settings.onClick : 'none';
    const stats = settings.stats ? settings.stats : 'none';
    const selection = settings.selection ? settings.selection : 'selected';
    
    if (debugEn) console.log('settings',settings)
    displayElement(`#conditionWrapper`,false);
    displayElement(`#visionWrapper`,false);
    displayElement('#wildcardWrapper',false);
    displayElement('#customOnClickWrapper',false);
    displayElement('#cubConditionWrapper',false);
    displayElement('#tokenNameWrapper',false);
    displayElement(`#abilityContainer`,false);
    displayElement(`#customContainer`,false);

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

    if (stats == 'custom') displayElement(`#customContainer`,true);
    else if (stats == 'Ability' || stats == 'AbilityMod' || stats == 'AbilitySave') displayElement(`#abilityContainer`,true);
    
    
    ////////////////////////////////////////////////////////////////////////////////
    
    const wrapper = document.querySelector(`#wrapper`);
    wrapper.style = '';

    Object.keys(pl).map(e => {
        if (e && e != '') {
            const foundElement = document.querySelector(`#${e}`);
            if (debugEn) console.log(`searching for: #${e}`, 'found:', foundElement);
            if (foundElement && foundElement.type !== 'file') {
                if (foundElement.type == 'checkbox')
                    foundElement.checked = pl[e];
                else 
                    foundElement.value = pl[e];
            }
        }
   })
}

function displayElement(element,display){
    element = document.querySelector(element);
    if (element != null) {
        if (display) element.style = '';
        else element.style = 'display:none';
    }
}

/**
 * Something in the PI changed:
 * either you clicked a button, dragged a slider or entered some text
 *
 * The 'piDataChanged' event is sent, if data-changes are detected.
 * The changed data are collected in a JSON structure
 *
 * It looks like this:
 *
 *  {
 *      checked: false
 *      group: false
 *      index: 0
 *      key: "mynameinput"
 *      selection: []
 *      value: "Elgato"
 *  }
 *
 * If you set an 'id' to an input-element, this will get the 'key' of this object.
 * The input's value will get the value.
 * There are other fields (e.g.
 *      - 'checked' if you clicked a checkbox
 *      - 'index', if you clicked an element within a group of other elements
 *      - 'selection', if the element allows multiple-selections
 * )
 *
 * Please note:
 * the template creates this object for the most common HTML input-controls.
 * This is a convenient way to start interacting with your plugin quickly.
 *
 */

$SD.on('piDataChanged', (returnValue) => {
    var element;
    if (debugEn) console.log('%c%s', 'color: black; background: blue}; font-size: 15px;', 'piDataChanged');
    if (debugEn) console.log('settings',settings);

    let onClick = settings.onClick ? settings.onClick : 'none';
    let stats = settings.stats ? settings.stats : 'none';
    let selection = settings.selection ? settings.selection: 'selected';

    if (returnValue.key == 'stats' || returnValue.key == 'statsDemonlord') stats = returnValue.value;
    else if (returnValue.key == 'onClick' || returnValue.key == 'onClickDemonlord') onClick = returnValue.value;
    else if (returnValue.key == 'selection') selection = returnValue.value;

    displayElement(`#visionWrapper`,false);
    displayElement('#wildcardWrapper',false);
    displayElement('#customOnClickWrapper',false);
    displayElement('#cubConditionWrapper',false);
    displayElement(`#conditionWrapper`,false);
    displayElement('#tokenNameWrapper',false);
    displayElement(`#abilityContainer`,false);
    displayElement(`#customContainer`,false);

    if (selection != 'selected') displayElement('#tokenNameWrapper',true);
    element = document.querySelector('#tokenNameLabel');
    if (element != null && (selection == 'tokenId' || selection == 'actorId')) element.innerHTML = 'Id';
    else if (element != null && (selection == 'tokenName' || selection == 'actorName')) element.innerHTML = 'Name';

    if (onClick == 'condition') displayElement(`#conditionWrapper`,true);
    else if (onClick == 'vision') displayElement(`#visionWrapper`,true);
    else if (onClick == 'wildcard') displayElement('#wildcardWrapper',true);
    else if (onClick == 'custom') displayElement('#customOnClickWrapper',true);
    else if (onClick == 'cubCondition') displayElement('#cubConditionWrapper',true);

    if (stats == 'custom') displayElement(`#customContainer`,true);
    else if (stats == 'Ability' || stats == 'AbilityMod' || stats == 'AbilitySave') displayElement(`#abilityContainer`,true);

    /* SAVE THE VALUE TO SETTINGS */
    saveSettings(returnValue);

    /* SEND THE VALUES TO PLUGIN */
    sendValueToPlugin(returnValue, 'sdpi_collection');
});

/**
 * Below are a bunch of helpers to make your DOM interactive
 * The will cover changes of the most common elements in your DOM
 * and send their value to the plugin on a change.
 * To accomplish this, the 'handleSdpiItemChange' method tries to find the
 * nearest element 'id' and the corresponding value of the element(along with
 * some other information you might need) . It then puts everything in a
 * 'sdpi_collection', where the 'id' will get the 'key' and the 'value' will get the 'value'.
 *
 * In the plugin you just need to listen for 'sdpi_collection' in the sent JSON.payload
 * and save the values you need in your settings (or StreamDeck-settings for persistence).
 *
 * In this template those key/value pairs are saved automatically persistently to StreamDeck.
 * Open the console in the remote debugger to inspect what's getting saved.
 *
 */

 function saveSettings(sdpi_collection) {

    if (typeof sdpi_collection !== 'object') return;
    if (debugEn) console.log("collection",sdpi_collection);
    if (sdpi_collection.hasOwnProperty('key') && sdpi_collection.key != '') {
        if (sdpi_collection.key == 'displayName' || sdpi_collection.key == 'displayIcon'){
            if (debugEn) console.log(sdpi_collection.key, " => ", sdpi_collection.checked);
            settings[sdpi_collection.key] = sdpi_collection.checked;
            if (debugEn) console.log('setSettings....', settings);
            $SD.api.setSettings($SD.uuid, settings);
        }
        else if (sdpi_collection.value && sdpi_collection.value !== undefined) {
            if (debugEn) console.log(sdpi_collection.key, " => ", sdpi_collection.value);
            settings[sdpi_collection.key] = sdpi_collection.value;
            if (debugEn) console.log('setSettings....', settings);
            $SD.api.setSettings($SD.uuid, settings);
        }
    }
 }

 /**
  * 'sendValueToPlugin' is a wrapper to send some values to the plugin
  *
  * It is called with a value and the name of a property:
  *
  * sendValueToPlugin(<any value>), 'key-property')
  *
  * where 'key-property' is the property you listen for in your plugin's
  * 'sendToPlugin' events payload.
  *
  */

 function sendValueToPlugin(value, prop) {
    if (debugEn) console.log("sendValueToPlugin", value, prop);
    if ($SD.connection && $SD.connection.readyState === 1) {
        const json = {
            action: $SD.actionInfo['action'],
            event: 'sendToPlugin',
            context: $SD.uuid,
            payload: {
                [prop]: value,
                targetContext: $SD.actionInfo['context']
            }
        };
        $SD.connection.send(JSON.stringify(json));
    }
}

/** CREATE INTERACTIVE HTML-DOM
 * The 'prepareDOMElements' helper is called, to install events on all kinds of
 * elements (as seen e.g. in PISamples)
 * Elements can get clicked or act on their 'change' or 'input' event. (see at the top
 * of this file)
 * Messages are then processed using the 'handleSdpiItemChange' method below.
 * If you use common elements, you don't need to touch these helpers. Just take care
 * setting an 'id' on the element's input-control from which you want to get value(s).
 * These helpers allow you to quickly start experimenting and exchanging values with
 * your plugin.
 */

function prepareDOMElements(baseElement) {
    baseElement = baseElement || document;
    Array.from(baseElement.querySelectorAll('.sdpi-item-value')).forEach(
        (el, i) => {
            const elementsToClick = [
                'BUTTON',
                'OL',
                'UL',
                'TABLE',
                'METER',
                'PROGRESS',
                'CANVAS'
            ].includes(el.tagName);
            const evt = elementsToClick ? 'onclick' : onchangeevt || 'onchange';

            /** Look for <input><span> combinations, where we consider the span as label for the input
             * we don't use `labels` for that, because a range could have 2 labels.
             */
            const inputGroup = el.querySelectorAll('input + span');
            if (inputGroup.length === 2) {
                const offs = inputGroup[0].tagName === 'INPUT' ? 1 : 0;
                inputGroup[offs].textContent = inputGroup[1 - offs].value;
                inputGroup[1 - offs]['oninput'] = function() {
                    inputGroup[offs].textContent = inputGroup[1 - offs].value;
                };
            }
            /** We look for elements which have an 'clickable' attribute
             * we use these e.g. on an 'inputGroup' (<span><input type="range"><span>) to adjust the value of
             * the corresponding range-control
             */
            Array.from(el.querySelectorAll('.clickable')).forEach(
                (subel, subi) => {
                    subel['onclick'] = function(e) {
                        handleSdpiItemChange(e.target, subi);
                    };
                }
            );
            /** Just in case the found HTML element already has an input or change - event attached,
             * we clone it, and call it in the callback, right before the freshly attached event
            */
            const cloneEvt = el[evt];
            el[evt] = function(e) {
                if (cloneEvt) cloneEvt();
                handleSdpiItemChange(e.target, i);
            };
        }
    );

    /**
     * You could add a 'label' to a textares, e.g. to show the number of charactes already typed
     * or contained in the textarea. This helper updates this label for you.
     */
    baseElement.querySelectorAll('textarea').forEach((e) => {
        const maxl = e.getAttribute('maxlength');
        e.targets = baseElement.querySelectorAll(`[for='${e.id}']`);
        if (e.targets.length) {
            let fn = () => {
                for (let x of e.targets) {
                    x.textContent = maxl ? `${e.value.length}/${maxl}` : `${e.value.length}`;
                }
            };
            fn();
            e.onkeyup = fn;
        }
    });

    baseElement.querySelectorAll('[data-open-url').forEach(e => {
        const value = e.getAttribute('data-open-url');
        if (value) {
            e.onclick = () => {
                let path;
                if (value.indexOf('http') !== 0) {
                    path = document.location.href.split('/');
                    path.pop();
                    path.push(value.split('/').pop());
                    path = path.join('/');
                } else {
                    path = value;
                }
                $SD.api.openUrl($SD.uuid, path);
            };
        } else {
            if (debugEn) console.log(`${value} is not a supported url`);
        }
    });
}

function handleSdpiItemChange(e, idx) {

    /** Following items are containers, so we won't handle clicks on them */

    if (['OL', 'UL', 'TABLE'].includes(e.tagName)) {
        return;
    }

    /** SPANS are used inside a control as 'labels'
     * If a SPAN element calls this function, it has a class of 'clickable' set and is thereby handled as
     * clickable label.
     */

    if (e.tagName === 'SPAN') {
        const inp = e.parentNode.querySelector('input');
        var tmpValue;

        // if there's no attribute set for the span, try to see, if there's a value in the textContent
        // and use it as value
        if (!e.hasAttribute('value')) {
               tmpValue = Number(e.textContent);
            if (typeof tmpValue === 'number' && tmpValue !== null) {
                e.setAttribute('value', 0+tmpValue); // this is ugly, but setting a value of 0 on a span doesn't do anything
                e.value = tmpValue;
            }
        } else {
            tmpValue = Number(e.getAttribute('value'));
        }

        if (inp && tmpValue !== undefined) {
            inp.value = tmpValue;
        } else return;
    }

    const selectedElements = [];
    const isList = ['LI', 'OL', 'UL', 'DL', 'TD'].includes(e.tagName);
    const sdpiItem = e.closest('.sdpi-item');
    const sdpiItemGroup = e.closest('.sdpi-item-group');
    let sdpiItemChildren = isList
        ? sdpiItem.querySelectorAll(e.tagName === 'LI' ? 'li' : 'td')
        : sdpiItem.querySelectorAll('.sdpi-item-child > input');

    if (isList) {
        const siv = e.closest('.sdpi-item-value');
        if (!siv.classList.contains('multi-select')) {
            for (let x of sdpiItemChildren) x.classList.remove('selected');
        }
        if (!siv.classList.contains('no-select')) {
            e.classList.toggle('selected');
        }
    }

    if (sdpiItemChildren.length && ['radio','checkbox'].includes(sdpiItemChildren[0].type)) {
        e.setAttribute('_value', e.checked); //'_value' has priority over .value
    }
    if (sdpiItemGroup && !sdpiItemChildren.length) {
        for (let x of ['input', 'meter', 'progress']) {
            sdpiItemChildren = sdpiItemGroup.querySelectorAll(x);
            if (sdpiItemChildren.length) break;
        }
    }

    if (e.selectedIndex) {
        idx = e.selectedIndex;
    } else {
        sdpiItemChildren.forEach((ec, i) => {
            if (ec.classList.contains('selected')) {
                selectedElements.push(ec.textContent);
            }
            if (ec === e) {
                idx = i;
                selectedElements.push(ec.value);
            }
        });
    }

    const returnValue = {
        key: e.id && e.id.charAt(0) !== '_' ? e.id : sdpiItem.id,
        value: isList
            ? e.textContent
            : e.hasAttribute('_value')
            ? e.getAttribute('_value')
            : e.value
            ? e.type === 'file'
                ? decodeURIComponent(e.value.replace(/^C:\\fakepath\\/, ''))
                : e.value
            : e.getAttribute('value'),
        group: sdpiItemGroup ? sdpiItemGroup.id : false,
        index: idx,
        selection: selectedElements,
        checked: e.checked
    };

    /** Just simulate the original file-selector:
     * If there's an element of class '.sdpi-file-info'
     * show the filename there
     */
    if (e.type === 'file') {
        const info = sdpiItem.querySelector('.sdpi-file-info');
        if (info) {
            const s = returnValue.value.split('/').pop();
            info.textContent =                s.length > 28
                    ? s.substr(0, 10)
                      + '...'
                      + s.substr(s.length - 10, s.length)
                    : s;
        }
    }

    $SD.emit('piDataChanged', returnValue);
}

/**
 * This is a quick and simple way to localize elements and labels in the Property
 * Inspector's UI without touching their values.
 * It uses a quick 'lox()' function, which reads the strings from a global
 * variable 'localizedStrings' (in 'common.js')
 */

// eslint-disable-next-line no-unused-vars
function localizeUI() {
    const el = document.querySelector('.sdpi-wrapper') || document;
    let t;
    Array.from(el.querySelectorAll('sdpi-item-label')).forEach(e => {
        t = e.textContent.lox();
        if (e !== t) {
            e.innerHTML = e.innerHTML.replace(e.textContent, t);
        }
    });
    Array.from(el.querySelectorAll('*:not(script)')).forEach(e => {
        if (
            e.childNodes
            && e.childNodes.length > 0
            && e.childNodes[0].nodeValue
            && typeof e.childNodes[0].nodeValue === 'string'
        ) {
            t = e.childNodes[0].nodeValue.lox();
            if (e.childNodes[0].nodeValue !== t) {
                e.childNodes[0].nodeValue = t;
            }
        }
    });
}

/**
 *
 * Some more (de-) initialization helpers
 *
 */

document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add(navigator.userAgent.includes("Mac") ? 'mac' : 'win');
    prepareDOMElements();
    $SD.on('localizationLoaded', (language) => {
        localizeUI();
    });
});

/** the beforeunload event is fired, right before the PI will remove all nodes */
window.addEventListener('beforeunload', function(e) {
    e.preventDefault();
    sendValueToPlugin('propertyInspectorWillDisappear', 'property_inspector');
    // Don't set a returnValue to the event, otherwise Chromium with throw an error.  // e.returnValue = '';
});

function gotCallbackFromWindow(parameter) {
    if (debugEn) console.log(parameter);
}
