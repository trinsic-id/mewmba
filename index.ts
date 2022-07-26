import * as ApiKeys from "./api-key";
import {Game} from "@gathertown/gather-game-client";
import {GatherWrapper} from "./gatherwrapper";
import commandLineArgs, {OptionDefinition} from "command-line-args"

global.WebSocket = require("isomorphic-ws");

const optionsDefinition: OptionDefinition[] = [
    {name: "chase", alias:'c',type: Boolean},
    {name: "move", alias:'m',type: Boolean},
    {name: "rickroll", alias:'r',type: Boolean},
    {name: "player", alias:'p',type: String},
    {name: "location_x", alias:'x',type: Number},
    {name: "location_y", alias:'y',type: Number},
    {name: "mewmba", type: String, multiple: true},
]

const options = commandLineArgs(optionsDefinition);

// gather game client setup
const game = new Game(ApiKeys.GATHER_SPACE_ID, () => Promise.resolve({apiKey: ApiKeys.GATHER_API_KEY}));
game.subscribeToConnection(connected => console.log("connected?", connected));
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
// game.subscribeToEvent("playerChats", (data, context) => {
//     console.log(data, context)
// })
// game.subscribeToEvent("playerInteracts", (data, context) => {
//     console.log(data, context)
// })

// setRickRollTrap("Chiara")

// mewmbaHarassTheIntern("phillis", "phillis")

// uncomment this line to test issuance!
// runGuestBadgeIssuerAndVerifier();

// printCoffeeCupImage(48, 7, `Hi ${"Chiara"}`)

// mewmbaSetUpDanceParty("phillis", "phillis")

// mewmbaCleanupCoffee("4113", "phillis")
