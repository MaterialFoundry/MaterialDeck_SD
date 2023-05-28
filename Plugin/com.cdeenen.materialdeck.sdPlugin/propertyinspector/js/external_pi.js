function setUI(returnValue={key:null,value:null}) {
    let module = settings.module ? settings.module : 'fxmaster';
    let fxMasterType = settings.fxMasterType ? settings.fxMasterType : 'weatherControls';
    let fxMasterFilter = settings.fxMasterFilter ? settings.fxMasterFilter : 'lightning';
    let simpleCalendarOnClick = settings.simpleCalendarOnClick ? settings.simpleCalendarOnClick : 'none';
    let simpleCalendarActive = settings.simpleCalendarActive;
    let soundscapeTarget = settings.soundscapeTarget ? settings.soundscapeTarget : 'mixer';
    let soundscapeMixerMode = settings.soundscapeMixerMode ? settings.soundscapeMixerMode : 'startStop';
    let soundscapeSoundboardMode = settings.soundscapeSoundboardMode ? settings.soundscapeSoundboardMode : 'play';
    let monksActiveTilesMode = settings.monksActiveTilesMode ? settings.monksActiveTilesMode : 'toggle';
    
    if (returnValue.key == 'module') module = returnValue.value;
    else if (returnValue.key == 'fxMasterType') fxMasterType = returnValue.value;
    else if (returnValue.key == 'fxMasterFilter') fxMasterFilter = returnValue.value;
    else if (returnValue.key == 'simpleCalendarOnClick') simpleCalendarOnClick = returnValue.value;
    else if (returnValue.key == 'simpleCalendarActive') simpleCalendarActive = returnValue.checked;
    else if (returnValue.key == 'soundscapeTarget') soundscapeTarget = returnValue.value;
    else if (returnValue.key == 'soundscapeMixerMode') soundscapeMixerMode = returnValue.value;
    else if (returnValue.key == 'soundscapeSoundboardMode') soundscapeSoundboardMode = returnValue.value;
    else if (returnValue.key == 'monksActiveTilesMode') monksActiveTilesMode = returnValue.value;

    displayElement(`#fxMasterWrapper`,false);
    displayElement(`#weatherControlsWrapper`,false);
    displayElement(`#filterWrapper`,false);
    displayElement('#gmScreenWrapper',false);
    displayElement('#triggerHappyWrapper',false);
    displayElement('#sharedVisionWrapper',false);
    displayElement('#notYourTurnWrapper',false);
    displayElement('#lockViewWrapper',false);
    displayElement('#simpleCalendarWrapper',false);
    displayElement('#simpleCalendarStartStopWrapper',false);
    displayElement('#simpleCalendarAdvanceWrapper',false);
    displayElement('#simpleCalendarRingWrapper',false);
    displayElement('#soundscapeWrapper',false);
    displayElement('#monksActiveTilesWrapper',false);

    if (module == 'fxmaster'){
        displayElement(`#fxMasterWrapper`,true);
        if (fxMasterType == 'weatherControls')
            displayElement(`#weatherControlsWrapper`,true);
        else if (fxMasterType == 'filters') {
            displayElement(`#filterWrapper`,true);
            displayElement(`#filterPeriodWrapper`,false);
            displayElement(`#filterDurationWrapper`,false);
            displayElement(`#filterBrightnessWrapper`,false);
            displayElement(`#filterNoiseWrapper`,false);
            displayElement(`#filterSpeedWrapper`,false);
            displayElement(`#filterScaleWrapper`,false);
            displayElement(`#filterBlurWrapper`,false);
            displayElement(`#filterBloomWrapper`,false);
            displayElement(`#filterThresholdWrapper`,false);
            displayElement(`#filterSepiaWrapper`,false);
            displayElement(`#filterColorWrapper`,false);
            if (fxMasterFilter == 'lightning') {
                displayElement(`#filterPeriodWrapper`,true);
                displayElement(`#filterDurationWrapper`,true);
                displayElement(`#filterBrightnessWrapper`,true);
            }
            else if (fxMasterFilter == 'underwater') {
                displayElement(`#filterSpeedWrapper`,true);
                displayElement(`#filterScaleWrapper`,true);
            }
            else if (fxMasterFilter == 'predator') {
                displayElement(`#filterNoiseWrapper`,true);
                displayElement(`#filterSpeedWrapper`,true);
            }
            else if (fxMasterFilter == 'color') {
                displayElement(`#filterColorWrapper`,true);
            }
            else if (fxMasterFilter == 'bloom') {
                displayElement(`#filterBlurWrapper`,true);
                displayElement(`#filterBloomWrapper`,true);
                displayElement(`#filterThresholdWrapper`,true);
            }
            else if (fxMasterFilter == 'oldfilm') {
                displayElement(`#filterSepiaWrapper`,true);
                displayElement(`#filterNoiseWrapper`,true);
            }
        }
    }
    else if (module == 'gmscreen')
        displayElement('#gmScreenWrapper',true);
    else if (module == 'triggerHappy')
        displayElement('#triggerHappyWrapper',true);
    else if (module == 'sharedVision')
        displayElement('#sharedVisionWrapper',true);
    else if (module == 'notYourTurn')
        displayElement('#notYourTurnWrapper',true);
    else if (module == 'lockView')
        displayElement('#lockViewWrapper',true);
    else if (module == 'simpleCalendar') {
        displayElement('#simpleCalendarWrapper',true);
        if (simpleCalendarOnClick == 'startStop')
            displayElement('#simpleCalendarStartStopWrapper',true);
        else if (simpleCalendarOnClick == 'advance') {
            displayElement('#simpleCalendarAdvanceWrapper',true);
            document.querySelector('#advanceModeLabel').innerHTML="Advance";
        }
        else if (simpleCalendarOnClick == 'recede') {
            displayElement('#simpleCalendarAdvanceWrapper',true);
            document.querySelector('#advanceModeLabel').innerHTML="Recede";
        }
        if (simpleCalendarActive) displayElement('#simpleCalendarRingWrapper',true);   
    } 
    else if (module == 'soundscape') {
        displayElement('#soundscapeWrapper',true);
        displayElement('#soundscapeMixerWrapper',false);
        displayElement('#soundscapeSoundboardWrapper',false);
        displayElement('#soundscapeMixerValueWrapper',false);
        displayElement('#soundscapeSoundboardValueWrapper',false);
        displayElement('#soundscapeDisplayChannelWrapper',false);

        if (soundscapeTarget == 'mixer') {
            displayElement('#soundscapeMixerWrapper',true);
            
            if (soundscapeMixerMode == 'pan' || soundscapeMixerMode == 'volume')
                displayElement('#soundscapeMixerValueWrapper',true);
        }
        else if (soundscapeTarget == 'soundboard') {
            displayElement('#soundscapeSoundboardWrapper',true);
            displayElement('#soundscapeSounboardSoundWrapper',false);

            if (soundscapeSoundboardMode == 'play') {
                displayElement('#soundscapeSounboardSoundWrapper',true);
                displayElement('#soundscapeDisplayChannelWrapper',true);
            }
            else if (soundscapeSoundboardMode == 'volume')
                displayElement('#soundscapeSoundboardValueWrapper',true);     
        }
    }
    else if (module == 'monksActiveTiles')
        displayElement('#monksActiveTilesWrapper',true);
    else if (module == 'custom') {
        
    }
}

function setSystemDependentElements() {

}




