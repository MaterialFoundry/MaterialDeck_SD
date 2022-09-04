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
//const debugEn = true;
if (debugEn) console.log("Material Deck - app.js")
//window.$SD = StreamDeck.getInstance();
//window.$SD.api = SDApi;
//Websocket variables
let ip = "localhost";       //Ip address of the websocket server
let port = "3001";                //Port of the websocket server
let sdCon = false;

let gameSystem = 'dnd5e';
let foundryVersion = 10;

let buttonContext = [];
let connectedDevices = 0;

$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsn) {
    if (debugEn) console.log("connected to Stream Deck",jsn);
    if (serverWS && serverWS.readyState === 1)
        serverWS.send(JSON.stringify({ target: 'server', source: "SD"}));
    sdCon = true;
    connectToServerWS();
    let actions = [];
    actions[0] = 'com.cdeenen.materialdeck.token';
    actions[1] = 'com.cdeenen.materialdeck.macro';
    actions[2] = 'com.cdeenen.materialdeck.combattracker';
    actions[3] = 'com.cdeenen.materialdeck.playlist'; 
    actions[4] = 'com.cdeenen.materialdeck.soundboard';
    actions[5] = 'com.cdeenen.materialdeck.other';
    actions[6] = 'com.cdeenen.materialdeck.external';
    actions[7] = 'com.cdeenen.materialdeck.scene';
    

    for (let i=0; i<actions.length; i++){
        $SD.on(actions[i]+'.willAppear', (jsonObj) => action.onEvent(jsonObj));
        $SD.on(actions[i]+'.willDisappear', (jsonObj) => action.onEvent(jsonObj));
        $SD.on(actions[i]+'.keyDown', (jsonObj) => action.onEvent(jsonObj));
        $SD.on(actions[i]+'.keyUp', (jsonObj) => action.onEvent(jsonObj));
        $SD.on(actions[i]+'.didReceiveSettings', (jsonObj) => action.onEvent(jsonObj));
        $SD.on(actions[i]+'.sendToPlugin', (jsonObj) => action.onSendToPlugin(jsonObj));
        
        //$SD.on(actions[i]+'.propertyInspectorDidAppear', (jsonObj) => {
       //     if (debugEn) console.log('%c%s', 'color: white; background: black; font-size: 13px;', '[app.js]propertyInspectorDidAppear:');
       // });
    }

    var json = {
        event: "getGlobalSettings",
        context: $SD.uuid
    };
    $SD.connection.send(JSON.stringify(json)); 
    if (debugEn) console.log("request global settings")
};

$SD.on('deviceDidConnect', jsn => {
    const nrOfButtons = jsn.deviceInfo.size.columns * jsn.deviceInfo.size.rows;
    
    let context = [];
    for (let i=0; i<nrOfButtons; i++){
        context[i] = undefined;
    }

    buttonContext[connectedDevices] = {
        device: jsn.device,
        name: jsn.deviceInfo.name,
        type: jsn.deviceInfo.type,
        size: jsn.deviceInfo.size,
        context: context,
        activeButtons: 0,
        activeButtonsOld: 0,
        pageSettings: {
            tokenSelection: '',
            tokenId: '',
        }
    }

    let msg = {
        target: "MD",
        source: 0,
        type: "newDevice",
        iteration: connectedDevices,
        device: {
            id: jsn.device,
            name: jsn.deviceInfo.name,
            type: jsn.deviceInfo.type,
            size: jsn.deviceInfo.size
        }
    }
    sendToServer(msg);

    connectedDevices++;
    
});

$SD.on('deviceDidDisconnect', jsn => {
    const index = buttonContext.findIndex( d => d.device === jsn.device );
    buttonContext.splice(index,1);

    let msg = {
        target: "MD",
        source: 0,
        type: "deviceDisconnected",
        device: {
            id: jsn.device,
        }
    }
    sendToServer(msg);

    connectedDevices--;
});

$SD.on('com.cdeenen.materialdeck.token.propertyInspectorDidAppear', jsn => {
    
    let device;
    for (d of buttonContext) {
        if (d.device == jsn.device) {
            device = d;
        }
    }
    var json = {
        action: jsn.action,
        event: "sendToPropertyInspector",
        context: jsn.context,
        payload: {
            gameSystem,
            foundryVersion,
            device
        }
    };
    $SD.connection.send(JSON.stringify(json)); 
});

$SD.on('com.cdeenen.materialdeck.combattracker.propertyInspectorDidAppear', jsn => {
    var json = {
        action: jsn.action,
        event: "sendToPropertyInspector",
        context: jsn.context,
        payload: {gameSystem, foundryVersion}
    };
    $SD.connection.send(JSON.stringify(json)); 
});

$SD.on('com.cdeenen.materialdeck.other.propertyInspectorDidAppear', jsn => {
    var json = {
        action: jsn.action,
        event: "sendToPropertyInspector",
        context: jsn.context,
        payload: {gameSystem, foundryVersion}
    };
    $SD.connection.send(JSON.stringify(json)); 
});

$SD.on('didReceiveGlobalSettings', jsn => {
    const system = jsn.payload.settings.gameSystem;
    if (system != undefined) gameSystem = system;
    const foundry = jsn.payload.settings.foundryVersion;
    if (foundry != undefined) foundryVersion = foundry;
    if (debugEn) console.log('Stored game system and foundry core: ',system,foundryVersion);
});

function checkConnection(){

    setTimeout(() => checkConnection(),2000);
}

function disconnected(jsn){
    if (debugEn) console.log("disconnected from Stream Deck",jsn);
    if (serverWS && serverWS.readyState === 1)
        serverWS.send(JSON.stringify({ target: 'server', source: "SD", type: "disconnected"}));
}

/** ACTIONS */

const action = {
    settings:{},
    onEvent: async function(jsn){
        //console.log('onEvent',jsn);

        const action = jsn.action.replace("com.cdeenen.materialdeck.", "");

        if (jsn.event == 'keyDown' && action == 'token' && jsn.payload != undefined && jsn.payload.settings.onClick == 'setPageWideToken') {
            for (d of buttonContext) {
                if (d.device == jsn.device) {
                    d.pageSettings = {
                        tokenSelection: jsn.payload.settings.pageTokenSelection,
                        tokenId: jsn.payload.settings.pageTokenName
                    }; 
                    sendContextDevice(d);
                }
            }
        }

        if (jsn.payload.settings.pageWideToken) {
            for (d of buttonContext) {
                if (d.device == jsn.device) {
                    const pageSettings = d.pageSettings;
                    if (pageSettings.tokenSelection != "") {
                        jsn.payload.settings.selection = pageSettings.tokenSelection;
                        jsn.payload.settings.tokenName = pageSettings.tokenId;
                    }
                    
                }
            }
        }

        let msg = {
            target: "MD",
            source: 0,
            type: "data",
            device: jsn.device,
            action: action,
            event: jsn.event,
            context: jsn.context,
            payload: jsn.payload,
            version: $SD.applicationInfo.plugin.version
        }
        if (msg.payload.isInMultiAction != true)
            await setContext(jsn.device,jsn.payload.coordinates,msg);
        if (jsn.event == 'willDisappear')
            clearContext(jsn.device,jsn.payload.coordinates);

        //Transition for new token icon settings
        if (jsn.event == 'willAppear' && action == 'token') {
            if (msg.payload.settings.icon == undefined){
                if (msg.payload.settings.displayIcon == false || msg.payload.settings.onClick == 'wildcard') msg.payload.settings.icon = 'stats';
                if (msg.payload.settings.displayIcon == true) msg.payload.settings.icon = 'tokenIcon';
                $SD.api.setSettings(jsn.context, msg.payload.settings);
            }
        }


        for (i in buttonContext) {
            if (buttonContext[i].device == jsn.device) {
                msg.deviceIteration= i;
                msg.size = buttonContext[i].size;
                break;
            }
        }
        sendToServer(msg);

    },
    onDidReceiveSettings: function(jsn) {
        //console.log('%c%s', 'color: white; background: red; font-size: 15px;', '[app.js]onDidReceiveSettings:');

        //this.settings = Utils.getProp(jsn, 'payload.settings', {});
        //this.doSomeThing(this.settings, 'onDidReceiveSettings', 'orange');

        /**
         * In this example we put a HTML-input element with id='mynameinput'
         * into the Property Inspector's DOM. If you enter some data into that
         * input-field it get's saved to Stream Deck persistently and the plugin
         * will receice the updated 'didReceiveSettings' event.
         * Here we look for this setting and use it to change the title of
         * the key.
         */

         //this.setTitle(jsn);
    },

    /** 
     * The 'willAppear' event is the first event a key will receive, right before it gets
     * showed on your Stream Deck and/or in Stream Deck software.
     * This event is a good place to setup your plugin and look at current settings (if any),
     * which are embedded in the events payload.
     */

    onWillAppear: function (jsn) {
        if (debugEn) console.log("You can cache your settings in 'onWillAppear'", jsn);
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
        //if (debugEn) console.log("Key Down",jsn);
        //this.doSomeThing(jsn, 'onKeyDown', 'green');
    },

    onKeyUp: function (jsn) {
        this.doSomeThing(jsn, 'onKeyUp', 'green');
    },

    onSendToPlugin: function (jsn) {
        if (debugEn) console.log('onSendToPlugin',jsn)
        
        if (jsn.payload.pageSettings != undefined) {
            for (d of buttonContext) {
                if (d.device == jsn.payload.device) {
                    d.pageSettings = jsn.payload.pageSettings;
                    sendContextDevice(d);
                }
            }
        }
    },

    /**
     * This snippet shows, how you could save settings persistantly to Stream Deck software
     * It is not used in this example plugin.
     */

    saveSettings: function (jsn, sdpi_collection) {
        if (debugEn) console.log('saveSettings:', jsn);
        if (sdpi_collection.hasOwnProperty('key') && sdpi_collection.key != '') {
            if (sdpi_collection.value && sdpi_collection.value !== undefined) {
                this.settings[sdpi_collection.key] = sdpi_collection.value;
                if (debugEn) console.log('setSettings....', this.settings);
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
            if (debugEn) console.log("watch the key on your StreamDeck - it got a new title...", this.settings.mynameinput);
            $SD.api.setTitle(jsn.context, this.settings.mynameinput);
        }
    },

    /**
     * Finally here's a methood which gets called from various events above.
     * This is just an idea how you can act on receiving some interesting message
     * from Stream Deck.
     */

    doSomeThing: function(inJsonData, caller, tagColor) {
        if (debugEn) console.log('%c%s', `color: white; background: ${tagColor || 'grey'}; font-size: 15px;`, `[app.js]doSomeThing from: ${caller}`);
         if (debugEn) console.log(inJsonData);
    }, 
};

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
        if (sdCon) {
            serverWS.send(JSON.stringify({ target: 'server', source: "SD", version: $SD.applicationInfo.plugin.version}));

            let devices = [];
            for (let device of buttonContext) {
                devices.push({
                    id: device.device,
                    name: device.name,
                    type: device.type,
                    size: device.size
                })
            }
            
            let msg = {
                target: "MD",
                source: 0,
                type: "deviceList",
                devices
            }
            sendToServer(msg);
            
            //serverWS.send(JSON.stringify({ target: 'MD', source: "SD", type:"version", version: $SD.applicationInfo.plugin.version}));
        }
        if (debugEn) console.log('Connection to Node.js server successful.');
    }, { once: true });
  
    serverWS.addEventListener('close', e => {
      if (debugEn) console.log('Connection to Node.js server lost.');
      clearTimeout(serverWSReconTimeout);
      serverWSReconTimeout = setTimeout(connectToServerWS, 1000);
    }, { once: true });
  
    serverWS.addEventListener('message', e => {
        if (debugEn) console.log('server event listener received: ',e.data);

        const data = JSON.parse(e.data);
        if (data.target != 'SD') return;
        if (data.type == 'init'){
            sendContext();
            gameSystem=data.system;
            foundryVersion=parseInt(data.coreVersion);
            if (debugEn) console.log("Game System: ",gameSystem);

            var json = {
                event: "setGlobalSettings",
                context: $SD.uuid,
                payload: {gameSystem, foundryVersion}
            };
            $SD.connection.send(JSON.stringify(json)); 
            if (sdCon) serverWS.send(JSON.stringify({ target: 'MD', source: "SD", type:"version", version: $SD.applicationInfo.plugin.version}));
        }
        else
            sendToSDWS(e.data); 
    });
}

function sendToServer(msg){
    if (debugEn) console.log(serverWS);
    if (serverWS && serverWS.readyState === 1){
        serverWS.send(JSON.stringify(msg));
        if (debugEn) console.log("send",JSON.stringify(msg));
    }
}

function sendToSDWS(msg) {
    if (sdCon) {
        const data = JSON.parse(msg);
        const event = data.event;
        const context = data.context;

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



function setContext(device, coordinates = {column:0,row:0},msg){
    
    for (d of buttonContext) {
        if (d.device == device) {
            const num = coordinates.column + coordinates.row*d.size.columns;
            if (d.context[num] == undefined) {
                d.activeButtonsOld = d.activeButtons;
                d.activeButtons++;
                if (d.pageSettings.tokenSelection == "" && msg.payload.settings.pageWideToken) {
                    
                    d.pageSettings = {
                        tokenId: msg.payload.settings.tokenName,
                        tokenSelection: msg.payload.settings.selection
                    }
                }
            }
            d.context[num] = msg;
            
            return;
        }
    }
}

function clearContext(device,coordinates = {column:0,row:0}){
    for (d of buttonContext) {
        if (d.device == device) {
            const num = coordinates.column + coordinates.row*d.size.columns;
            d.context[num] = undefined;
            d.activeButtonsOld = d.activeButtons;
            d.activeButtons--;
            if (d.activeButtons == 0) {
                d.pageSettings = {
                    tokenSelection: '',
                    tokenId: '',
                }
            }
            return;
        }
    }
}

function sendContext(){
    for (d of buttonContext) {
        for (let context of d.context) {
            if (context != undefined) {
                context.event = 'willAppear';
                context.deviceName = d.name;
                context.deviceType = d.type;
                sendToServer(context);
                
            }
                
        }
    }
}

function sendContextDevice(device) {
    for (let context of device.context) {
        if (context != undefined) {
            if (context.payload.settings.pageWideToken) {
                const pageSettings = device.pageSettings;
                let settings = context.payload.settings;
                settings.selection = pageSettings.tokenSelection;
                settings.tokenName = pageSettings.tokenId;
                $SD.api.setSettings(context.context, settings);
            }
            context.event = 'willAppear';
            sendToServer(context);
        }
    }
}

function analyzeSettings(context,action,settings){
    //if (debugEn) console.log(context,action,settings); 
}

  