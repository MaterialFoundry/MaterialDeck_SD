/* global $CC, Utils, $SD */

/**
 * Here are a couple of wrappers we created to help ypu quickly setup
 * your plugin and subscribe to events sent by Stream Deck to your plugin.
 */

 /**
  * The 'connected' event is sent to your plugin, after the plugin's instance
  * is registered with Stream Deck software. It carries the current websocket
  * and other information about the current environmet in a JSON object
  * You can use it to subscribe to events you want to use in your plugin.
  */

console.log("Material Deck - app.js")
//window.$SD = StreamDeck.getInstance();
//window.$SD.api = SDApi;
//Websocket variables
let ip = "localhost";       //Ip address of the websocket server
let port = "3001";                //Port of the websocket server
let sdCon = false;

let buttonContext = [];
for (let i=0; i<23; i++){
    buttonContext[i] = undefined;
}

$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsn) {
    console.log("connected to Stream Deck",jsn);
    if (serverWS && serverWS.readyState === 1)
        serverWS.send(JSON.stringify({ target: 'server', source: "SD"}));
    sdCon = true;
    connectToServerWS();
    let actions = [];
    actions[0] = 'com.cdeenen.materialdeck.token';
    actions[1] = 'com.cdeenen.materialdeck.move';
    actions[2] = 'com.cdeenen.materialdeck.macro';
    actions[3] = 'com.cdeenen.materialdeck.combattracker';
    actions[4] = 'com.cdeenen.materialdeck.playlist'; 
    actions[5] = 'com.cdeenen.materialdeck.soundboard';
    actions[6] = 'com.cdeenen.materialdeck.other';
    actions[7] = 'com.cdeenen.materialdeck.external';
    actions[8] = 'com.cdeenen.materialdeck.scene';
    

    for (let i=0; i<actions.length; i++){
        $SD.on(actions[i]+'.willAppear', (jsonObj) => action.onEvent(jsonObj));
        $SD.on(actions[i]+'.willDisappear', (jsonObj) => action.onEvent(jsonObj));
        $SD.on(actions[i]+'.keyDown', (jsonObj) => action.onEvent(jsonObj));
        $SD.on(actions[i]+'.keyUp', (jsonObj) => action.onEvent(jsonObj));
        $SD.on(actions[i]+'.didReceiveSettings', (jsonObj) => action.onEvent(jsonObj));
        //$SD.on(actions[i]+'.propertyInspectorDidAppear', (jsonObj) => {
       //     console.log('%c%s', 'color: white; background: black; font-size: 13px;', '[app.js]propertyInspectorDidAppear:');
       // });
    }
};

function checkConnection(){

    setTimeout(() => checkConnection(),2000);
}

function disconnected(jsn){
    console.log("disconnected from Stream Deck",jsn);
    if (serverWS && serverWS.readyState === 1)
        serverWS.send(JSON.stringify({ target: 'server', source: "SD", type: "disconnected"}));
}

/** ACTIONS */

const action = {
    settings:{},
    onEvent: function(jsn){
        //console.log(jsn);

        const action = jsn.action.replace("com.cdeenen.materialdeck.", "");

        if (jsn.event == 'willAppear'){
            jsn.payload.settings=convertSettings(jsn);
        }
        
       // if (action == 'token'){
            const msg = {
                target: "MD",
                source: 0,
                type: "data",
                device: jsn.device,
                action: action,
                event: jsn.event,
                context: jsn.context,
                payload: jsn.payload
            }
            sendToServer(msg);
        //}
        if (jsn.event == 'didReceiveSettings' || jsn.event == 'willAppear') {
            analyzeSettings(jsn.context,action,jsn.payload.settings);
            setContext(jsn.payload.coordinates,msg);
        }
        else if (jsn.event == 'willDisappear')
            clearContext(jsn.payload.coordinates);
    },
    onDidReceiveSettings: function(jsn) {
        console.log('%c%s', 'color: white; background: red; font-size: 15px;', '[app.js]onDidReceiveSettings:');

        this.settings = Utils.getProp(jsn, 'payload.settings', {});
        this.doSomeThing(this.settings, 'onDidReceiveSettings', 'orange');

        /**
         * In this example we put a HTML-input element with id='mynameinput'
         * into the Property Inspector's DOM. If you enter some data into that
         * input-field it get's saved to Stream Deck persistently and the plugin
         * will receice the updated 'didReceiveSettings' event.
         * Here we look for this setting and use it to change the title of
         * the key.
         */

         this.setTitle(jsn);
    },

    /** 
     * The 'willAppear' event is the first event a key will receive, right before it gets
     * showed on your Stream Deck and/or in Stream Deck software.
     * This event is a good place to setup your plugin and look at current settings (if any),
     * which are embedded in the events payload.
     */

    onWillAppear: function (jsn) {
        console.log("You can cache your settings in 'onWillAppear'", jsn);
        /**
         * "The willAppear event carries your saved settings (if any). You can use these settings
         * to setup your plugin or save the settings for later use. 
         * If you want to request settings at a later time, you can do so using the
         * 'getSettings' event, which will tell Stream Deck to send your data 
         * (in the 'didReceiceSettings above)
         * 
         * $SD.api.getSettings(jsn.context);
        */
        this.settings = jsn.payload.settings;

        // nothing in the settings pre-fill something just for demonstration purposes
        if (!this.settings || Object.keys(this.settings).length === 0) {
            this.settings.mynameinput = 'TEMPLATE';
        }
        this.setTitle(jsn);
    },

    onKeyDown: function (jsn) {
        //console.log("Key Down",jsn);
        //this.doSomeThing(jsn, 'onKeyDown', 'green');
    },

    onKeyUp: function (jsn) {
        this.doSomeThing(jsn, 'onKeyUp', 'green');
    },

    onSendToPlugin: function (jsn) {
        //console.log('onSendToPlugin',jsn)
        /**
         * this is a message sent directly from the Property Inspector 
         * (e.g. some value, which is not saved to settings) 
         * You can send this event from Property Inspector (see there for an example)
         */ 

        const sdpi_collection = Utils.getProp(jsn, 'payload.sdpi_collection', {});
        if (sdpi_collection.value && sdpi_collection.value !== undefined) {
            this.doSomeThing({ [sdpi_collection.key] : sdpi_collection.value }, 'onSendToPlugin', 'fuchsia');            
        }
    },

    /**
     * This snippet shows, how you could save settings persistantly to Stream Deck software
     * It is not used in this example plugin.
     */

    saveSettings: function (jsn, sdpi_collection) {
        //console.log('saveSettings:', jsn);
        if (sdpi_collection.hasOwnProperty('key') && sdpi_collection.key != '') {
            if (sdpi_collection.value && sdpi_collection.value !== undefined) {
                this.settings[sdpi_collection.key] = sdpi_collection.value;
                //console.log('setSettings....', this.settings);
                $SD.api.setSettings(jsn.context, this.settings);
            }
        }
    },

    /**
     * Here's a quick demo-wrapper to show how you could change a key's title based on what you
     * stored in settings.
     * If you enter something into Property Inspector's name field (in this demo),
     * it will get the title of your key.
     * 
     * @param {JSON} jsn // the JSON object passed from Stream Deck to the plugin, which contains the plugin's context
     * 
     */

    setTitle: function(jsn) {
        if (this.settings && this.settings.hasOwnProperty('mynameinput')) {
            console.log("watch the key on your StreamDeck - it got a new title...", this.settings.mynameinput);
            $SD.api.setTitle(jsn.context, this.settings.mynameinput);
        }
    },

    /**
     * Finally here's a methood which gets called from various events above.
     * This is just an idea how you can act on receiving some interesting message
     * from Stream Deck.
     */

    doSomeThing: function(inJsonData, caller, tagColor) {
        console.log('%c%s', `color: white; background: ${tagColor || 'grey'}; font-size: 15px;`, `[app.js]doSomeThing from: ${caller}`);
        // console.log(inJsonData);
    }, 
};


function convertSettings(jsn){
    let settings = jsn.payload.settings;
    
    const actn = jsn.action.replace("com.cdeenen.materialdeck.", "");
    let count = 0;
    if (actn == 'token'){
        count = 2;

        let stats = settings.stats;
        if (stats == 0) stats = 'none';
        else if (stats == 1) stats = 'HP';
        else if (stats == 2) stats = 'TempHP';
        else if (stats == 3) stats = 'AC';
        else if (stats == 4) stats = 'Speed';
        else if (stats == 5) stats = 'Init';
        else if (stats == 6) stats = 'PassivePerception';
        else if (stats == 7) stats = 'PassiveInvestigation';
        else count--;
        settings.stats = stats;

        if (settings.onClick == 0) settings.onClick = 'doNothing';
        else if (settings.onClick == 1) settings.onClick = 'center';
        else if (settings.onClick == 2) settings.onClick = 'charSheet';
        else if (settings.onClick == 3) settings.onClick = 'tokenConfig';
        else if (settings.onClick == 4) settings.onClick = 'visibility';
        else if (settings.onClick == 5) settings.onClick = 'combatState';
        else if (settings.onClick == 6) settings.onClick = 'target';
        else if (settings.onClick == 7) settings.onClick = 'condition';
        else count--;

        if (settings.system == 'dnd5e' || settings.system == 'dnd3.5e'){
            count++;
            let condition = settings.condition;
            if (condition == 0) condition = 'removeAll';
            else if (condition == 1) condition = 'dead';
            else if (condition == 2) condition = 'unconscious';
            else if (condition == 3) condition = 'sleep';
            else if (condition == 4) condition = 'stun';
            else if (condition == 5) condition = 'prone';
            else if (condition == 6) condition = 'restrain';
            else if (condition == 7) condition = 'paralysis';
            else if (condition == 8) condition = 'fly';
            else if (condition == 9) condition = 'blind';
            else if (condition == 10) condition = 'deaf';
            else if (condition == 11) condition = 'silence';
            else if (condition == 12) condition = 'fear';
            else if (condition == 13) condition = 'burning';
            else if (condition == 14) condition = 'frozen';
            else if (condition == 15) condition = 'shock';
            else if (condition == 16) condition = 'corrode';
            else if (condition == 17) condition = 'bleeding';
            else if (condition == 18) condition = 'disease';
            else if (condition == 19) condition = 'poison';
            else if (condition == 20) condition = 'radiation';
            else if (condition == 21) condition = 'regen';
            else if (condition == 22) condition = 'degen';
            else if (condition == 23) condition = 'upgrade';
            else if (condition == 24) condition = 'downgrade';
            else if (condition == 25) condition = 'target';
            else if (condition == 26) condition = 'eye';
            else if (condition == 27) condition = 'curse';
            else if (condition == 28) condition = 'bless';
            else if (condition == 29) condition = 'fireShield';
            else if (condition == 30) condition = 'coldShield';
            else if (condition == 31) condition = 'magicShield';
            else if (condition == 32) condition = 'holyShield';
            else count--;
            settings.condition = condition;
        }
        else if (settings.system == 'pf2e'){
            count++;
            let condition = settings.condition;
            if (condition == 0) condition = 'removeAll';
            else if (condition == 1) condition = 'blinded';
            else if (condition == 2) condition = 'broken';
            else if (condition == 3) condition = 'clumsy';
            else if (condition == 4) condition = 'concealed';
            else if (condition == 5) condition = 'confused';
            else if (condition == 6) condition = 'controlled';
            else if (condition == 7) condition = 'dazzled';
            else if (condition == 8) condition = 'deafened';
            else if (condition == 9) condition = 'doomed';
            else if (condition == 10) condition = 'drained';
            else if (condition == 11) condition = 'dying';
            else if (condition == 12) condition = 'endumbered';
            else if (condition == 13) condition = 'enfeebled';
            else if (condition == 14) condition = 'fascinated';
            else if (condition == 15) condition = 'fatigued';
            else if (condition == 16) condition = 'flatFooted';
            else if (condition == 17) condition = 'fleeing';
            else if (condition == 18) condition = 'frightened';
            else if (condition == 19) condition = 'grabbed';
            else if (condition == 20) condition = 'immobilized';
            else if (condition == 21) condition = 'invisible';
            else if (condition == 22) condition = 'paralyzed';
            else if (condition == 23) condition = 'persistentDamage';
            else if (condition == 24) condition = 'petrified';
            else if (condition == 25) condition = 'prone';
            else if (condition == 26) condition = 'quickened';
            else if (condition == 27) condition = 'restrained';
            else if (condition == 28) condition = 'sickened';
            else if (condition == 29) condition = 'slowed';
            else if (condition == 30) condition = 'stunned';
            else if (condition == 31) condition = 'stupefied';
            else if (condition == 32) condition = 'unconscious';
            else if (condition == 33) condition = 'wounded';
            else count--;
            settings.condition = condition;
            settings.conditionPF2E = condition;
        }
        else if (settings.system == 'demonlord'){
            count++;
            if (settings.onClickDemonlord == undefined) settings.onClickDemonlord = settings.onClick;
            else count--;
        }
    }
    else if (actn == 'move'){
        count = 2;

        let mode = settings.mode;
        if (mode == 0) mode = 'canvas';
        else if (mode == 1) mode = 'selectedToken';
        else count--;
        settings.mode = mode;

        let dir = settings.dir;
        if (dir == 0) dir = 'center';
        else if (dir == 1) dir = 'up';
        else if (dir == 2) dir = 'down';
        else if (dir == 3) dir = 'right';
        else if (dir == 4) dir = 'left';
        else if (dir == 5) dir = 'upRight';
        else if (dir == 6) dir = 'upLeft';
        else if (dir == 7) dir = 'downRight';
        else if (dir == 8) dir = 'downLeft';
        else if (dir == 9) dir = 'zoomIn';
        else if (dir == 10) dir = 'zoomOut';
        else count--;
        settings.dir = dir;
    }
    else if (actn == 'macro'){
        count = 2;

        let mode = settings.macroMode;
        if (mode == 0) mode = 'hotbar';
        else if (mode == 1) mode = 'visibleHotbar';
        else if (mode == 2) mode = 'macroBoard';
        else count--;
        settings.macroMode = mode;

        mode = settings.macroBoardMode;
        if (mode == 0) mode = 'triggerMacro';
        else if (mode == 1) mode = 'offset';
        else count--;
        settings.macroBoardMode = mode;
    }
    else if (actn == 'soundboard'){
        count = 1;

        let mode = settings.soundboardMode;
        if (mode == 0) mode = 'playSound';
        else if (mode == 1) mode = 'offset';
        else if (mode == 2) mode = 'stopAll';
        else count--;
        settings.soundboardMode = mode;
    }
    else if (actn == 'playlist'){
        count = 2;

        let mode = settings.playlistMode;
        if (mode == 0) mode = 'playlist';
        else if (mode == 1) mode = 'track';
        else if (mode == 2) mode = 'stopAll';
        else count--;
        settings.playlistMode = mode;

        let type = settings.playlistType;
        if (type == 0) type = 'playStop';
        else if (type == 1) type = 'offset';
        else count--;
        settings.playlistType = type;
    }
    else if (actn == 'combattracker'){
        count = 4;

        let mode = settings.combatTrackerMode;
        if (mode == 0) mode = 'combatants';
        else if (mode == 1) mode = 'currentCombatant';
        else if (mode == 2) mode = 'function';
        else count--;
        settings.combatTrackerMode = mode;

        let CTfunction = settings.combatTrackerFunction;
        if (CTfunction == 0) CTfunction = 'startStop';
        else if (CTfunction == 1) CTfunction = 'nextTurn';
        else if (CTfunction == 2) CTfunction = 'prevTurn';
        else if (CTfunction == 3) CTfunction = 'nextRound';
        else if (CTfunction == 4) CTfunction = 'prevRound';
        else if (CTfunction == 5) CTfunction = 'turnDisplay';
        else count--;
        settings.combatTrackerFunction = CTfunction;

        let stats = settings.stats;
        if (stats == 0) stats = 'none';
        else if (stats == 1) stats = 'HP';
        else if (stats == 2) stats = 'TempHP';
        else if (stats == 3) stats = 'AC';
        else if (stats == 4) stats = 'Speed';
        else if (stats == 5) stats = 'Init';
        else if (stats == 6) stats = 'PassivePerception';
        else if (stats == 7) stats = 'PassiveInvestigation';
        else count--;
        settings.stats = stats;

        if (settings.onClick == 0) settings.onClick = 'doNothing';
        else if (settings.onClick == 1) settings.onClick = 'select';
        else if (settings.onClick == 2) settings.onClick = 'center';
        else if (settings.onClick == 3) settings.onClick = 'centerSelect';
        else if (settings.onClick == 4) settings.onClick = 'charSheet';
        else if (settings.onClick == 5) settings.onClick = 'tokenConfig';
        else count--;
    }
    else if (actn == 'other'){
        count = 9;

        let mode = settings.otherMode;
        if (mode == 0) mode = 'pause';
        else if (mode == 1) mode = 'sceneSelect';
        else if (mode == 2) mode = 'controlButtons';
        else if (mode == 3) mode = 'darkness';
        else if (mode == 4) mode = 'rollTables';
        else if (mode == 5) mode = 'sidebarTab';
        else if (mode == 6) mode = 'compendium';
        else if (mode == 7) mode = 'journal';
        else count--;
        settings.otherMode = mode;

        let pauseFunction = settings.pauseFunction;
        if (pauseFunction == 0) pauseFunction = 'pause';
        else if (pauseFunction == 1) pauseFunction = 'resume';
        else if (pauseFunction == 2) pauseFunction = 'toggle';
        else count--;
        settings.pauseFunction = pauseFunction;

        let sceneFunction = settings.sceneFunction;
        if (sceneFunction == 0) sceneFunction = 'visible';
        else if (sceneFunction == 1) sceneFunction = 'any';
        else count--;
        settings.sceneFunction = sceneFunction;

        sceneFunction = settings.sceneViewFunction;
        if (sceneFunction == 0) sceneFunction = 'view';
        else if (sceneFunction == 1) sceneFunction = 'activate';
        else if (sceneFunction == 1) sceneFunction = 'viewActivate';
        else count--;
        settings.sceneViewFunction = sceneFunction;

        let control = settings.control;
        let tool = settings.tool;
        if (control == 0) control = 'dispControls';
        else if (control == 1) control = 'dispTools';
        else if (control == 2){  //basic controls
            control = 'token';
            if (tool == 0)  tool = 'open';
            else if (tool == 1)  tool = 'select';
            else if (tool == 2)  tool = 'target';
            else if (tool == 3)  tool = 'ruler';
            else count--;
        }
        else if (control == 3){  //measurement controls
            control = 'measure';
            if (tool == 0)  tool = 'open';
            else if (tool == 1)  tool = 'circle';
            else if (tool == 2)  tool = 'cone';
            else if (tool == 3)  tool = 'rect';
            else if (tool == 4)  tool = 'ray';
            else if (tool == 5)  tool = 'clear';
            else count--;
        }
        else if (control == 4){  //tile controls
            control = 'tiles';
            if (tool == 0)  tool = 'open';
            else if (tool == 1)  tool = 'select';
            else if (tool == 2)  tool = 'tile';
            else if (tool == 3)  tool = 'browse';
            else count--;
        }
        else if (control == 5){  //drawing tools
            control = 'drawings';
            if (tool == 0)  tool = 'open';
            else if (tool == 1)  tool = 'select';
            else if (tool == 2)  tool = 'rect';
            else if (tool == 3)  tool = 'ellipse';
            else if (tool == 4)  tool = 'polygon';
            else if (tool == 5)  tool = 'freehand';
            else if (tool == 6)  tool = 'text';
            else if (tool == 7)  tool = 'configure';
            else if (tool == 8)  tool = 'clear';
            else count--;
        }
        else if (control == 6){  //wall controls
            control = 'walls';
            if (tool == 0)  tool = 'open';
            else if (tool == 1)  tool = 'select';
            else if (tool == 2)  tool = 'walls';
            else if (tool == 3)  tool = 'terrain';
            else if (tool == 4)  tool = 'invisible';
            else if (tool == 5)  tool = 'ethereal';
            else if (tool == 6)  tool = 'doors';
            else if (tool == 7)  tool = 'secret';
            else if (tool == 8)  tool = 'clone';
            else if (tool == 9)  tool = 'snap';
            else if (tool == 10)  tool = 'clear';
            else count--;
        }
        else if (control == 7){  //lighting controls
            control = 'lighting';
            if (tool == 0)  tool = 'open';
            else if (tool == 1)  tool = 'light';
            else if (tool == 2)  tool = 'day';
            else if (tool == 3)  tool = 'night';
            else if (tool == 4)  tool = 'reset';
            else if (tool == 5)  tool = 'clear';
            else count--;
        }
        else if (control == 8){  //ambient sound controls
            control = 'sounds';
            if (tool == 0)  tool = 'open';
            else if (tool == 1)  tool = 'sound';
            else if (tool == 2)  tool = 'clear';
            else count--;
        }
        else if (control == 9){  //journal notes
            control = 'notes';
            if (tool == 0)  tool = 'open';
            else if (tool == 1)  tool = 'select';
            else if (tool == 2)  tool = 'toggle';
            else if (tool == 3)  tool = 'clear';
            else count--;
        }
        else count -= 2;
        settings.tool = tool;
        settings.control = control;

        let darknessFunction = settings.darknessFunction;
        if (darknessFunction == 0) darknessFunction = 'value';
        else if (darknessFunction == 1) darknessFunction = 'incDec';
        else if (darknessFunction == 2) darknessFunction = 'display';
        else count--;
        settings.darknessFunction = darknessFunction;

        let rollFunction = settings.rolltableFunction;
        if (rollFunction == 0) rollFunction = 'open';
        else if (rollFunction == 1) rollFunction = 'public';
        else if (rollFunction == 2) rollFunction = 'private';
        else count--;
        settings.rolltableFunction = rollFunction;

        let sidebarTab = settings.sidebarTab;
        if (sidebarTab == 0) sidebarTab = 'chat';
        else if (sidebarTab == 1) sidebarTab = 'combat';
        else if (sidebarTab == 2) sidebarTab = 'scenes';
        else if (sidebarTab == 3) sidebarTab = 'actors';
        else if (sidebarTab == 4) sidebarTab = 'items';
        else if (sidebarTab == 5) sidebarTab = 'journal';
        else if (sidebarTab == 6) sidebarTab = 'tables';
        else if (sidebarTab == 7) sidebarTab = 'playlists';
        else if (sidebarTab == 8) sidebarTab = 'compendium';
        else if (sidebarTab == 9) sidebarTab = 'settings';
        else if (sidebarTab == 10) sidebarTab = 'collapse';
        else count--;
        settings.sidebarTab = sidebarTab;

        //if (mode == 'sceneSelect'){
            //console.log('settings',settings)
        //}
    }
    if (count > 0){
        $SD.api.setSettings(jsn.context, settings);
    }
    return settings;
}




////////////////////////////////////////////////////////////////////////////////
//Connect to external WS server
////////////////////////////////////////////////////////////////////////////////

var serverWS;
var serverWSReconTimeout;

function connectToServerWS() {
    if (serverWS) serverWS.close(); // Close current connection if one is active.
    clearTimeout(serverWSReconTimeout);
  
    serverWS = new WebSocket('ws://'+ip+':'+port+'/0');

    serverWS.addEventListener('error', e => {
      console.warn('Error occured on the Node.js server connection: ', e);
    });
  
    // Initalise Node.js WebSocket connection.
    serverWS.addEventListener('open', () => {
        if (sdCon)
            serverWS.send(JSON.stringify({ target: 'server', source: "SD"}));
        console.log('Connection to Node.js server successful.');
    }, { once: true });
  
    serverWS.addEventListener('close', e => {
      console.log('Connection to Node.js server lost.');
      clearTimeout(serverWSReconTimeout);
      serverWSReconTimeout = setTimeout(connectToServerWS, 1000);
    }, { once: true });
  
    serverWS.addEventListener('message', e => {
        //console.log(e.data);
        const data = JSON.parse(e.data);
        if (data.target != 'SD') return;
        if (data.type == 'init'){
            sendContext();
        }
        else
            sendToSDWS(e.data); 
    });
}

function sendToServer(msg){
    //console.log(serverWS);
    if (serverWS && serverWS.readyState === 1){
        serverWS.send(JSON.stringify(msg));
        //console.log("send",JSON.stringify(msg));
    }
}

function sendToSDWS(msg) {
    if (sdCon) {
        const data = JSON.parse(msg);
        const event = data.event;
        const context = data.context;
        //console.log(data);
        if (event == 'setStateCustom'){
            //setState(msg);
        }
        else if (event == 'setBufferImage'){
            findInImageBuffer(data);
        }
        else if (event == 'setImage'){
            $SD.connection.send(msg);
            addToImageBuffer(data.payload);
        }
        else 
            $SD.connection.send(msg);
    }
  }

/////////////////////////////////////////////////////////////////////
//Other functions
/////////////////////////////////////////////////////////////////////

imageBuffer = [];
for (let i=0; i<500; i++) imageBuffer[i] = undefined;

function addToImageBuffer(data){
    const newData = {
        id: data.id,
        img: data.image,
    }
    imageBuffer[data.nr]=newData;
}

function findInImageBuffer(data){
    if (imageBuffer[data.payload.nr].id == data.payload.id){
        const json = {
            event: "setImage",
            context: data.context,
            payload: {
                image: "" + imageBuffer[data.payload.nr].img,
                target: 0
            }
        }
        $SD.connection.send(JSON.stringify(json));
    }
}



function setContext(coordinates = {column:0,row:0},msg){
    const num = coordinates.column + coordinates.row*8;
    buttonContext[num] = msg;
}

function clearContext(coordinates = {column:0,row:0}){
    const num = coordinates.column + coordinates.row*8;
    buttonContext[num] = undefined;
}

function sendContext(){
    for (let i=0; i<buttonContext.length; i++){
        if (buttonContext[i] != undefined)
            sendToServer(buttonContext[i]);
    }
}
        

function analyzeSettings(context,action,settings){
    //console.log(context,action,settings);
    
 
   

    
}


  