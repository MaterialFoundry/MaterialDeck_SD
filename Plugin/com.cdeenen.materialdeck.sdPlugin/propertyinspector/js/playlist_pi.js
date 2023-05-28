function setUI(returnValue={key:null,value:null}) {
    let playlistType = settings.playlistType ? settings.playlistType : 'playStop';
    let playlistMode = settings.playlistMode ? settings.playlistMode : 'playlist';

    if (returnValue.key == 'playlistType') playlistType = returnValue.value;
    else if (returnValue.key == 'playlistMode') playlistMode = returnValue.value;

    displayElement(`#playlistModeType`,false);
    displayElement(`#playlistOffsetWrapper`,false);
    displayElement(`#playlistPlayWrapper`,false);
    displayElement(`#ringColorWrapper`,false);
    displayElement(`#offsetName`,false);
    displayElement(`#trackNrContainer`,false);
    displayElement(`#stopAllWrapper`,false);
    displayElement(`#trackVolumeWrapper`,false);
    displayElement(`#dispTrackVolume`,false);

    if (playlistMode == 'stopAll' || playlistMode == 'pauseAll') {
        displayElement(`#stopAllWrapper`,true);
    }
    else {
        displayElement('#playlistModeType',true);
        if (playlistType != 'relativeOffset') displayElement(`#ringColorWrapper`,true);
        if (playlistType == 'offset' || playlistType == 'relativeOffset'){
            displayElement(`#playlistOffsetWrapper`,true);
            if (playlistMode == 'playlist') displayElement(`#offsetName`,true);
        }
        else {
            if (playlistMode == 'track') displayElement(`#trackNrContainer`,true);
            displayElement(`#playlistPlayWrapper`,true);
        }
    }

    if (playlistMode == 'track') {
        if (playlistType == 'incDecVol' || playlistType == 'setVol') displayElement(`#trackVolumeWrapper`,true);
        displayElement(`#dispTrackVolume`,true);

        let element = document.getElementById('playlistType');
        for (let option of element.options) {
            if (option.value == 'incDecVol') return;
        }
        let newOption = new Option('Increase/Decrease Volume','incDecVol')
        element.add(newOption);
        let newOption2 = new Option('Set Volume','setVol')
        element.add(newOption2);

        element.value = playlistType; 
    }
    else if (playlistMode == 'playlist') {
        let element = document.getElementById('playlistType');
        for (let i=element.options.length-1; i>=0; i--) {
            const option = element.options[i];
            if (option.value == 'incDecVol') element.removeChild(option)
            if (option.value == 'setVol') element.removeChild(option)
        }
    }
}

function setSystemDependentElements() {

}