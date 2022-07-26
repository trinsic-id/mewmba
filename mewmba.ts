import {MapObject, Point, WireObject} from "@gathertown/gather-game-client";
import PF from "pathfinding";
import {randomInt} from "crypto";
import {GatherWrapper} from "./gatherwrapper";
import {gatherMapId} from "./util";

type OnStepCallback = () => number[][];

export class Mewmba {
    wrapper: GatherWrapper;
    mapObject: MapObject
    key: number

    constructor(game: GatherWrapper, obj: MapObject, key: number) {
        this.wrapper = game
        this.mapObject = obj
        this.key = key
    }

    computeRoute(target: Point): number[][] {
        const roomba = this.mapObject
        // Download the grid
        const grid = this.downloadGrid();
        // Navigate there.
        const finder = new PF.AStarFinder({
            diagonalMovement: PF.DiagonalMovement.Never,
        })
        const path = finder.findPath(roomba.x!, roomba.y!, target.x, target.y, grid);
        console.log(path)
        return path;
    }

    getRandomPoint(): Point {
        const grid = this.downloadGrid()
        let targetX: number = 0
        let targetY: number = 0
        while (true) {
            targetX = randomInt(0, grid.width);
            targetY = randomInt(0, grid.height);
            if (grid.isWalkableAt(targetX, targetY)) break;
        }
        return {x: targetX, y: targetY};
    }

    async routeToPoint(target: Point): Promise<void> {
        const path = this.computeRoute(target);
        await this.animateMovement(path, undefined);
    }

    async chasePlayer(name: string): Promise<void> {
        const path = this.computeRoute(this.wrapper.getPersonPoint(name));
        await this.animateMovement(path, () => {
            return this.computeRoute(this.wrapper.getPersonPoint(name));
        });
        const point = this.wrapper.getPersonPoint(name)
        // this.createNeonLight(point.x + randomInt(-1, 1), point.y + randomInt(-1, 1), "red")
        // this.rickroll("")
    }

    async cleanupCoffee(coffeeKey: { obj: MapObject; key: number }): Promise<void> {
        const coffee = coffeeKey.obj
        const path = this.computeRoute({x: coffee.x, y: coffee.y});
        await this.animateMovement(path)
        // Remove the object
        await this.wrapper.game.deleteObject(gatherMapId(), String(coffeeKey.key))
    }

    private downloadGrid(): PF.Grid {
        const impassable = this.wrapper.game.completeMaps[gatherMapId()]?.collisions!
        let passGrid: number[][] = [];
        for (let row = 0; row < impassable.length; row++) {
            passGrid[row] = []
            for (let col = 0; col < impassable[0].length; col++) passGrid[row][col] = Number(impassable[row][col])
        }
        return new PF.Grid(passGrid);
    }

    private moveTowardsPoint(target: Point): boolean {
        const roomba = this.mapObject
        const objectUpdates: { [key: number]: WireObject } = {};

        // Move 1 step
        const speed = 2.0  // pixels per step
        const pixelSize = 32.0
        const dx = target.x - (roomba.x + roomba.offsetX! / pixelSize);
        const dy = target.y - (roomba.y + roomba.offsetY! / pixelSize);

        if (Math.abs(dx) < 1.0 / pixelSize && Math.abs(dy) < 1.0 / pixelSize) return false

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
            x: baseX, y: baseY, offsetX: fracX, offsetY: fracY, _tags: []
        }

        // Update the local cached mewmba instance
        this.mapObject.x = baseX;
        this.mapObject.y = baseY;
        this.mapObject.offsetX = fracX;
        this.mapObject.offsetY = fracY;

        console.log(objectUpdates)
        this.wrapper.game.engine.sendAction({
            $case: "mapSetObjects", mapSetObjects: {mapId: gatherMapId(), objects: objectUpdates}
        })

        return true
    }

    private async animateMovement(path: number[][], onstepCallback?: OnStepCallback | undefined): Promise<void> {
        // Trigger the animation to it
        if (path.length === 1) {
            return;
        }
        let pathStep = 1;
        return await new Promise(resolve => {
            const stepTimer: NodeJS.Timer = setInterval(async () => {
                if (!this.moveTowardsPoint(pointFromArray(path[pathStep]))) {
                    if (onstepCallback) {
                        path = onstepCallback();
                    } else {
                        pathStep++;
                    }
                }

                if (pathStep == path.length) {
                    clearInterval(stepTimer)
                    resolve()
                }
            }, 100);
        });
    }
}

export function pointFromArray(pt: number[]): Point {
    return {x: pt[0], y: pt[1]}
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