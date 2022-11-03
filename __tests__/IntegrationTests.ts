import { beforeAll, describe, it } from "@jest/globals";
import { GatherWrapper } from "../src/gatherwrapper";

let myWrapper: GatherWrapper;

describe("mewmba basic functionality", () => {
  beforeAll(async () => {
    myWrapper = await GatherWrapper.createInstance();
  });
  it("should wander", async () => {
    let myMewmba = myWrapper.getMewmbaByName("***RANDOM***");
    await myMewmba.wander(5);
  });
  it("should print list of mewmbas", () => {
    myWrapper.printMewmbaList();
  });
  // it('should clean up coffee', async () => {
  //     await myWrapper.mewmbaCleanupCoffee('***RANDOM***')
  // });
  afterAll(() => {
    myWrapper.disconnect();
  });
});
