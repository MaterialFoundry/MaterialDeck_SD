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
            if (playlistMode == 'track' || playlistMode == 'trackName') displayElement(`#trackNrContainer`,true);
            displayElement(`#playlistPlayWrapper`,true);
        }
    }

    if (playlistMode == 'track' || playlistMode == 'trackName') {
        if (playlistType == 'incDecVol' || playlistType == 'setVol') displayElement(`#trackVolumeWrapper`,true);
        displayElement(`#dispTrackVolume`,true);
        addSelectOption('playlistType','incDecVol','Increase/Decrease Volume');
        addSelectOption('playlistType','setVol','Set Volume');
    }
    else if (playlistMode == 'playlist' || playlistMode == 'playlistName') {
        removeSelectOption('playlistType','incDecVol');
        removeSelectOption('playlistType','setVol');
    }
    if (playlistMode == 'track' || playlistMode == 'playlist') {
        addSelectOption('playlistType','offset','Absolute Offset');
        addSelectOption('playlistType','relativeOffset','Relative Offset');
        document.getElementById('playlistNrLabel').innerHTML = 'Playlist Nr';
        document.getElementById('trackNrLabel').innerHTML = 'Track Nr';
    }
    else if (playlistMode == 'trackName' || playlistMode == 'playlistName') {
        removeSelectOption('playlistType','offset');
        removeSelectOption('playlistType','relativeOffset');
        document.getElementById('playlistNrLabel').innerHTML = 'Playlist Name/ID';
        document.getElementById('trackNrLabel').innerHTML = 'Track Name/ID';
    }
    document.getElementById('playlistType').value = playlistType;
}

function setSystemDependentElements() {

}