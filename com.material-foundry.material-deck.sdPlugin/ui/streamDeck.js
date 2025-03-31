class StreamDeck {

    action;
    context;
    client = SDPIComponents.streamDeckClient;
    actionData;
    settings;
    events = {};

    constructor() {
        this.init();
    }

    async init() {
        const connectionInfo = await this.client.getConnectionInfo();
        this.action = connectionInfo.actionInfo.action.split('.').pop();
        this.context = connectionInfo.propertyInspectorUUID;

        this.actionData = await this.client.getSettings();
        this.settings = this.actionData.settings;
        console.log('Info\nAction:', this.action, '\nConnection:', connectionInfo, '\nSettings:', this.settings);
    }

    sendToPlugin(payload) {
        this.client.send('sendToPlugin', payload);
    }

    saveSyncedSettings(settings) {
        for (let s of settings) {
          this.saveSetting({key: s.key, value: s.value}, false)
        }
            
        this.client.send('sendToPlugin', {type:'setSettings', settings: this.settings});
    }

    getSettingValue(key) {
      if (key === undefined) return;
      let sett = structuredClone(this.settings);
      const split = key.split('.');
      for (let segment of split) {
        sett = sett?.[segment];
        const type = typeof sett;
        if (type !== 'object') return sett;
      }
    }

    saveSetting(data, transmitToPlugin=true) {
      //console.log('saveSetting', data, transmitToPlugin)
      if (data !== undefined) {
        if (data.key.includes('.')) {
          this.settings = mergeObject(this.settings, expand(data.key, data.value));
        }
        else {
            this.settings[data.key] = data.value;
        }
      }      
      if (transmitToPlugin)
        this.client.send('sendToPlugin', {type:'setSettings', settings: this.settings});
    }

    registerEvent(id, callback) {
        this.events[id] = callback;
    }

    callEvent(id, payload) {
        if (!this.events[id]) {
            console.warn(`Event '${id}' does not exist`);
            return;
        }
        this.events[id](payload);
    }

    stringToObject(string) {
        let obj = expand(string)
    }

    async getGlobalSettings() {
      return await this.client.getGlobalSettings();
    }
}

const expand = (str, defaultVal = {}) => {
    return str.split('.').reduceRight((acc, currentVal) => {
      return {
        [currentVal]: acc
      }
    }, defaultVal)
}

function mergeObject(obj1, obj2) {

  for (var p in obj2) {
    try {
      // Property in destination object set; update its value.
      if ( obj2[p].constructor==Object ) {
        obj1[p] = mergeObject(obj1[p], obj2[p]);

      } else {
        obj1[p] = obj2[p];

      }

    } catch(e) {
      // Property in destination object not set; create it and set its value.
      obj1[p] = obj2[p];

    }
  }
  
  return obj1;
}


export let SD = new StreamDeck();
window.SD = SD;