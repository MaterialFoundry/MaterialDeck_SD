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
let port = "3003";                //Port of the websocket server
let sdCon = false;

$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsn) {
    console.log("connected to Stream Deck",jsn);
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

/** ACTIONS */

const action = {
    settings:{},
    onEvent: function(jsn){
        console.log(jsn);

        const action = jsn.action.replace("com.cdeenen.materialdeck.", "");

       // if (action == 'token'){
            const msg = {
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
        if (jsn.event == 'didReceiveSettings' || jsn.event == 'willAppear') analyzeSettings(jsn.context,action,jsn.payload.settings);
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
        console.log("Key Down",jsn);
        //this.doSomeThing(jsn, 'onKeyDown', 'green');
    },

    onKeyUp: function (jsn) {
        this.doSomeThing(jsn, 'onKeyUp', 'green');
    },

    onSendToPlugin: function (jsn) {
        console.log('onSendToPlugin',jsn)
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
        console.log('saveSettings:', jsn);
        if (sdpi_collection.hasOwnProperty('key') && sdpi_collection.key != '') {
            if (sdpi_collection.value && sdpi_collection.value !== undefined) {
                this.settings[sdpi_collection.key] = sdpi_collection.value;
                console.log('setSettings....', this.settings);
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
      serverWS.send(JSON.stringify({ type: 'init', source: "SD"}));
      console.log('Connection to Node.js server successful.');
    }, { once: true });
  
    serverWS.addEventListener('close', e => {
      console.log('Connection to Node.js server lost.');
      clearTimeout(serverWSReconTimeout);
      serverWSReconTimeout = setTimeout(connectToServerWS, 1000);
    }, { once: true });
  
    serverWS.addEventListener('message', e => {
        sendToSDWS(e.data); 
    });
}

function sendToServer(msg){
    //console.log(serverWS);
    if (serverWS && serverWS.readyState === 1){
        serverWS.send(JSON.stringify(msg));
       // console.log("send",msg);
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
        else if (event == 'setIcon'){
            drawImage(data);
        }
        else 
            $SD.connection.send(msg);
    }
  }

/////////////////////////////////////////////////////////////////////
//Other functions
/////////////////////////////////////////////////////////////////////

function analyzeSettings(context,action,settings){
    console.log(context,action,settings);
    
    let background = '#000000';
    let url = "action/images/black.png";
    if (action == 'token') {
        let displayIcon = undefined;
        if (settings.displayIcon) displayIcon = true;
        if (settings.background) background = settings.background;
        if (displayIcon != true){
            if (settings.stats == 1) //HP
                url = "action/images/token/hp.png";
            else if (settings.stats == 2) //AC
                url = "action/images/token/ac.webp";
            else if (settings.stats == 3) //Speed
                url = "action/images/token/speed.webp";
            else if (settings.stats == 4) //Initiative
                url = "action/images/token/init.png";
            let msg = {context: context, url: url, format: 'png', background:background}
            drawImage(msg);
        }
    }
    else if (action == 'move'){
        if (settings.background) background = settings.background;
        if (settings.dir == 1) //up
            url = "action/images/move/up.png";
        else if (settings.dir == 2) //down
            url = "action/images/move/down.png";
        else if (settings.dir == 3) //right
            url = "action/images/move/right.png";
        else if (settings.dir == 4) //left
            url = "action/images/move/left.png";
        else if (settings.dir == 5) 
            url = "action/images/move/upright.png";
        else if (settings.dir == 6) 
            url = "action/images/move/upleft.png";
        else if (settings.dir == 7) 
            url = "action/images/move/downright.png";
        else if (settings.dir == 8) 
            url = "action/images/move/downleft.png";
        else
            url = "action/images/move/center.png";
        let msg = {context: context, url: url, format: 'png', background:background}
        drawImage(msg);
    }
    else if (action == 'combattracker'){
        if (settings.combatTrackerMode == 1){
            if (settings.combatTrackerFunction == 0) {
                url = "action/images/combattracker/startcombat.png";
            }
            else if (settings.combatTrackerFunction == 1) {
                url = "action/images/combattracker/nextturn.png";
            }
            else if (settings.combatTrackerFunction == 2) {
                url = "action/images/combattracker/previousturn.png";
            }
            else if (settings.combatTrackerFunction == 3) {
                url = "action/images/combattracker/nextround.png";
            }
            else if (settings.combatTrackerFunction == 4) {
                url = "action/images/combattracker/previousround.png";
            }
            let msg = {context: context, url: url, format: 'png', background:background}
            drawImage(msg);
        }
    }
    
}

let imgBuffer = [];
let drawImageBusy = false;
let drawImageTimeout;
let canvas;
let counter = 0;



function drawImage(data){
    console.log('drawImage1',data);
    if (data == undefined) 
        return;
    const context = data.context;
    var url = data.url;
    const format = data.format;
    var background = data.background;

    let BGvalid = true;
    if (background.length != 7) BGvalid = false;
    if (background[0] != '#') BGvalid = false;
    for (let i=1; i<background.length; i++)
        if(isNaN(parseInt(background[i],16)))
            BGvalid = false;
    if (BGvalid == false) background = '#000000';

    if (url == "" || format == 'color')
        url = "action/images/transparant.png"

    let canvas;
    let canvasId = 'canvas' + counter;
    canvas = document.getElementById(canvasId);
    counter++;
    if (counter > 31) counter = 0;

    let ctx = canvas.getContext("2d");
    ctx.filter = "none";

    let margin = 0;
    if (data.ring != undefined && data.ring > 0){
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        margin = 10;
        if (data.ring == 2) {
            ctx.fillStyle = data.ringColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = background;
            ctx.fillRect(margin, margin, canvas.width-2*margin, canvas.height-2*margin);
        }
    }
    else {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    let resImageURL = url;
   
    let img = new Image();
    img.onload = () => {
        if (format == 'color') ctx.filter = "opacity(0)";
        //ctx.filter = "brightness(0) saturate(100%) invert(38%) sepia(62%) saturate(2063%) hue-rotate(209deg) brightness(90%) contrast(95%)";
        var imageAspectRatio = img.width / img.height;
        var canvasAspectRatio = canvas.width / canvas.height;
        var renderableHeight, renderableWidth, xStart, yStart;

        // If image's aspect ratio is less than canvas's we fit on height
        // and place the image centrally along width
        if(imageAspectRatio < canvasAspectRatio) {
            renderableHeight = canvas.height;
            renderableWidth = img.width * (renderableHeight / img.height);
            xStart = (canvas.width - renderableWidth) / 2;
            yStart = 0;
        }

        // If image's aspect ratio is greater than canvas's we fit on width
        // and place the image centrally along height
        else if(imageAspectRatio > canvasAspectRatio) {
            renderableWidth = canvas.width
            renderableHeight = img.height * (renderableWidth / img.width);
            xStart = 0;
            yStart = (canvas.height - renderableHeight) / 2;
        }

        // Happy path - keep aspect ratio
        else {
            renderableHeight = canvas.height;
            renderableWidth = canvas.width;
            xStart = 0;
            yStart = 0;
        }
        
        ctx.drawImage(img, xStart+margin, yStart+margin, renderableWidth - 2*margin, renderableHeight - 2*margin);
        
        var json = {
            event: "setImage",
            context: context,
            payload: {
            image: canvas.toDataURL() || '',
            target: 0
            }
        };

    $SD.connection.send(JSON.stringify(json));
    };
    img.src = resImageURL;
}
  