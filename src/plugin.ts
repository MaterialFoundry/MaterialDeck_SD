import streamDeck, { LogLevel, DeviceDidConnectEvent, DeviceDidDisconnectEvent } from "@elgato/streamdeck";
import { websocketServer, debug, onDeviceDidConnect, onDeviceDidDisconnect } from "./common.js";
import { mdAction } from "./actions/mdAction.js";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.DEBUG);

// Register the actions.
streamDeck.actions.registerAction(new mdAction("com.material-foundry.material-deck.audio"));
streamDeck.actions.registerAction(new mdAction("com.material-foundry.material-deck.combattracker"));
streamDeck.actions.registerAction(new mdAction("com.material-foundry.material-deck.custom"));
streamDeck.actions.registerAction(new mdAction("com.material-foundry.material-deck.external"));
streamDeck.actions.registerAction(new mdAction("com.material-foundry.material-deck.macro"));
streamDeck.actions.registerAction(new mdAction("com.material-foundry.material-deck.other"));
streamDeck.actions.registerAction(new mdAction("com.material-foundry.material-deck.scene"));
streamDeck.actions.registerAction(new mdAction("com.material-foundry.material-deck.token"));

streamDeck.devices.onDeviceDidConnect((ev: DeviceDidConnectEvent) => { onDeviceDidConnect(ev.device); });
streamDeck.devices.onDeviceDidDisconnect((ev: DeviceDidDisconnectEvent) => { onDeviceDidDisconnect(ev.device) });

// Connect to the Stream Deck
streamDeck.connect();

// Start the Foundry websocket server
websocketServer.start();

