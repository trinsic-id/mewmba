import { beforeAll, describe, it } from "@jest/globals";
import { GatherWrapper } from "../src/gatherwrapper";

let myWrapper: GatherWrapper;

describe("mewmba basic functionality", () => {
  beforeAll(async () => {
    myWrapper = await GatherWrapper.createInstance();
  });
  it("should wander", async () => {
    let myMewmba = myWrapper.getMewmbaByName("***RANDOM***");
    // TODO - Refactor an explicit wander method
    await myMewmba.routeToPoint(myMewmba.getRandomPoint(5));
  });
  // it('should clean up coffee', async () => {
  //     await myWrapper.mewmbaCleanupCoffee('***RANDOM***')
  // });
  afterAll(async () => {
    myWrapper.disconnect();
  });
});
