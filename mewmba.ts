import {Game, MapObject, WireObject} from "@gathertown/gather-game-client";
import {GATHER_MAP_ID} from "./api-key";
import PF, {DiagonalMovement} from "pathfinding";
import {randomInt} from "crypto";

export class Mewmba {
    game: Game;
    selectedMewmba: MewmbaObject | undefined = undefined;

    constructor(game: Game) {
        this.game = game
    }

    listMewmbas(): MewmbaObject[] {
        let mewmbas = []
        for (const _key in this.game.completeMaps[GATHER_MAP_ID]?.objects) {
            const key = parseInt(_key)
            const obj = this.game.completeMaps[GATHER_MAP_ID]?.objects?.[key]
            if (!obj || !obj._name) continue
            if (obj._name!.toLowerCase().startsWith("mewmba")) {
                mewmbas.push(new MewmbaObject(obj, key, obj._name!.toLowerCase()));
            }
        }
        return mewmbas;
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

    moveToPoint(target: Point): boolean {
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

        console.log(objectUpdates)
        this.game.engine.sendAction({
            $case: "mapSetObjects",
            mapSetObjects: {mapId: GATHER_MAP_ID, objects: objectUpdates}
        })

        return true
    }

    routeToPoint(target: Point) {
        // Download the grid
        const grid = this.downloadGrid();

        const {obj: roomba, key} = this.selectedMewmba!;
        // Navigate there.
        const finder = new PF.AStarFinder({
            diagonalMovement: DiagonalMovement.Never,
        })
        const path = finder.findPath(roomba.x!, roomba.y!, target.x, target.y, grid);
        console.log(path)

        // Trigger the animation to it
        let pathStep = 1;
        const stepTimer = setInterval(async () => {
            if (!this.moveToPoint(Point.fromArray(path[pathStep])))
                pathStep++;

            if (pathStep == path.length) {
                clearInterval(stepTimer)
                console.log("Mewmba parked")
            }
        }, 200);
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