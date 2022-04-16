function setUI(returnValue={key:null,value:null}) {
    let module = settings.module ? settings.module : 'fxmaster';
    let fxMasterType = settings.fxMasterType ? settings.fxMasterType : 'weatherControls';
    let fxMasterFilter = settings.fxMasterFilter ? settings.fxMasterFilter : 'lightning';
    let aboutTimeOnClick = settings.aboutTimeOnClick ? settings.aboutTimeOnClick : 'none';
    let aboutTimeActive = settings.aboutTimeActive;
    let soundscapeTarget = settings.soundscapeTarget ? settings.soundscapeTarget : 'mixer';
    let soundscapeMixerMode = settings.soundscapeMixerMode ? settings.soundscapeMixerMode : 'startStop';
    let soundscapeSoundboardMode = settings.soundscapeSoundboardMode ? settings.soundscapeSoundboardMode : 'play';
    let monksActiveTilesMode = settings.monksActiveTilesMode ? settings.monksActiveTilesMode : 'toggle';
    
    if (returnValue.key == 'module') module = returnValue.value;
    else if (returnValue.key == 'fxMasterType') fxMasterType = returnValue.value;
    else if (returnValue.key == 'fxMasterFilter') fxMasterFilter = returnValue.value;
    else if (returnValue.key == 'aboutTimeOnClick') aboutTimeOnClick = returnValue.value;
    else if (returnValue.key == 'aboutTimeActive') aboutTimeActive = returnValue.checked;
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
    displayElement('#mookWrapper',false);
    displayElement('#notYourTurnWrapper',false);
    displayElement('#lockViewWrapper',false);
    displayElement('#aboutTimeWrapper',false);
    displayElement('#aboutTimeStartStopWrapper',false);
    displayElement('#aboutTimeAdvanceWrapper',false);
    displayElement('#aboutTimeRingWrapper',false);
    displayElement('#soundscapeWrapper',false);
    displayElement('#monksActiveTilesWrapper',false);

    if (module == 'fxmaster'){
        displayElement(`#fxMasterWrapper`,true);
        if (fxMasterType == 'weatherControls')
            displayElement(`#weatherControlsWrapper`,true);
        else if (fxMasterType == 'filters') {
            console.log('check',fxMasterFilter)
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
    
/*
    //console.log('data',data)
    const parentElement = document.getElementById('wrapper');

    const elements = getDataElements('external')

    for (let element of elements) {
        console.log('element',element);
        if (element.display == false) continue;

        //Create parent div for the item
        let parent = document.createElement('div');
        parent.setAttribute('class', 'sdpi-item');
        if (element.type == 'range' || element.type == 'checkbox')
            parent.setAttribute('type', element.type);
        else if (element.type == 'color')
            parent.setAttribute('type', 'range');
        parentElement.appendChild(parent);

        //Create label for the item
        let label = document.createElement('div');
        label.setAttribute('class', 'sdpi-item-label');
        label.innerHTML = element.label;
        parent.appendChild(label);

        //Create item
        if (element.type == 'select') {
            let elmnt = document.createElement(element.type);
            elmnt.id = element.id;
            elmnt.setAttribute('class', 'sdpi-item-value select');
            parent.appendChild(elmnt);
            for (let option of element.options) {
                let optn = document.createElement('option');
                optn.value = option.value;
                optn.text = option.label;
                elmnt.appendChild(optn);
                console.log('option',option)
            }
        }
        else if (element.type == 'checkbox') {
            let elmnt = document.createElement('input');
            elmnt.id = element.id;
            elmnt.setAttribute('class', 'sdpi-item-value');
            elmnt.setAttribute('type', element.type);
            let cbLabel = document.createElement('label');
            cbLabel.htmlFor = element.id;
            let span = document.createElement('span');
            cbLabel.appendChild(span);
            parent.appendChild(elmnt);
            parent.appendChild(cbLabel);
        }
        else if (element.type == 'range') {
            let elmnt = document.createElement('input');
            elmnt.id = element.id;
            elmnt.setAttribute('class', 'sdpi-item-value');
            elmnt.setAttribute('type', element.type);
            elmnt.setAttribute('min', element.min);
            elmnt.setAttribute('max', element.max);
            elmnt.setAttribute('value', element.value);
            parent.appendChild(elmnt);
        }
        else if (element.type == 'color') {
            let elmnt = document.createElement('div');
            elmnt.setAttribute('class', 'sdpi-item-value');
            parent.appendChild(elmnt);

            let elmnt2 = document.createElement('input');
            elmnt2.setAttribute('type', 'color');
            elmnt2.id = element.id;
            elmnt2.value = element.value;
            elmnt.appendChild(elmnt2);
        }
    }
*/
}

function setSystemDependentElements() {

}




