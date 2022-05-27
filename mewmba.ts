import {Game, MapObject, WireObject} from "@gathertown/gather-game-client";
import {GATHER_MAP_ID} from "./api-key";
import PF, {DiagonalMovement} from "pathfinding";
import {randomInt} from "crypto";

type OnStepCallback = () => number[][];
type OnStopCallback = () => void;

export class Mewmba {
    game: Game;
    mapObject: MapObject
    key: number

    constructor(game: Game, obj: MapObject, key: number) {
        this.game = game
        this.mapObject = obj
        this.key = key
    }

    private downloadGrid(): PF.Grid {
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
        const roomba = this.mapObject
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
            const player = this.game.getPlayer(playerKey)!;
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

    private moveTowardsPoint(target: Point): boolean {
        const roomba = this.mapObject
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
        objectUpdates[this.key] = {
            x: baseX,
            y: baseY,
            offsetX: fracX,
            offsetY: fracY,
            _tags: []
        }

        // Update the local cached mewmba instance
        this.mapObject.x = baseX;
        this.mapObject.y = baseY;
        this.mapObject.offsetX = fracX;
        this.mapObject.offsetY = fracY;

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
            // this.createNeonLight(point.x + randomInt(-1, 1), point.y + randomInt(-1, 1), "red")
            // this.rickroll("")
        });
    }

    cleanupCoffee(coffeeKey: { obj: MapObject; key: number }) {
        const coffee = coffeeKey.obj
        const path = this.computeRoute({x: coffee.x, y: coffee.y});
        this.animateMovement(path, undefined, () => {
            // Remove the object
            this.game.deleteObject(GATHER_MAP_ID, String(coffeeKey.key))
            let a = 1
        })
    }
}

class Point {
    x: number = 0
    y: number = 0

    public static fromArray(pt: number[]): Point {
        return {x: pt[0], y: pt[1]}
    }
}

export class MewmbaObject {
    obj: MapObject
    key: number = 0
    name: string = ""

    constructor(obj: MapObject, key: number, name: string) {
        this.obj = obj;
        this.key = key;
        this.name = name;
    }

    toString(): string {
        return `Mewmba name=${this.name} key=${this.key} object=${this.obj}`
    }
}