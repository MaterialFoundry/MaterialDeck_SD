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
    else if (macroMode == 'name') {
        displayElement(`#macroTriggerStuff`,true);
        displayElement(`#macroArgsWrapper`,true);
        element = document.querySelector('#macroNumberLabel');
        if (element != null) element.innerHTML = 'Macro Name';
    }
    else {
        displayElement(`#macroTriggerStuff`,true);
        displayElement(`#backgroundContainer`,true);
    }
}

function setSystemDependentElements() {

}