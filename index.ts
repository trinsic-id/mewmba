import {GATHER_API_KEY, GATHER_MAP_ID, GATHER_SPACE_ID} from "./api-key";
import {Game} from "@gathertown/gather-game-client";
import {Mewmba} from "./mewmba";
import {Player} from "@gathertown/gather-game-common";
import {randomInt} from "crypto";
import {RandomColor} from "./neonLights";
import {GatherWrapper} from "./gatherwrapper";

global.WebSocket = require("isomorphic-ws");

const HELP_MESSAGE = "Enter /help for this list of commands:\n/rickroll <Name> to rickroll someone\n/verify <code> to verify your credential code sent to your email"
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
        setTimeout(async () => {
            const player = game.getPlayer(context.playerId!)
            if (player.name.toLowerCase().includes(playerName.toLowerCase())) {
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
        myWrapper.createNeonLight(randomInt(36, 45), randomInt(10,20), RandomColor())
    })
}
// mewmbaSetUpDanceParty("phillis","phillis")

game.subscribeToEvent("playerChats", (data, context) => {
    if (data.playerChats.contents.toLowerCase()[0] === "/") {
        let args = data.playerChats.contents.split(/(\s+)/).filter(arg => !arg.match(/(\s+)/))
        console.log(args)
        switch (args[0]) {
            case "/rickroll":
                if (args[1]) {

                    for (const id in game.players) {
                        if (game.players[id].name.toLowerCase().includes(args[1].toLowerCase())) {
                            // console.log(id, game.players[id])
                            myWrapper.rickroll(id);
                        }
                    }
                }
                else {
                    console.log("Missing argument for the Roll of Rick. Must include a player name")
                    game.chat(data.playerChats.senderId, [], GATHER_MAP_ID, HELP_MESSAGE)
                }
                break;
            case "/verify":
                console.log(args[1])
                if (args[1]) {
                    if (isBase64(args[1])) {
                        console.log("verifying", args[1], "...")
                        // TODO: Send the verification code to actually be verified
                    }
                    else {
                        game.chat(data.playerChats.senderId, [], GATHER_MAP_ID, HELP_MESSAGE)
                    }
                }
                else {
                    game.chat(data.playerChats.senderId, [], GATHER_MAP_ID, HELP_MESSAGE)
                }
                break;
            case "/help":
                game.chat(data.playerChats.senderId, [], GATHER_MAP_ID, HELP_MESSAGE)
                break;
            default:
                "Invalid Input"
                break;
        }
    }
})

function isBase64(str: string) {
    try {
        return btoa(atob(str)) == str;
    } catch (err) {
        return false;
    }
}
