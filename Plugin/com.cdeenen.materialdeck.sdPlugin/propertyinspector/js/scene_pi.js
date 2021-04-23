function setUI(returnValue={key:null,value:null}) {
    let sceneFunction = settings.sceneFunction ? settings.sceneFunction : 'visible';
    if (returnValue.key == 'sceneFunction') sceneFunction = returnValue.value;
    displayElement(`#sceneContainer`,true);
    displayElement(`#ringColorWrapper`,true);
    displayElement(`#visibleSceneContainer`,false);
    displayElement(`#anySceneContainer`,false);
    displayElement(`#sceneOffsetContainer`,false);
    displayElement(`#sceneViewFunctionContainer`,true);
    if (sceneFunction == 'visible' || sceneFunction == 'dir')
        displayElement(`#visibleSceneContainer`,true);
    else if (sceneFunction == 'any')
        displayElement(`#anySceneContainer`,true);
    else if (sceneFunction == 'offset') {
        displayElement(`#sceneOffsetContainer`,true);
        displayElement(`#sceneViewFunctionContainer`,false);
    }
    else
        displayElement(`#sceneViewFunctionContainer`,false);
}

function setSystemDependentElements() {

}