import { Game, MapObject, Point } from "@gathertown/gather-game-client";
import { Mewmba, MewmbaObject } from "./mewmba";
import { CreateCoffeeCup, CreateLight, RandomColor } from "./json-data";
import { randomInt } from "crypto";
import { Player } from "@gathertown/gather-game-common";
import { fonts, renderPixels } from "js-pixel-fonts";
import { GuestBadgeIssuer } from "./guest_badge/issuer";
import { GuestBadgeVerifier } from "./guest_badge/verifier";
import { gatherApiKey, gatherMapId, gatherSpaceId } from "./util";
import { debuglog } from "util";

type GatherObjectCallback = (obj: MapObject, key: number) => void;
type TrapCallback = (player: Player, id: string) => void;

export class GatherWrapper {
  game: Game;
  logger = debuglog("GatherWrapper");

  private constructor(game: Game) {
    this.game = game;
  }

  static async createInstance(): Promise<GatherWrapper> {
    global.WebSocket = require("isomorphic-ws");
    const game = new Game(gatherSpaceId(), () =>
      Promise.resolve({ apiKey: gatherApiKey() })
    );
    game.subscribeToConnection((connected) => {
      console.log("connected?", connected);
    });

    await game.connect();
    await game.waitForInit();
    return new GatherWrapper(game);
  }

  filterObjectsByName(nameFilter: string, callback: GatherObjectCallback) {
    let objects = this.game.completeMaps[gatherMapId()]?.objects;
    for (const _key in objects) {
      const key = parseInt(_key);
      const obj = objects?.[key];
      if (!obj || !obj._name) continue;
      if (obj._name!.toLowerCase().includes(nameFilter.toLowerCase()))
        callback(obj, key);
    }
  }

  listMewmbas(): MewmbaObject[] {
    let mewmbas: MewmbaObject[] = [];
    this.filterObjectsByName("mewmba", (obj, key) =>
      mewmbas.push(new MewmbaObject(obj, key, obj._name!.toLowerCase()))
    );
    return mewmbas;
  }

  printMewmbaList() {
    for (const mewmba in this.listMewmbas()) {
      console.log(mewmba);
    }
  }

  async createNeonLight(x: number, y: number, colorName: string) {
    const newLight = CreateLight(x, y, colorName);
    await this.game.engine.sendAction({
      $case: "mapAddObject",
      mapAddObject: { mapId: gatherMapId(), object: newLight },
    });
  }

  async createCoffee(x: number, y: number) {
    const newCup = CreateCoffeeCup(x, y);
    await this.game.engine.sendAction({
      $case: "mapAddObject",
      mapAddObject: { mapId: gatherMapId(), object: newCup },
    });
  }

  getMewmbaByName(name: string): Mewmba {
    if (name === "***RANDOM***") {
      return this.getMewmba();
    }
    const mobj = this.listMewmbas().filter((value) =>
      value.name.toLowerCase().includes(name)
    )[0];
    return new Mewmba(this, mobj.obj, mobj.key);
  }

  getMewmba(): Mewmba {
    const mewmbas = this.listMewmbas();
    const mobj = mewmbas[randomInt(mewmbas.length)];
    return new Mewmba(this, mobj.obj, mobj.key);
  }

  playJaws(playerId: string | undefined) {
    this.game.playSound(
      "https://orangefreesounds.com/wp-content/uploads/2016/04/Jaws-theme-song.mp3",
      0.5,
      playerId
    );
  }

  rickroll(playerId: string | undefined) {
    this.logger("Rickroll time!");
    this.game.playSound(
      "https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Never+Gonna+Give+You+Up-+Original&filename=mz/Mzg1ODMxNTIzMzg1ODM3_JzthsfvUY24.MP3",
      0.5,
      playerId
    );
  }

  findCoffee(): { obj: MapObject; key: number } | undefined {
    // Find a random coffee cup, and go vacuum it up
    let coffees: { obj: MapObject; key: number }[] = [];
    this.filterObjectsByName("To-Go Coffee", (obj, key) =>
      coffees.push({ obj, key })
    );
    if (coffees.length === 0) return undefined;
    return coffees[randomInt(coffees.length)];
  }

  getPersonPoint(name: String): Point {
    // Make it pick a person.
    for (const playerKey in this.game.players) {
      const player = this.game.getPlayer(playerKey)!;
      if (player.name.toLowerCase().includes(name.toLowerCase())) {
        return { x: player.x, y: player.y };
      }
    }
    throw Error;
  }

  async setJoinTrap(
    playerName: string,
    delay: number,
    callback: TrapCallback
  ): Promise<void> {
    return new Promise((resolve) => {
      this.game.subscribeToEvent("playerJoins", (data, context) => {
        let t1 = setTimeout(async () => {
          const player = this.game.getPlayer(context.playerId!)!;
          if (player.name.toLowerCase().includes(playerName.toLowerCase())) {
            clearTimeout(t1);
            callback(player, context.playerId!);
            resolve();
          }
        }, delay);
      });
    });
  }

  subscribeToMapSetObjects() {
    this.game.subscribeToEvent("mapSetObjects", (data, context) => {
      if (data.mapSetObjects.mapId !== gatherMapId()) return;
      // Ensure this is a creation
      // @ts-ignore
      if (data.mapSetObjects.objects.length > 1) return;
      for (const dataKey in data.mapSetObjects.objects) {
        const dataObject = data.mapSetObjects.objects[dataKey];
        if (dataObject._name?.startsWith("To-Go Coffee")) {
          this.logger("Coffee needs ordered!");
        }
      }
    });
  }

  async mewmbaSetUpDanceParty(
    mewmbaName: string,
    playerName: string
  ): Promise<void> {
    return this.setJoinTrap(playerName, 1000, async (player, id) => {
      const mewmba = this.getMewmbaByName(mewmbaName);
      // Range: (36,10) -> (45,20)
      mewmba.routeToPoint({ x: 36, y: 10 });
      await this.createNeonLight(
        randomInt(36, 45),
        randomInt(10, 20),
        RandomColor()
      );
    });
  }

  async printCoffeeCupImage(x: number, y: number, text: string): Promise<void> {
    const pixels = renderPixels(text, fonts.sevenPlus);
    // Iterate through the pixels and add all the coffee cups
    const pixelScale = 4;
    let index = 1;
    // TODO - Fix the rate limiter
    for (let yp = 0; yp < pixels.length; yp++) {
      for (let xp = 0; xp < pixels[yp].length; xp++) {
        if (pixels[yp][xp] === 0) continue;
        // Fractional scaling cups
        let t1 = setTimeout(() => {
          let xc = x + xp / pixelScale;
          let yc = y + yp / pixelScale;
          this.createCoffee(xc, yc);
          clearTimeout(t1);
        }, 1000 * index);
        index++;
      }
    }
  }

  async runGuestBadgeIssuerAndVerifier(): Promise<void> {
    let issuer = new GuestBadgeIssuer();
    let proof = await issuer.issueGuestBadgeProof(
      "4113",
      "4113@example.com",
      "green"
    );
    this.logger("proof: " + proof);

    let verifier = new GuestBadgeVerifier();
    await verifier.verifyGuestBadgeProof(proof);
  }

  async mewmbaCleanupCoffee(mewmbaName: string): Promise<void> {
    const mewmba = this.getMewmbaByName(mewmbaName);
    const coffee = this.findCoffee();
    if (coffee === undefined) return;
    return mewmba.cleanupCoffee(coffee);
  }

  async setRickRollTrap(playerName: string): Promise<void> {
    return this.setJoinTrap(playerName, 3000, (player, id) => {
      this.rickroll(id);
    });
  }

  async setJawsTrap(playerName: string): Promise<void> {
    if (playerName === "" || playerName === undefined) {
      this.playJaws(undefined);
      return Promise.resolve();
    }
    return this.setJoinTrap(playerName, 3000, (player, id) => {
      this.playJaws(id);
    });
  }

  async mewmbaHarassTheIntern(
    mewmbaName: string,
    playerName: string
  ): Promise<void> {
    return this.setJoinTrap(playerName, 1000, (player, id) => {
      const mewmba = this.getMewmbaByName(mewmbaName);
      mewmba.chasePlayer(playerName);
      this.createNeonLight(1, 1, "violet");
    });
  }

  getRandomPlayer(): string {
    const players = Object.values(this.game.players);
    return players[randomInt(0, players.length)].name;
  }

  disconnect() {
    this.game.disconnect();
  }
}
