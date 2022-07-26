import {Game} from "@gathertown/gather-game-client";
import {GatherWrapper} from "./src/gatherwrapper";
import commandLineArgs, {OptionDefinition} from "command-line-args"
import {gatherApiKey, gatherSpaceId} from "./src/util";

global.WebSocket = require("isomorphic-ws");

const optionsDefinition: OptionDefinition[] = [
    {name: "chase", type: Boolean},
    {name: "cleanup", type: Boolean},
    {name: "move", type: Boolean},
    {name: "rickroll", type: Boolean},
    {name: "wander", type: Boolean},

    {name: "player",type: String},
    {name: "location_x", type: Number},
    {name: "location_y", type: Number},
    {name: "mewmba", type: String, multiple: true},
]

const options = commandLineArgs(optionsDefinition);

// gather wrapper client setup
const game = new Game(gatherSpaceId(), () => Promise.resolve({apiKey: gatherApiKey()}));
game.subscribeToConnection(connected => {console.log("connected?", connected);
    if (!connected) process.exit(1);
});
game.connect()?.then(async () => {
    await game.waitForInit()
    const myWrapper = new GatherWrapper(game)

    if (options.player === "***RANDOM***") {
        options.player = myWrapper.getRandomPlayer();
    }

    let mewmbas: Promise<void>[] = [];
    for (const myMewmbaName of options.mewmba) {
        let myMewmba = myWrapper.getMewmbaByName(myMewmbaName as string)
        if (options.chase) {
            mewmbas.push(myMewmba.chasePlayer(options.player));
        }
        if (options.rickroll) {
            mewmbas.push(myWrapper.setRickRollTrap(options.player));
        }
        if (options.wander) {
            mewmbas.push(myMewmba.routeToPoint(myMewmba.getRandomPoint()))
        }
        if (options.cleanup) {
            mewmbas.push(myWrapper.mewmbaCleanupCoffee(myMewmbaName as string))
        }
        // TODO - Add other commands here
    }

    // Await all
    for (const m of mewmbas) {
        await m;
    }

    game.disconnect();
    return;
});


// subscribeToMapSetObjects();
// wrapper.subscribeToEvent("playerChats", (data, context) => {
//     console.log(data, context)
// })
// wrapper.subscribeToEvent("playerInteracts", (data, context) => {
//     console.log(data, context)
// })

// setRickRollTrap("Chiara")

// mewmbaHarassTheIntern("phillis", "phillis")

// uncomment this line to test issuance!
// runGuestBadgeIssuerAndVerifier();

// printCoffeeCupImage(48, 7, `Hi ${"Chiara"}`)

// mewmbaSetUpDanceParty("phillis", "phillis")

// mewmbaCleanupCoffee("4113", "phillis")
