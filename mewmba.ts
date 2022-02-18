import {Game, MapObject, WireObject} from "@gathertown/gather-game-client";
import {GATHER_MAP_ID} from "./api-key";
import PF, {DiagonalMovement} from "pathfinding";
import {randomInt} from "crypto";
import {CreateLight} from "./neonLights";

type GatherObjectCallback = (obj: MapObject, key: number) => void;
type OnStepCallback = () => number[][];
type OnStopCallback = () => void;
export class Mewmba {
    game: Game;
    selectedMewmba: MewmbaObject | undefined = undefined;

    constructor(game: Game) {
        this.game = game
    }

    filterObjectsByName(nameFilter: string, callback: GatherObjectCallback) {
        for (const _key in this.game.completeMaps[GATHER_MAP_ID]?.objects) {
            const key = parseInt(_key)
            const obj = this.game.completeMaps[GATHER_MAP_ID]?.objects?.[key]
            if (!obj || !obj._name) continue
            if (obj._name!.toLowerCase().includes(nameFilter.toLowerCase()))
                callback(obj, key);
        }
    }

    listMewmbas(): MewmbaObject[] {
        let mewmbas: MewmbaObject[] = []
        this.filterObjectsByName("mewmba", (obj, key) => mewmbas.push(new MewmbaObject(obj, key, obj._name!.toLowerCase())))
        return mewmbas;
    }

    getNeonLights() {
        this.filterObjectsByName("Neon Light (Circle)", (obj, key) => console.log(obj))
    }

    createNeonLight(x: number, y: number, colorName: string) {
        const newLight = CreateLight(x, y, colorName);
        this.game.engine.sendAction({
            $case: "mapAddObject",
            mapAddObject: {mapId: GATHER_MAP_ID, object: newLight }
        });
    }

    getMewmbaByName(name: string): MewmbaObject {
        return this.listMewmbas().filter(value => value.name.toLowerCase().includes(name))[0];
    }

    selectMewmba(m: MewmbaObject): void {
        this.selectedMewmba = m;
    }

    downloadGrid(): PF.Grid {
        const impassable = this.game.completeMaps[GATHER_MAP_ID]?.collisions!
        let passGrid: number[][] = [];
        for (let row = 0; row < impassable.length; row++) {
            passGrid[row] = []
            for (let col = 0; col < impassable[0].length; col++)
                passGrid[row][col] = Number(impassable[row][col])
        }
        return new PF.Grid(passGrid);
    }

    computeRoute(target: Point): number[][] {
        const roomba = this.selectedMewmba!.obj
        // Download the grid
        const grid = this.downloadGrid();
        // Navigate there.
        const finder = new PF.AStarFinder({
            diagonalMovement: DiagonalMovement.Never,
        })
        const path = finder.findPath(roomba.x!, roomba.y!, target.x, target.y, grid);
        console.log(path)
        return path;
    }

    getPersonPoint(name: String): Point {
        // Make it pick a person.
        for (const playerKey in this.game.players) {
            const player = this.game.getPlayer(playerKey);
            if (player.name.toLowerCase().includes(name.toLowerCase())) {
                return {x: player.x, y: player.y}
            }
        }
        throw Error
    }

    getRandomPoint(): Point {
        const grid = this.downloadGrid()
        let targetX: number = 0
        let targetY: number = 0
        while (true) {
            targetX = randomInt(0, grid.width);
            targetY = randomInt(0, grid.height);
            if (grid.isWalkableAt(targetX, targetY))
                break;
        }
        return {x: targetX, y: targetY};
    }

    moveTowardsPoint(target: Point): boolean {
        const {obj: roomba, key} = this.selectedMewmba!;
        const objectUpdates: { [key: number]: WireObject } = {};

        // Move 1 step
        const speed = 2.0  // pixels per step
        const pixelSize = 32.0
        const dx = target.x - (roomba.x + roomba.offsetX! / pixelSize);
        const dy = target.y - (roomba.y + roomba.offsetY! / pixelSize);

        if (Math.abs(dx) < 1.0 / pixelSize && Math.abs(dy) < 1.0 / pixelSize)
            return false

        const theta = Math.atan2(dy, dx);
        // Compute speed adjusted step
        const stepX = speed / pixelSize * Math.cos(theta)
        const stepY = speed / pixelSize * Math.sin(theta)
        const newX = Math.abs(roomba.x + roomba.offsetX! / pixelSize + stepX);
        const newY = Math.abs(roomba.y + roomba.offsetY! / pixelSize + stepY);

        const baseX = Math.floor(newX);
        const baseY = Math.floor(newY);
        const fracX = Math.floor(pixelSize * (newX - baseX))
        const fracY = Math.floor(pixelSize * (newY - baseY))
        objectUpdates[key] = {
            x: baseX,
            y: baseY,
            offsetX: fracX,
            offsetY: fracY,
            _tags: []
        }

        // Update the local cached mewmba instance
        this.selectedMewmba!.obj.x = baseX;
        this.selectedMewmba!.obj.y = baseY;
        this.selectedMewmba!.obj.offsetX = fracX;
        this.selectedMewmba!.obj.offsetY = fracY;

        console.log(objectUpdates)
        this.game.engine.sendAction({
            $case: "mapSetObjects",
            mapSetObjects: {mapId: GATHER_MAP_ID, objects: objectUpdates}
        })

        return true
    }
    routeToPoint(target: Point) {
        const path = this.computeRoute(target);
        this.animateMovement(path, undefined, undefined);
    }

    private animateMovement(path: number[][], onstepCallback: OnStepCallback | undefined, onStop: OnStopCallback | undefined) {
        // Trigger the animation to it
        let pathStep = 1;
        const stepTimer = setInterval(async () => {
            if (!this.moveTowardsPoint(Point.fromArray(path[pathStep]))) {
                if (onstepCallback) {
                    path = onstepCallback();
                } else {
                    pathStep++;
                }
            }

            if (pathStep == path.length) {
                clearInterval(stepTimer)
                console.log("Mewmba parked")
                if (onStop)
                    onStop();
            }
        }, 100);
    }

    chasePlayer(name: string) {
        const path = this.computeRoute(this.getPersonPoint(name));
        this.animateMovement(path, () => {
            return this.computeRoute(this.getPersonPoint(name));
        }, () => {
            const point = this.getPersonPoint(name)
            this.createNeonLight(point.x + randomInt(-1, 1), point.y + randomInt(-1, 1), "red")
            this.rickroll("")
        });
    }

    playJaws() {
        // game.playSound("https://orangefreesounds.com/wp-content/uploads/2016/04/Jaws-theme-song.mp3", 0.3, context.playerId!)
    }
    rickroll(playerId: string) {
        console.log("Rickroll time!")
        this.game.playSound("https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Never+Gonna+Give+You+Up-+Original&filename=mz/Mzg1ODMxNTIzMzg1ODM3_JzthsfvUY24.MP3", 0.3, playerId)
    }
}

class Point {
    x: number = 0
    y: number = 0

    public static fromArray(pt: number[]): Point {
        return {x: pt[0], y: pt[1]}
    }
}

class MewmbaObject {
    obj: MapObject
    key: number = 0
    name: string = ""

    constructor(obj: MapObject, key: number, name: string) {
        this.obj = obj;
        this.key = key;
        this.name = name;
    }

}