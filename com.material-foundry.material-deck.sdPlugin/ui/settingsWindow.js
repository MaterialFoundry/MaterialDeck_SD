export class SettingsWindow {
    menuOpen = false;
    elmnt;

    constructor() {
        let parent = this;

        document.getElementById(`closeSettingsMenu`).addEventListener("click", () => {
            parent.close();
        })

        this.elmnt = document.getElementById("settingsMenu");
        this.elmnt.addEventListener("pointerdown", (event) => {
            if (event.target == document.getElementById("settingsMenu")) 
                parent.close();
        })

        document.getElementById("globalPortValue").addEventListener("change", (event)=>{
            window.SD.sendToPlugin({
                type: "setWebsocketPort",
                wsPort: event.target.value
            })
        })
    }

    async open() {
        const globalSettings = await window.SD.getGlobalSettings();
        document.getElementById("globalPortValue").value = globalSettings.wsPort;
        
        this.elmnt.style.display = "block";

        this.menuOpen = true;
    }

    close() {
        this.elmnt.style.display = "none";
        this.menuOpen = false;
    }
}