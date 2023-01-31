import { beforeAll, describe, it } from "@jest/globals";
import { SlackIntegration } from "../src/slack/SlackIntegration";
import {
  ConversationsListResponse,
  UsersListResponse,
  ChannelsListResponse,
} from "@slack/web-api";
import { Member } from "@slack/web-api/dist/response/UsersListResponse";

let mySlack: SlackIntegration;

describe("Slack connections", () => {
  beforeAll(async () => {
    mySlack = new SlackIntegration();
    await mySlack.connect();
  });
  it("Get Users List", async () => {
    const usersList: UsersListResponse = await mySlack.getUsersList();
    expect(usersList.members).not.toBeNull();

    console.log(
      usersList.members!.map(
        (x: Member) =>
          `{ "githubUsername": "", "slackName":"${x.name}", "slackId":"${x.id}" },`
      )
    );
  });
  it("Get Channel ID List", async () => {
    const channelsList: ConversationsListResponse =
      await mySlack.getChannelsList();
    expect(channelsList.channels).not.toBeNull();

    console.log(
      channelsList.channels!.map(
        (x) => `{ "channelId": "${x.id}", "channelName":"${x.name}" },`
      )
    );
  });
  afterAll(() => {
    mySlack.disconnect();
  });
});
