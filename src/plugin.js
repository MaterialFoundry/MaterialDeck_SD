import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { websocketServer } from "./common.js";
import { IncrementCounter } from "./actions/increment-counter";
// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.DEBUG);
// Register the increment action.
streamDeck.actions.registerAction(new IncrementCounter());
// Finally, connect to the Stream Deck.
streamDeck.connect();
websocketServer.connect();
console.log('test');


