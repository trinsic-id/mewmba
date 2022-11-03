import { describe, it } from "@jest/globals";
import { SlackIntegration } from "../src/slack/SlackIntegration";

describe("mewmba integrations functionality", () => {
  it("should post to slack", async () => {
    const slack = new SlackIntegration();
    await slack.connect();
    await slack.postMessage("Hello from integration tests");
  });
});
