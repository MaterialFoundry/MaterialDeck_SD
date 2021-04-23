function setUI(returnValue={key:null,value:null}) {
    let mode = settings.soundboardMode ? settings.soundboardMode : 'playSound';
    if (returnValue.key == 'soundboardMode') mode = returnValue.value;
    
    displayElement(`#playContainer`,false);
    displayElement(`#offsetContainer`,false);
    displayElement(`#ringColorWrapper`,false);

    if ( mode == 'playSound')    //play sound
        displayElement(`#playContainer`,true);
    else if ( mode == 'offset'){    //offset
        displayElement(`#offsetContainer`,true);
        displayElement(`#ringColorWrapper`,true);
    }
}

function setSystemDependentElements() {

}