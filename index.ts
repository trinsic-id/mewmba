import {GATHER_API_KEY, GATHER_MAP_ID, GATHER_SPACE_ID} from "./api-key";
import {Game, WireObject} from "@gathertown/gather-game-client";
import {Roomba} from "./roomba";

global.WebSocket = require("isomorphic-ws");


// gather game client setup
const game = new Game(() => Promise.resolve({apiKey: GATHER_API_KEY}));
game.connect(GATHER_SPACE_ID);
game.subscribeToConnection(connected => console.log("connected?", connected));
game.subscribeToEvent("playerMoves", (data, context) => {
    // Blow smoke?
    // console.log(data.playerMoves)
    // data.playerMoves.direction
});
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

game.subscribeToEvent("playerChats", (data, context) => {
    console.log(data, context)
})``

game.subscribeToEvent("playerInteracts", (data, context) => {
    console.log(data, context)
})

function setRickRollTrap(playerName: string) {
    game.subscribeToEvent("playerJoins", (data, context) => {
        setTimeout(async () => {
            const player = game.getPlayer(context.playerId!)
            if (player.name.toLowerCase().includes(playerName.toLowerCase())) {
                console.log("Rickroll time!")
                // game.playSound("https://www.soundjay.com/buttons/beep-10.mp3", 0.1, context.playerId!)
                // game.playSound("https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Never+Gonna+Give+You+Up-+Original&filename=mz/Mzg1ODMxNTIzMzg1ODM3_JzthsfvUY24.MP3", 0.3, context.playerId!)
            }
        }, 5000)
    })
}
// setRickRollTrap("michael")

function randomRoomba() {
    setTimeout(async () => {
        const mewmba = new Roomba(game)
        mewmba.routeRoomba(mewmba.getRandomPoint())
        // Pick a random player
    }, 3000)
}
// randomRoomba();

function roombaChasePlayer(playerName: string) {
    game.subscribeToEvent("playerJoins", (data, context) => {
        setTimeout(async () => {
            const player = game.getPlayer(context.playerId!)
            if (player.name.toLowerCase().includes(playerName.toLowerCase())) {
                console.log("Jaws time")
                // game.playSound("https://orangefreesounds.com/wp-content/uploads/2016/04/Jaws-theme-song.mp3", 0.3, context.playerId!)
                const killerRoomba = new Roomba(game)
                killerRoomba.routeRoomba({x: player.x, y: player.y})
                // killerRoomba.routeRoomba({x: 43, y: 16})
            }
        }, 5000)
    })
}
roombaChasePlayer("phillis")