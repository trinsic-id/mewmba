import { GatherWrapper } from "./src/gatherwrapper";
import commandLineArgs, { OptionDefinition } from "command-line-args";
import { SlackIntegration } from "./src/slack/SlackIntegration";

const optionsDefinition: OptionDefinition[] = [
  { name: "chase", type: Boolean },
  { name: "cleanup", type: Boolean },
  { name: "jaws", type: Boolean },
  { name: "move", type: Boolean },
  { name: "rickroll", type: Boolean },
  { name: "wander", type: Boolean },

  { name: "player", type: String },
  { name: "location_x", type: Number },
  { name: "location_y", type: Number },
  { name: "mewmba", type: String, multiple: true },
];

const slack = new SlackIntegration();
slack.connect().then(() => {});

const options = commandLineArgs(optionsDefinition);

GatherWrapper.createInstance().then(async (value: GatherWrapper) => {
  const myWrapper = value;

  if (options.player === "***RANDOM***") {
    options.player = myWrapper.getRandomPlayer();
  }

  let mewmbas: Promise<void>[] = [];
  for (const myMewmbaName of options.mewmba) {
    let myMewmba = myWrapper.getMewmbaByName(myMewmbaName as string);
    if (options.chase) {
      mewmbas.push(myMewmba.chasePlayer(options.player));
    }
    if (options.rickroll) {
      mewmbas.push(myWrapper.setRickRollTrap(options.player));
    }
    if (options.jaws) {
      mewmbas.push(myWrapper.setJawsTrap(options.player));
    }
    if (options.wander) {
      mewmbas.push(myMewmba.routeToPoint(myMewmba.getRandomPoint()));
    }
    if (options.cleanup) {
      mewmbas.push(myWrapper.mewmbaCleanupCoffee(myMewmbaName as string));
    }
    // TODO - Add other commands here
  }

  // Await all
  for (const m of mewmbas) {
    await m;
  }

  myWrapper.disconnect();
  return;
});

// subscribeToMapSetObjects();
// wrapper.subscribeToEvent("playerChats", (data, context) => {
//     console.log(data, context)
// })
// wrapper.subscribeToEvent("playerInteracts", (data, context) => {
//     console.log(data, context)
// })

// setRickRollTrap("Chiara")

// mewmbaHarassTheIntern("phillis", "phillis")

// uncomment this line to test issuance!
// runGuestBadgeIssuerAndVerifier();

// printCoffeeCupImage(48, 7, `Hi ${"Chiara"}`)

// mewmbaSetUpDanceParty("phillis", "phillis")

// mewmbaCleanupCoffee("4113", "phillis")
