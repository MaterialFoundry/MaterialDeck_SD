import streamDeck, { action, type JsonObject, type KeyDownEvent, type KeyUpEvent, SingletonAction, type WillAppearEvent, type PropertyInspectorDidAppearEvent, type SendToPluginEvent, DidReceiveGlobalSettingsEvent, TitleParametersDidChangeEvent } from "@elgato/streamdeck";
import { transmitButtonEvent, debug, sendToPropertyInspector, onSendToPlugin, settingsConfig, formatTitle, setWebsocketPort, searchSyncedGlobalSettings, getLastSection } from "../common.js"

export class mdAction extends SingletonAction {

	title = '';
	titleRaw = '';
	titleParameters;
	settings = {};

	constructor(UUID) {
		super();
		this.manifestId = UUID;

		this.checkWebsocketPort();
	}

	async checkWebsocketPort() {
		let globalSettings = await streamDeck.settings.getGlobalSettings();
		if (!globalSettings?.wsPort) {
			setWebsocketPort(3005);
		}
	}

	override async onWillAppear(ev: WillAppearEvent): void | Promise<void> {
		this.settings = ev.payload.settings;
		if (Object.keys(ev.payload.settings).length === 0) return;
		const settingsChanged = searchSyncedGlobalSettings(this.settings, getLastSection(ev.action.manifestId));
		if (settingsChanged) {
			ev.action.setSettings(this.settings);
			ev.payload.settings = this.settings;
		}
		transmitButtonEvent(ev);
		//debug('willAppear')
	}

	override onWillDisappear?(ev: WillDisappearEvent): void | Promise<void> {
		transmitButtonEvent(ev);
	}

	override async onKeyDown(ev: KeyDownEvent): Promise<void> {
		transmitButtonEvent(ev);
		//debug('keyDown')
	}

	override async onKeyUp(ev: KeyUpEvent): Promise<void> {
		transmitButtonEvent(ev);
		//debug('keyUp')
	}

	override async onPropertyInspectorDidAppear(ev: PropertyInspectorDidAppearEvent): Promise<void> {
		sendToPropertyInspector({
			settingsConfig
		})
	}

	override async onSendToPlugin(ev: SendToPluginEvent): Promise<void> {
		onSendToPlugin(ev);
	}

	override async onDidReceiveSettings(ev: DidReceiveGlobalSettingsEvent): Promise<void> {

	}

	override onTitleParametersDidChange?(ev: TitleParametersDidChangeEvent): void | Promise<void> {
		//debug('titleParams', ev.action.titleRaw, ev.action.title, ev.payload.titleParameters)
		
		if (ev.payload.titleParameters) {
			ev.action.titleParameters = ev.payload.titleParameters;
			const title = ev.action.titleRaw || ev.action.title;
			if (title) {
				const formattedTitle = formatTitle(title, ev.payload.titleParameters);
				ev.action.setTitle(formattedTitle);
			}
		}
		
	}
}