import {Game, MapObject} from "@gathertown/gather-game-client";
import {GATHER_MAP_ID} from "./api-key";
import {Mewmba, MewmbaObject} from "./mewmba";
import {CreateCoffeeCup, CreateLight} from "./json-data";
import {randomInt} from "crypto";

type GatherObjectCallback = (obj: MapObject, key: number) => void;

export class GatherWrapper {
    game: Game;

    constructor(game: Game) {
        this.game = game
    }

    filterObjectsByName(nameFilter: string, callback: GatherObjectCallback) {
        for (const _key in this.game.completeMaps[GATHER_MAP_ID]?.objects) {
            const key = parseInt(_key)
            const obj = this.game.completeMaps[GATHER_MAP_ID]?.objects?.[key]
            if (!obj || !obj._name) continue
            if (obj._name!.toLowerCase().includes(nameFilter.toLowerCase())) callback(obj, key);
        }
    }

    listMewmbas(): MewmbaObject[] {
        let mewmbas: MewmbaObject[] = []
        this.filterObjectsByName("mewmba", (obj, key) => mewmbas.push(new MewmbaObject(obj, key, obj._name!.toLowerCase())))
        return mewmbas;
    }

    createNeonLight(x: number, y: number, colorName: string) {
        const newLight = CreateLight(x, y, colorName);
        this.game.engine.sendAction({
            $case: "mapAddObject", mapAddObject: {mapId: GATHER_MAP_ID, object: newLight}
        });
    }

    createCoffee(x: number, y: number) {
        const newCup = CreateCoffeeCup(x, y);
        this.game.engine.sendAction({
            $case: "mapAddObject", mapAddObject: {mapId: GATHER_MAP_ID, object: newCup}
        });
    }

    getMewmbaByName(name: string): Mewmba {
        const mobj = this.listMewmbas().filter(value => value.name.toLowerCase().includes(name))[0];
        return new Mewmba(this.game, mobj.obj, mobj.key);
    }

    getMewmba(): Mewmba {
        const mewmbas = this.listMewmbas()
        const mobj = mewmbas[randomInt(mewmbas.length)]
        return new Mewmba(this.game, mobj.obj, mobj.key);
    }

    playJaws() {
        // game.playSound("https://orangefreesounds.com/wp-content/uploads/2016/04/Jaws-theme-song.mp3", 0.3, context.playerId!)
    }

    rickroll(playerId: string) {
        console.log("Rickroll time!")
        this.game.playSound("https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Never+Gonna+Give+You+Up-+Original&filename=mz/Mzg1ODMxNTIzMzg1ODM3_JzthsfvUY24.MP3", 0.5, playerId)
    }

    findCoffee(): { obj: MapObject; key: number } {
        // Find a random coffee cup, and go vacuum it up
        let coffees: { obj: MapObject, key: number }[] = []
        this.filterObjectsByName("To-Go Coffee", (obj, key) => coffees.push({obj, key}))
        return coffees[randomInt(coffees.length)]
    }
}