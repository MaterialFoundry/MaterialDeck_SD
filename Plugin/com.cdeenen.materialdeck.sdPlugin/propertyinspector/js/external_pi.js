function setUI(returnValue={key:null,value:null}) {
    let module = settings.module ? settings.module : 'fxmaster';
    let fxMasterType = settings.fxMasterType ? settings.fxMasterType : 'weatherControls';
    let aboutTimeOnClick = settings.aboutTimeOnClick ? settings.aboutTimeOnClick : 'none';
    let aboutTimeActive = settings.aboutTimeActive;
    
    if (returnValue.key == 'module') module = returnValue.value;
    else if (returnValue.key == 'fxMasterType') fxMasterType = returnValue.value;
    else if (returnValue.key == 'aboutTimeOnClick') aboutTimeOnClick = returnValue.value;
    else if (returnValue.key == 'aboutTimeActive') aboutTimeActive = returnValue.checked;

    displayElement(`#fxMasterWrapper`,false);
    displayElement(`#weatherControlsWrapper`,false);
    displayElement(`#colorizeWrapper`,false);
    displayElement(`#filterWrapper`,false);
    displayElement('#gmScreenWrapper',false);
    displayElement('#triggerHappyWrapper',false);
    displayElement('#sharedVisionWrapper',false);
    displayElement('#mookWrapper',false);
    displayElement('#notYourTurnWrapper',false);
    displayElement('#lockViewWrapper',false);
    displayElement('#aboutTimeWrapper',false);
    displayElement('#aboutTimeStartStopWrapper',false);
    displayElement('#aboutTimeAdvanceWrapper',false);
    displayElement('#aboutTimeRingWrapper',false);

    if (module == 'fxmaster'){
        displayElement(`#fxMasterWrapper`,true);
        if (fxMasterType == 'weatherControls')
            displayElement(`#weatherControlsWrapper`,true);
        else if (fxMasterType == 'colorize')
            displayElement(`#colorizeWrapper`,true);
        else if (fxMasterType == 'filters')
            displayElement(`#filterWrapper`,true);
    }
    else if (module == 'gmscreen')
        displayElement('#gmScreenWrapper',true);
    else if (module == 'triggerHappy')
        displayElement('#triggerHappyWrapper',true);
    else if (module == 'sharedVision')
        displayElement('#sharedVisionWrapper',true);
    else if (module == 'mookAI')
        displayElement('#mookWrapper',true);
    else if (module == 'notYourTurn')
        displayElement('#notYourTurnWrapper',true);
    else if (module == 'lockView')
        displayElement('#lockViewWrapper',true);
    else if (module == 'aboutTime') {
        displayElement('#aboutTimeWrapper',true);
        if (aboutTimeOnClick == 'startStop')
            displayElement('#aboutTimeStartStopWrapper',true);
        else if (aboutTimeOnClick == 'advance') {
            displayElement('#aboutTimeAdvanceWrapper',true);
            document.querySelector('#advanceModeLabel').innerHTML="Advance";
        }
        else if (aboutTimeOnClick == 'recede') {
            displayElement('#aboutTimeAdvanceWrapper',true);
            document.querySelector('#advanceModeLabel').innerHTML="Recede";
        }
        if (aboutTimeActive) displayElement('#aboutTimeRingWrapper',true);   
    } 
    else if (module == 'custom') {
        
    }
}

function setSystemDependentElements() {

}
