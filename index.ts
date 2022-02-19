import {GATHER_API_KEY, GATHER_MAP_ID, GATHER_SPACE_ID} from "./api-key";
import {Game} from "@gathertown/gather-game-client";
import {Mewmba} from "./mewmba";
import {Player} from "@gathertown/gather-game-common";
import {randomInt} from "crypto";
import {RandomColor} from "./json-data";
import {GatherWrapper} from "./gatherwrapper";

global.WebSocket = require("isomorphic-ws");

// gather game client setup
const game = new Game(() => Promise.resolve({apiKey: GATHER_API_KEY}));
game.connect(GATHER_SPACE_ID);
const myWrapper = new GatherWrapper(game)

function subscribeToMapSetObjects() {
    game.subscribeToEvent("mapSetObjects", (data, context) => {
        if (data.mapSetObjects.mapId !== GATHER_MAP_ID) return
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
            const player = game.getPlayer(context.playerId!)
            if (player.name.toLowerCase().includes(playerName.toLowerCase())) {
                clearTimeout(t1);
                callback(player, context.playerId!);
            }
        }, delay);
    });
}

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

// setRickRollTrap("4113")

function mewmbaHarassTheIntern(mewmbaName: string, playerName: string) {
    setJoinTrap(playerName, 1000, (player, id) => {
        const mewmba = myWrapper.getMewmbaByName(mewmbaName);
        // mewmba.chasePlayer(playerName);
        myWrapper.createNeonLight(1, 1, "violet")
    })
}

// mewmbaHarassTheIntern("4113", "Michael Black")

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

// printCoffeeCupImage(48, 7, `Hi ${"Scott"}`)

// mewmbaSetUpDanceParty("phillis", "phillis")

function mewmbaCleanupCoffee(mewmbaName: string, playerName: string) {
    setJoinTrap(playerName, 1000, (player, id) => {
        const mewmba = myWrapper.getMewmbaByName(mewmbaName);
        const coffee = myWrapper.findCoffee()
        mewmba.cleanupCoffee(coffee)
    })
}

mewmbaCleanupCoffee("4113", "phillis")