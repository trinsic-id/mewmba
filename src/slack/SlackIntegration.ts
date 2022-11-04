import { App, AppMentionEvent, SayFn } from "@slack/bolt";
import { UsersInfoResponse } from "@slack/web-api";
import { createIssue } from "../GithubIntegration";
import { slackOAuthToken, slackSocketToken } from "../util";

const ticketCommand = "ticket this";

export class SlackIntegration {
  app: App;
  private _userInfoCache: { [key: string]: UsersInfoResponse } = {};

  constructor() {
    this.app = new App({
      token: slackOAuthToken(),
      appToken: slackSocketToken(),
      socketMode: true,
    });
  }

  async connect(): Promise<void> {
    await this.app.start();
    console.log("⚡️ Bolt app started");
    this.attachMentionListener();
  }

  async disconnect(): Promise<void> {
    await this.app.stop();
  }

  async getUserInfo(userId: string): Promise<UsersInfoResponse> {
    userId = userId.replace("<", "").replace(">", "").replace("@", "");
    if (!(userId in this._userInfoCache)) {
      this._userInfoCache[userId] = await this.app.client.users.info({
        token: slackOAuthToken(),
        user: userId,
      });
    }
    return this._userInfoCache[userId];
  }

  private async ticketThis(event: AppMentionEvent, say: SayFn): Promise<void> {
    const repoRegex = /repo[sitory]*=\w+/
    let ticketTitle = event.text
        .substring(event.text.indexOf(ticketCommand) + ticketCommand.length)
        .trim();
    let targetRepo = "server"
    if (event.thread_ts) {
      const isParentMessage = event.thread_ts === event.ts;
      if (!isParentMessage) {
        const result = await this.app.client.conversations.replies({
          token: slackOAuthToken(),
          ts: event.thread_ts!,
          channel: event.channel,
          include_all_metadata: true,
        });
        let repoMatch = repoRegex.exec(ticketTitle);
        if (repoMatch !== null) {
          // TODO - Named subgroups
          targetRepo = repoMatch[0];
          targetRepo = targetRepo.substring(targetRepo.indexOf("=")+1);
          ticketTitle = ticketTitle.replace(repoMatch[0], "")
        }
        // TODO - Pagination
        const orderedMessages = [...result.messages!];
        const processedMessagePromises = orderedMessages.map(async (value) => {
          // TODO - Get User name
          const userInfo = await this.getUserInfo(value.user!);
          let messageText = value.text!;
          const slackUserRegex = /<@U\w+>/g;

          let m;
          while ((m = slackUserRegex.exec(messageText)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === slackUserRegex.lastIndex) {
              slackUserRegex.lastIndex++;
            }

            // The result can be accessed through the `m`-variable.
            for (const match of m) {
              const groupIndex = m.indexOf(match);
              console.log(`Found match, group ${groupIndex}: ${match}`);
              const matchUserInfo = await this.getUserInfo(match);
              messageText = messageText.replace(
                match,
                matchUserInfo.user!.name!
              );
            }
          }

          return `${userInfo.user?.name}: ${messageText}`;
        });
        const processedMessages = await Promise.all(processedMessagePromises);
        console.log("Ordered thread messages", processedMessages);
        const issueUrl = await createIssue(
          ticketTitle || "Ticket From Slack",
          processedMessages.join("\n"),
            "trinsic-id",
            targetRepo
        );
        // TODO - Reply with a Link to ticket.
        // TODO - React with checkbox to message?
        await say({
          text: `Ticket Created:${issueUrl}`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `[Ticket Created](${issueUrl})`,
              },
            },
          ],
        });
      }
    }
  }

  async findConversation(name: string): Promise<string> {
    try {
      // Call the conversations.list method using the built-in WebClient
      const result = await this.app.client.conversations.list({
        // The token you used to initialize your app
        token: slackOAuthToken(),
      });

      for (const channel of result.channels!) {
        if (channel.name === name) {
          return channel.id!;
        }
      }
    } catch (error) {
      console.error(error);
    }
    return "";
  }

  attachMentionListener(): void {
    // subscribe to 'app_mention' event in your App config
    // need app_mentions:read and chat:write scopes
    this.app.event("app_mention", async ({ event, context, client, say }) => {
      // TODO - Slash command this
      try {
        if (event.text.indexOf(ticketCommand) > 0) {
          await this.ticketThis(event, say);
        }
      } catch (error) {
        console.error(error);
      }
    });
  }

  async postMessage(message: string, channelName = "gather") {
    const result = await this.app.client.chat.postMessage({
      // The token you used to initialize your app
      token: slackOAuthToken(),
      channel: await this.findConversation(channelName),
      text: message,
      // You could also use a blocks[] array to send richer content
    });

    // Print result
    console.log(result);
  }
}
