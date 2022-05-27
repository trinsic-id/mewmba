import * as ApiKeys from "./api-key";
import {Game} from "@gathertown/gather-game-client";
import {GuestBadgeIssuer} from "./guest_badge/issuer";
import {GuestBadgeVerifier} from "./guest_badge/verifier";
import {Player} from "@gathertown/gather-game-common";
import {randomInt} from "crypto";
import {RandomColor} from "./json-data";
import {GatherWrapper} from "./gatherwrapper";


global.WebSocket = require("isomorphic-ws");

// gather game client setup
const game = new Game(ApiKeys.GATHER_SPACE_ID, () => Promise.resolve({apiKey: ApiKeys.GATHER_API_KEY}));
game.connect();
const myWrapper = new GatherWrapper(game)

function subscribeToMapSetObjects() {
    game.subscribeToEvent("mapSetObjects", (data, context) => {
        if (data.mapSetObjects.mapId !== ApiKeys.GATHER_MAP_ID) return
        // Ensure this is a create
        // @ts-ignore
        if (data.mapSetObjects.objects.length > 1) return
        for (const dataKey in data.mapSetObjects.objects) {
            const dataObject = data.mapSetObjects.objects[dataKey]
            if (dataObject._name?.startsWith("To-Go Coffee"))
                console.log("Coffee needs ordered!")
        }
    })
}

type TrapCallback = (player: Player, id: string) => void;

function setJoinTrap(playerName: string, delay: number, callback: TrapCallback) {
    game.subscribeToEvent("playerJoins", (data, context) => {
        let t1 = setTimeout(async () => {
            const player = game.getPlayer(context.playerId!)!
            if (player.name.toLowerCase().includes(playerName.toLowerCase())) {
                clearTimeout(t1);
                callback(player, context.playerId!);
            }
        }, delay);
    });
}

function printMewmbaList() {
    for (const mewmba in myWrapper.listMewmbas()) {
        console.log(mewmba)
    }
}

printMewmbaList()

// game.subscribeToConnection(connected => console.log("connected?", connected));
// subscribeToMapSetObjects();
// game.subscribeToEvent("playerChats", (data, context) => {
//     console.log(data, context)
// })
// game.subscribeToEvent("playerInteracts", (data, context) => {
//     console.log(data, context)
// })

function setRickRollTrap(playerName: string) {
    setJoinTrap(playerName, 3000, (player, id) => {
        myWrapper.rickroll(id)
    })
}

// setRickRollTrap("Chiara")

function mewmbaHarassTheIntern(mewmbaName: string, playerName: string) {
    setJoinTrap(playerName, 1000, (player, id) => {
        const mewmba = myWrapper.getMewmbaByName(mewmbaName);
        mewmba.chasePlayer(playerName);
        myWrapper.createNeonLight(1, 1, "violet")
    })
}

mewmbaHarassTheIntern("phillis", "phillis")

function mewmbaSetUpDanceParty(mewmbaName: string, playerName: string) {
    setJoinTrap(playerName, 1000, (player, id) => {
        const mewmba = myWrapper.getMewmbaByName(mewmbaName);
        // Range: (36,10) -> (45,20)
        mewmba.routeToPoint({x: 36, y: 10})
        myWrapper.createNeonLight(randomInt(36, 45), randomInt(10, 20), RandomColor())
    })
}

function printCoffeeCupImage(x: number, y: number, text: string) {
    const {fonts, renderPixels} = require('js-pixel-fonts');
    const pixels = renderPixels(text, fonts.sevenPlus);
    // Iterate through the pixels and add all the coffee cups
    const pixelScale = 4
    let index = 1;
    // TODO - Fix the rate limiter
    for (let yp = 0; yp < pixels.length; yp++) {
        for (let xp = 0; xp < pixels[yp].length; xp++) {
            if (pixels[yp][xp] === 0) continue;
            // Fractional scaling cups
            let t1 = setTimeout(() => {
                let xc = (x + xp / pixelScale)
                let yc = (y + yp / pixelScale)
                myWrapper.createCoffee(xc, yc)
                clearTimeout(t1);
            }, 1000 * index)
            index++;
        }
    }
}

async function runGuestBadgeIssuerAndVerifier() {
    let issuer = new GuestBadgeIssuer();
    let proof = await issuer.issueGuestBadgeProof("4113", "4113@example.com", "green");
    console.log('proof: ' + proof);

    let verifier = new GuestBadgeVerifier();
    await verifier.verifyGuestBadgeProof(proof);
}


// uncomment this line to test issuance!
// runGuestBadgeIssuerAndVerifier();

// printCoffeeCupImage(48, 7, `Hi ${"Chiara"}`)

// mewmbaSetUpDanceParty("phillis", "phillis")

function mewmbaCleanupCoffee(mewmbaName: string, playerName: string) {
    setJoinTrap(playerName, 1000, (player, id) => {
        const mewmba = myWrapper.getMewmbaByName(mewmbaName);
        const coffee = myWrapper.findCoffee()
        mewmba.cleanupCoffee(coffee)
    })
}

// mewmbaCleanupCoffee("4113", "phillis")
