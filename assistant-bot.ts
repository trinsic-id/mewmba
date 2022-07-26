import {GATHER_MAP_ID} from "./api-key";
import {GatherWrapper} from "./gatherwrapper";

function isBase64(str: string) {
    try {
        return btoa(atob(str)) == str;
    } catch (err) {
        return false;
    }
}

export class AssistantBot {
    wrapper: GatherWrapper;
    helpMessage: string = "Enter /help for this list of commands:\n/rickroll <Name> to rickroll someone\n/verify <code> to verify your credential code sent to your email"

    constructor(game: GatherWrapper) {
        this.wrapper = game;
    }

    displayHelp(playerId: string) {
        this.wrapper.game.chat(playerId, [], GATHER_MAP_ID, {contents: this.helpMessage});
    }

    enableChatCommands() {
        this.wrapper.game.subscribeToEvent("playerChats", (data, context) => {
            if (data.playerChats.contents.toLowerCase()[0] === "/") {
                let args = data.playerChats.contents.split(/(\s+)/).filter(arg => !arg.match(/(\s+)/))
                console.log(args)
                switch (args[0]) {
                    case "/rickroll":
                        if (args[1]) {

                            for (const id in this.wrapper.game.players) {
                                if (this.wrapper.game.players[id].name.toLowerCase().includes(args[1].toLowerCase())) {
                                    // console.log(id, wrapper.players[id])
                                    this.wrapper.rickroll(id);
                                }
                            }
                        } else {
                            console.log("Missing argument for the Roll of Rick. Must include a player name")
                            this.displayHelp(data.playerChats.senderId)
                        }
                        break;
                    case "/verify":
                        console.log(args[1])
                        if (args[1]) {
                            if (isBase64(args[1])) {
                                console.log("verifying", args[1], "...")
                                // TODO: Send the verification code to actually be verified
                            } else {
                                this.displayHelp(data.playerChats.senderId)
                            }
                        } else {
                            this.displayHelp(data.playerChats.senderId)
                        }
                        break;
                    case "/help":
                        this.displayHelp(data.playerChats.senderId)
                        break;
                    default:
                        "Invalid Input"
                        break;
                }
            }
        })
    }
}