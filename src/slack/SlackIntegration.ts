import {App} from "@slack/bolt";

export class SlackIntegration {
    app: App
    constructor() {
        // TODO - Import slack keys
        this.app = new App({
            token: process.env.BOT_TOKEN,
            appToken: process.env.SLACK_APP_TOKEN,
            socketMode: true,
        });
    }

    async connect(): Promise<void> {
            await this.app.start();
            console.log('⚡️ Bolt app started');
    }

}