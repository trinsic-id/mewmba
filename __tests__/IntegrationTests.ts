import {beforeAll, describe, it} from "@jest/globals";
import {Game} from "@gathertown/gather-game-client";
import {gatherApiKey, gatherSpaceId} from "../src/util";
import {GatherWrapper} from "../src/gatherwrapper";

let game: Game;
let myWrapper: GatherWrapper;

describe('mewmba basic functionality', function () {
    beforeAll(async () => {
        // TODO - Refactor initialization of game
        game = new Game(gatherSpaceId(), () => Promise.resolve({apiKey: gatherApiKey()}));
        game.subscribeToConnection(connected => {console.log("connected?", connected);
            if (!connected) process.exit(1);
        });
        await game.connect()
        await game.waitForInit()
        myWrapper = new GatherWrapper(game)
    });
    it('should wander', async function () {
        let myMewmba = myWrapper.getMewmbaByName('***RANDOM***');
        // TODO - Refactor an explicit wander method
        await myMewmba.routeToPoint(myMewmba.getRandomPoint());
    });
    it('should clean up coffee', async function () {
        await myWrapper.mewmbaCleanupCoffee('***RANDOM***')
    })
});