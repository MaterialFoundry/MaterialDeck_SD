function setUI(returnValue={key:null,value:null}) {
    let macroMode = settings.macroMode ? settings.macroMode : 'hotbar';
    let macroBoardMode = settings.macroBoardMode ? settings.macroBoardMode : 'triggerMacro';
    
    if (returnValue.key == 'macroMode') macroMode = returnValue.value;
    else if (returnValue.key == 'macroBoardMode') macroBoardMode = returnValue.value;

    displayElement(`#macroBoardModeWrapper`,false);
    displayElement(`#macroOffsetStuff`,false);
    displayElement(`#macroTriggerStuff`,false);
    displayElement(`#ringColorWrapper`,false);
    displayElement(`#backgroundContainer`,false);
    displayElement(`#macroArgsWrapper`,false);

    if (macroMode == 'macroBoard') {
        displayElement(`#macroBoardModeWrapper`,true);
        if (macroBoardMode == 'triggerMacro') 
            displayElement(`#macroTriggerStuff`,true);
        else if (macroBoardMode == 'offset') {
            displayElement(`#macroOffsetStuff`,true);
            displayElement(`#ringColorWrapper`,true);
            displayElement(`#backgroundContainer`,true);
        }
    }
    else if (macroMode == 'name' || macroMode == 'id') {
        displayElement(`#macroTriggerStuff`,true);
        displayElement(`#macroArgsWrapper`,true);
    }
    else {
        displayElement(`#macroTriggerStuff`,true);
        displayElement(`#backgroundContainer`,true);
    }

    let element = document.querySelector('#macroNumberLabel');
    if (element != null) {
        if (macroMode == 'name') element.innerHTML = '<a href="https://github.com/MaterialFoundry/MaterialDeck/wiki/Macro-Action#macro-name" target=”_blank”>Name/ID</a>';
        else element.innerHTML = '<a href="https://github.com/MaterialFoundry/MaterialDeck/wiki/Macro-Action#macro-number" target=”_blank”>Macro Number</a>'
    }
}

function setSystemDependentElements() {

}