import {Game, MapObject, WireObject} from "@gathertown/gather-game-client";
import {GATHER_MAP_ID} from "./api-key";
import PF, {DiagonalMovement} from "pathfinding";
import {randomInt} from "crypto";

export class Roomba {
    game: Game;

    constructor(game: Game) {
        this.game = game
    }

    getRoomba(): { obj: MapObject; key: number } {
        for (const _key in this.game.partialMaps[GATHER_MAP_ID]?.objects) {
            const key = parseInt(_key)
            const obj = this.game.partialMaps[GATHER_MAP_ID]?.objects?.[key]
            if (!obj) continue
            if (obj._name! === "Cat Roomba") {
                return {obj, key}
            }
        }
        throw Error
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

    getPersonPoint(): Point {
        // TODO - Make it pick a person.
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

    moveRoomba(target: Point): boolean {
        const {obj: roomba, key} = this.getRoomba();
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

    routeRoomba(target: Point) {
        // Download the grid
        const grid = this.downloadGrid();

        const {obj: roomba, key} = this.getRoomba();
        // Navigate there.
        const finder = new PF.AStarFinder({
            diagonalMovement: DiagonalMovement.Never,
        })
        const path = finder.findPath(roomba.x!, roomba.y!, target.x, target.y, grid);
        console.log(path)

        // Trigger the animation to it
        let pathStep = 1;
        const stepTimer = setInterval(async () => {
            if (!this.moveRoomba(Point.fromArray(path[pathStep])))
                pathStep++;

            if (pathStep == path.length) {
                clearInterval(stepTimer)
                console.log("Roomba parked")
            }
        }, 100);
    }
}

class Point {
    x: number = 0
    y: number = 0

    public static fromArray(pt: number[]): Point {
        return {x: pt[0], y: pt[1]}
    }
}