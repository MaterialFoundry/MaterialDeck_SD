import streamDeck  from "@elgato/streamdeck";

function debug() {
    streamDeck.logger.debug(...arguments);
}

function error() {
    streamDeck.logger.error(...arguments);
}

export class ImageBuffer {
    buffer = {};

    add(data) {
        const userId = data.userId;
        if (!userId) 
            return error("Add To ImageBuffer=>UserId not found");
        
        if (!this.buffer[userId]) this.buffer[userId] = [];

        const exists = this.buffer[userId].find(i => i.id === data.payload.id);
        if (exists) {
            exists.image = data.payload.image;
        }
        else {
            this.buffer[userId].push({
                id: data.payload.id,
                image: data.payload.image
            });
        }
    }

    get(data) {
        const userId = data.userId;
        if (!userId) {
            error("Get From ImageBuffer=>UserId not found");
            return;
        }

        return this.buffer[userId]?.find(i => i.id === data.payload.id);
    }

    remove(data) {
        const userId = data.userId;
        if (!userId) 
            return error("Remove From ImageBuffer=>UserId not found");

        const index = this.buffer[userId]?.findIndex(i => i.id === data.payload.id);

        if (index > 0) this.buffer[userId].splice(index, 1);
    }

    clear(data) {
        const userId = data.userId;
        if (!userId) 
            return error("Clear ImageBuffer=>UserId not found");

        this.buffer[userId] = [];
    }
}
