import * as ApiKeys from "./api-key";
import {Game} from "@gathertown/gather-game-client";
import {GatherWrapper} from "./gatherwrapper";


global.WebSocket = require("isomorphic-ws");

// gather game client setup
const game = new Game(ApiKeys.GATHER_SPACE_ID, () => Promise.resolve({apiKey: ApiKeys.GATHER_API_KEY}));
game.connect()?.then(value => {
    const myWrapper = new GatherWrapper(game)

    myWrapper.printMewmbaList()
});

// game.subscribeToConnection(connected => console.log("connected?", connected));
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
