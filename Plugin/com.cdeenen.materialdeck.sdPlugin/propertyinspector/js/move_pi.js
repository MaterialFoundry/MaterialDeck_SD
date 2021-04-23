function setUI(returnValue={key:null,value:null}) {
    let mode = settings.mode ? settings.mode : 'canvas';
    let selection = settings.selection ? settings.selection: 'selected';
    let type = settings.type ? settings.type : 'move';

    if (returnValue.key == 'mode') mode = returnValue.value;
    else if (returnValue.key == 'selection') selection = returnValue.value;
    if (returnValue.key == 'type') type = returnValue.value;

    displayElement(`#dirWrapper`,false);
    displayElement(`#rotWrapper`,false);
    displayElement(`#tokenWrapper`,false);
    displayElement('#tokenNameWrapper',false);

    if (mode == 'canvas') displayElement(`#dirWrapper`,true);
    else if (mode == 'selectedToken'){
        displayElement(`#tokenWrapper`,true);
        if (type == 'move') displayElement(`#dirWrapper`,true);
        else displayElement(`#rotWrapper`,true);

        if (selection != 'selected') displayElement('#tokenNameWrapper',true);
        element = document.querySelector('#tokenNameLabel');
        
        if (element != null && (selection == 'tokenId' || selection == 'actorId')) element.innerHTML = 'Id';
        else if (element != null && (selection == 'tokenName' || selection == 'actorName')) element.innerHTML = 'Name';
    }
}

function setSystemDependentElements() {

}