import {GATHER_API_KEY, GATHER_MAP_ID, GATHER_SPACE_ID} from "./api-key";
import {Game} from "@gathertown/gather-game-client";
import {Mewmba} from "./mewmba";
import {Player} from "@gathertown/gather-game-common";
import {randomInt} from "crypto";
import {RandomColor} from "./json-data";
import {GatherWrapper} from "./gatherwrapper";
import {FlowerVerifier} from "./flower-verifier";

global.WebSocket = require("isomorphic-ws");

// gather game client setup
const game = new Game(() => Promise.resolve({apiKey: GATHER_API_KEY}));
game.connect(GATHER_SPACE_ID);
const myWrapper = new GatherWrapper(game)

function subscribeToMapSetObjects() {
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
}

type TrapCallback = (player: Player, id: string) => void;

function setJoinTrap(playerName: string, delay: number, callback: TrapCallback) {
    game.subscribeToEvent("playerJoins", (data, context) => {
        let t1 = setTimeout(async () => {
            const player = game.getPlayer(context.playerId!)
            if (player.name.toLowerCase().includes(playerName.toLowerCase())) {
                clearTimeout(t1);
                callback(player, context.playerId!);
            }
        }, delay);
    });
}

// game.subscribeToConnection(connected => console.log("connected?", connected));
// subscribeToMapSetObjects();
// game.subscribeToEvent("playerChats", (data, context) => {
//     console.log(data, context)
// })
// game.subscribeToEvent("playerInteracts", (data, context) => {
//     console.log(data, context)
// })

function setRickRollTrap(playerName: string) {
    setJoinTrap(playerName, 3000, (player, id) => {
        myWrapper.rickroll(id)
    })
}

// setRickRollTrap("4113")

function mewmbaHarassTheIntern(mewmbaName: string, playerName: string) {
    setJoinTrap(playerName, 1000, (player, id) => {
        const mewmba = myWrapper.getMewmbaByName(mewmbaName);
        // mewmba.chasePlayer(playerName);
        myWrapper.createNeonLight(1, 1, "violet")
    })
}

// mewmbaHarassTheIntern("4113", "Michael Black")

function mewmbaSetUpDanceParty(mewmbaName: string, playerName: string) {
    setJoinTrap(playerName, 1000, (player, id) => {
        const mewmba = myWrapper.getMewmbaByName(mewmbaName);
        // Range: (36,10) -> (45,20)
        mewmba.routeToPoint({x: 36, y: 10})
        myWrapper.createNeonLight(randomInt(36, 45), randomInt(10, 20), RandomColor())
    })
}

function printCoffeeCupImage(x: number, y: number, text: string) {
    const {fonts, renderPixels} = require('js-pixel-fonts');
    const pixels = renderPixels(text, fonts.sevenPlus);
    // Iterate through the pixels and add all the coffee cups
    const pixelScale = 4
    let index = 1;
    // TODO - Fix the rate limiter
    for (let yp = 0; yp < pixels.length; yp++) {
        for (let xp = 0; xp < pixels[yp].length; xp++) {
            if (pixels[yp][xp] === 0) continue;
            // Fractional scaling cups
            let t1 = setTimeout(() => {
                let xc = (x + xp / pixelScale)
                let yc = (y + yp / pixelScale)
                myWrapper.createCoffee(xc, yc)
                clearTimeout(t1);
            }, 1000 * index)
            index++;
        }
    }
}

// printCoffeeCupImage(48, 7, `Hi ${"Scott"}`)

// mewmbaSetUpDanceParty("phillis", "phillis")

function mewmbaCleanupCoffee(mewmbaName: string, playerName: string) {
    setJoinTrap(playerName, 1000, (player, id) => {
        const mewmba = myWrapper.getMewmbaByName(mewmbaName);
        const coffee = myWrapper.findCoffee()
        mewmba.cleanupCoffee(coffee)
    })
}

mewmbaCleanupCoffee("4113", "phillis")
// roombaChasePlayer("4113", "4113")
let flower = new FlowerVerifier();
flower.verifyProof("eNqdVVuTmkgYfc+vmJo8JhnlJmBVqiIgOiqOdwa3tlJN02CrXOwLAqn89yCjM5Psvuw+QBVwvq9Pn3M++seHu7t7TCkHCUQWYOi+e3cvtkXxS1v8ImgrUeyKna4sP6iKrksdbXv/+VIBCQpQwjA4LuEOxaCu+qt+f3f3o7lfegaXTjvGMtpttWiDemAEJxTDB3hMedD6/j1AIeBH1qovAmCaHiOOKPNBEKFmnaYTK7OG1YimyctqG3DEAWApEduCdt/gftb3vz/fNoPIpSDAQfeAym6lrKDV8w5RWcwQnfLUFXVSpDOjtMZyUc7jpe6PRuqss9HA4EQmfO5UchC6gy3WNxOXulX/2TQXVejbZnKe7nbqyoXjrbaV++uxKu/n0eLUM+io7A3D5bjqb/UtdIUt80KJRcZqh3pDYzJEOZvL6XnOfWsh6xqaxaI0Xmi5G+8PCA1HNHC4sRxHARskaKTKnjfwJCnJTuM5sGI1idfli/bfYJowVLBXzV9VPp/PD2fpISVR66JM680l2sqFq6JvaAkHDdb3/+3zf7esdSP26sW7mDDAOK0pvwTknqA8hYDhNJlgysxX3MU3TpLuddnuG+4LQVENJWVXTn1jPz0p0WHAc8LTDh7pHr7x/73zYxKg4tJUun2/xWnxG66OfPvK8Yp7CfD/4/JRumjw8yWPr304rwMp6W3JlwNNUnVFVsO2HioIQAFqbUkT6+d/zBf39wiyN+VqU3AjE0i+AwhTnrBvqABxdkQPMI1v9GF6TJspiAhCye1tAuJm87IgvKN4leSapg0iOMTAP6J3tlzr1xfXzdr1wcV1oxnUV7czkqbhG9HmccZJltJmTUApIhf1HMR2aXBr2cDqieYNKLVgpoOJGKyfVOfJfpTanfZQiJ3OqWOpU5mFumIYIHa8/dYGus3xE+c2f8Ka0jOHuhlNqoOtKPVoBt4jk2dzEJU94pQS38Ng9kn91Fbjc7V8Hi8qOBsp9u5JcbwAHP32Y+A+AS1cDVJRr/hxbc3yvhpXizNTcfT1641t3ojzkoLrPv740/Sp2Gd27g71TPPPUhD3LKSURUEp0J5JXsVKv1oHq95YUHKfdfSDtSiZtQkMGQ3FeLqcSLPMIctDTgZVtnXkoeEswTJcE7rIJYnusBHWhWkubhdu2LHN6OANpk51KnMsEycGp5G59oc81px4BGenldixo61BO+JS2y+yTDhMRWruBMvwEJR6/iKbmms+WkXFQsAjm+wMq3gGH6u1qY557C0OqynEG0nnBE8kQVIMz8G7vb82dSoPrawgh61OYElUuRNvtNKd9bK0DKeqIKQTa7/RTvnALUpzoyBWDGQXemwdmpv1ajgZk10xoWfxNLQPeh9DpWOHwFXxTA5sGmfwsMLZa5oJqs+m4M/DSeoq7a50PZTezbbhU+NIlzhK6okm6DLcTdo//PwFAlMxBQ=='")
// flower.verifyProof("eNqdVNmOm0gUfc9XtDqPmbTNYhZLkWLAS+MlGAwERqMIimKxzeKqAgNR/n0wbttJlIfRvJQEdc+pc7fz/d3T03OCcellACoegc/jp2d6SNMfh/RHStjR9Jjmxiz7wo9EkeEE9/mvCwIgGMCMJN7RADFMvQ71d/f/6el7f144gwtTTEiBx4MB7qNeCEoynIAXcMzLYPDtWwBDrzySQVRCTHwviGBP3xOQpujFqDjPro9Y3jEJPJIjekgJz33cj+78p1d0fa9E2bgsk2DMiEPGZwOB4cURy4dDMRxBD1BAGDIC3X1f07gkDtEFGHSYA2zG7WgHlIlziJpag3hT5jYtojrXpEZZsnWzTQ3RV1Ve4yzBm5/QqtyuWzYI7bmbiNbKxnY7/SrLehv6Mzk7b+KY39lg6QouOzWXPLvfRvppImG1mSxCY9lOXdEFNuUSJ2RIJO1iOFlIqwWsyJbNz9vSV3RWFKCW0sxSFyo73R8gXKg4WJeSsYwCMs+gyrOOM3cYJitOy62npHyWms01wQLledjld23LvaaSj6UjNpIo80iJYNfv4Vvhr4iu0mUfGBf1wBit8tdWi7gviFpOVdcjk6lwVqfKmckMLdha3l7S5S/0xADFVDBev0B3a4hIW+7q2Fybw5Arc9+2mEgSwXCP2gQIp1jKHH7fFlspLZWZpGb8FngqW746p9ocwGFIrQ0jH55xhJhJ8MH/kCkz9gQsbptp3PnTp1/UaiUqctzr9TCGiCR5toYkzoNbWAVREibA++nmt55PMT0ls8peiIXgn5kgnShw1NQ1xp7wFVVtOpq2ZrCbLKlR5RNOPCh6QxQrkFi4oNONsWK0Yo2MQ4XmbeGu2YW0NjwjNBHWK4bBcSKFHTCvaFe3Q24mRwdnvlm3p6ZKWLROvZMqm/6iTIV1qgLttKO5WeRKmKMNYa8XBXXY0FiOKUVyIGAmvl5sZLNUd1GtU4k6Q7Gk1F+9960p88sydfTDbgMSixFLlKwYihlJzjqJ974pi5hdKEWNDq6IQIN4lkstobG1SZE34YanqHyl7C3hVM3tupGtEST1nLWBQ8xQtszdYrVEcb3CZ/q0mB3EaQJG3Cz0bD7R2GCG0wIcdklxK3vnEp2jBL9bCjNm6THDu5cV/tGP6dtcXi3k2eq75flHKN9t5kY5vziF1DvFffV/MqPS30NAHgOfeWk/FyxFMXdV+THvdz5CEGa3v52/JMd+hLJvHgB5mZHPsPbS4ghfQJ4+tH4GeUZgTR56byZ3Pp9fzsxLjqLBxaEGD114UFG3h+7RTBL0sb7/p+v/7JiDm54/1YN0+40f5XiY5BvvGMEqv+7FRwSjBBPUjNncl/ab0yg6zMsKlTmXqKKTvL8X8IFZdYCfevS/uf/M/JoFsL6Q3l+++Zf+S9zFvt4yvXTp3Y9/AalrJwU=")
// flower.verifyProof("eNqVVF2zmkgQfc+vuGUeN7nKhwpWpSoiKgHlKiJc2NpK8THgqDA4Hwim8t8X9ap3s3nYfZzp02e6+/ScHx+enloRBjHIKQz2KxZuQURbg6cfTaAJ5UEGmlNL5Dih9el6B7IA7s+XQf49iCLEcvoVVEFW7MFzhLIbLEJ7hM+wFAOQt5rLn+dIi9bFmfLPK8oBGCYwCPdgdK/ixjBlgFAliFNwzv7rkl1ghJJHfW9kLSUkyp6sYJoHlGHAd/jOjaW8vBAFFKJ8DugGxeeEGMaDHagHp64djQk/ppPS1eRCCo9CnA1V0K2ripBAesXlKeuOT+vYHhpctwxpT96pVk1VJ1ZEoPGZuZoJi2KOV7sST0+FPxc1Zb4KVskaE6sUBLKBStIkopL3LTfpTUbpzpua89OhLqGI51lw0EfrUGOZNM/0aHGw+d4k9RXS41fS1ioKbmfyZLThVMUDkTAMrcIcrZlup5XFQX2CN4pavQYfT+tR32CZZ+1sM4KOIDMMZwIndBVvDjfbcD2SiaipRYV3voyjGvfFXuZItbsYFqhOzD7HoZm6daRDOXWreuR0Aa2moht5dJ2MnLWtzQy8qWbkyB+0yU4ew6jbmySB24cLMZ6QrIh2Nizu8mMQUHCZdaMG/7nDf+YkmxcGnDwQef8Gu+i5YLhA5CJkQAjA76R6D3OCPbuAYHeXFi7/aqD1uJy3WTH3OtFRYVCE30JTg9YBbNj+xfIp3p6H5uv2t+WkdJxl7Qiqbat2p90DurEUTWpaM4chI1NcJrbdjhHYL8V8Rk1wHKHILEIvPZFEq/ELszHSetpLUEm1Q4bjoflKWP6HxwzbIbNgvfzy5bHkkBAG8K+Lpg69XVpXC0BMhlxexhVaKLVqiFW9zFZyqOv9Rc+RgukBz9hyfhLjxJ36UHZmLnFP49fRyDol4WSUH83Npm+7keFLvjheG31xu0ytw1Ahej3UkpVxGvuyH7mcT71EoKlib8BQU2YaKOlSRMclC1VLlCWwyHjBsKTSzbY7ADSdxHOmrIw0ptMc6H3R86aeIOTFwVgGatbPs3XdujZ4UZbhfMBY06Egd4RQjCWhL3fFftKRky4IIi6SOoLEN+dr0jujiTaNjdxt4Pqb3/1nnaD8imlEh3FAEeY7nPS2Dvf3N5QWZNBukwv0mWKYExg9R3vE4vb37zFIAran7fRsJOHNSBqN7nZy1inII6A2u/rrqvIDvjcQxed+V5aFnuT/qwfaeA15eBEGJbrazAwS+i2PQXWmvPvmrTfrH7izVb0xffodzztbfBv4W5eDB+4zBmkDxfVARKGyNQ/ddDdlJWaoB3XZgzfmh2j/n+Oj8NjurxHKKajow8ZvQhyPx+ej8Ixw2j7r1X5Mi7RL7lbHHS3A+IINw9+F/7Oq7Vs9Z10//PwbT0YpHg==")
// flower.verifyProof("eNqdVWuPokgU/T6/ouN87J1W3mAyyQg+aB8ERUXcbCYFFFjKs6pAcDL/fZBu7d7ObDa7H6vuuXXPuede+PHp4aGT4TQNOv2HH83hdjQLnKUENrcdQAjEFKXJAtJD6nf+eIGVEKMAeeBdpAH7yO+fYN2/CGtvRNgRHZe2rmSye+b8eDCEQl1VhAB5h8tLLIwuG389mDFC6VJROQ1XNR1ufZWHOhsb1pwzswW2TiWeXLL9gtfVhQWsYIPJquQ4ckBq0CSmJbtf2YE41sKTMzEWl7wuEY8XMcin2sbVi1hexFPPzNesOA73KhFZSz6usow5GSzRDsxQdaDHDdxVZmibYroOqxWDpmN8UIfVDny+bDRpVsTO6rQ2PLTllAKjOcdwguos0OHobjSF8Powq/Bpr2CvxhIvxlu5ts1BltaBITFMOh8et3JeTuyq1rYCpNWEtz2HbgJtu1nr8xk+VHNyZnN9fFJGyBPEcQBsCZm8PyZx5p3WKLu1ndZZ64rqEjUiFgoTQAsM2R7bu0E8DAGFrR3NNfulx35h5DXL9RmxL/T2N1jr8xZERfte9mw+w+4GrFHeM/M53IHuxkzMmTqp4MnmEpUCaSSH9XQwCALFYsVnaudSoGghe7xAMLfQbCzZ6aW2iwk9oHCOokwM1lz5uLtsRjk9ekZx2MPxfmnoxqDn9hYgshztUdsVj7kgqNZOErG+i5fO4DGmNTPRiVMvv37tNGR/Xhl3ECEFSDw4bMR91Mb2WbHP80+SoCicKL9ovPXqzxe923ZggRtBDUMfJhSB6NaLSQEJVYEfwmu9v9ps746yCvcIPfq2IgbyTgmIWxrzFMP4AWWkiB/8NErx7c1xEUXGv4FGMUBRu2XJd+B5aZHQb7ACcRbBJy+NbzCtzbnaDrAHozQBt4iJIWlYtmv4z9XuTXwnqskpyJsm1A5MgZM+xSghyOtjWKYv+/0FwxARius+n7rq0ciF8DQpSlykIpoqDvrMfRzP1T133iRep/O13isO/y3+nPiwuqZxv4+/M+x/c3zrwTcvTSis6NtoHCjNSL/bPZ/PT2fuKcVhl+0xcvetW6RbMjdudzSH/Bbrur8LE+8AY/D0yvTJi9LC737/7sMAFBHthteRc68j173xuY/emxdF0XxQOaXHubwvc5Ii8FLQUwIBAo/x5B4ns82589HatvJd3ovB92f/M79XYe/cnZI0eSnSfD+QD2iKr/3qtLifbzKajYX4429hOHBOYV2ZkBhFarMKrlJTrYczvqqXsaW406lkilsZTHI8L5aLC+8H9mSPlO3cJvZltNO01SVwx1pyNg4HaW17s72850ebmcQfl+EqH6hkWg/0wJpdRntl79nMnjoBR0N1fYADXZ3rsKRLPj0vC3e44hUZmjHLzVZyacfHE4T6lPiLQrVmoU8nCZxKvONMHI5Lsny2BMNYSuJN3fn08xctwUnV")
// flower.verifyProof("eNqdVW2PokgQ/n6/YuJ+vRnlHUw2WQGVEXEU31Yulw00DTTIi90Ngpv974eMzuxNNtncfSGprqefqnqquvj+x8ND7wvIMwpr2hs+/NXa7UlEaUGG/f75fH46c085DvvsgJH7AEMfZhS5R9KvmN6fH9Ac8jus5/3KTUAEU/eJYpQRBJ7AMS/9/rdvPgzc8kj7YQkJffRcP4T9e0Itwd9Xlt574HXH8pbq9+7bImhTwPa0NyN59orZuUfkuzTH19RvybRA5F9h/z2pXkfw4y0lREgJ8ZXLR/4wgc3wImyAPjokYVMvIVmU+Z5VcJ0v1UY3+bpZpWvFm82kpbiT3ekJz8uVdeH9YD91kLKb78n+Mv6qafYl8CZadl5EkbTZA9ORHX68NSU+XoX2aaSSWTMygrV5GTuKA/aMQw8BR0N1E8GRoc4NWNEVn59XpafbvCLDZcpypi1X+zROIDRmxLdKdW2GPp1mcCbxh8P0wHFZcTJXrp5KWbpteh81py4tSVvqq9pvWtuwyoFLUZ7NEaHsgB3ckLfO43/5tTe+690SZ8Ob6sN33COGYQvFzZDPPTVenIQwmZYVLnMRzZQDujO/NvH/cXzifp3fc+bD+krLXVv946MGpRdDQN9FWCCQZG7aCTHPMUwfUEHK9MHPjzm+R5iUx+PidyCtM1qE6mIAj3nm3j1LDEkbvkvxtzTj1EWdtG72zQUgLzP6BdZuWhzhE8jT96IKnOfBeyGduSxxkZMugEsIxNeIFqRR7t/pK4hRgF7lunk+zP6YsGM6qfaGUsjemfPTkQ6Fpq4JceWvuLqkwviy9TcjkxEqj4pKotsN1Xe+ykODTRfrObcsLLxOKjy9FI7FG6q1dtfBFhO74jgSITVoL+YV69j7QJxoYXKYLqzLqakQj63UPc20rWeUqWylM7A8bVhxEjoqEdm1HNtFwSQLlmgRo6sHCLiRZxcLbVvONmFtM2g2wZGq11/dT5etJpllerCTzQKgHaeUGM05hhPUg4Wi2NtqCuENvahx4igYNFjixXQnN/vlqMibYCExTD7X4518qqb7utF2AqT1lN+DA90G2m67MeYmjuo5ObMnY5IoYwQEcRK4ewkteX9C0gIkG1TcZb+/NdUj6pGsUZi1LwzD62O7Q9ohdSns2tEes48D9pGRNyw3ZLghLzp3WNfndimWHV+uHsLlKkakNMXYj15ki6mU593GzAQPISk6OzZiJMHhV7U1pTVi9ERmJySGR26y3qSGMRLToywqlmJZ53ATvwzM7QsqYAlq298JmUPrbfT8IsbGJNpxY11jTbMG8oQYdkRlOWpXlnFQp7EUI+QkW/Kc8FM8+vz5fUxvld9+Sbtu/FzvCH/aI7fKptctrd6X9Pt6djMA9Vaaj8qwQ1Yc8vyTJCgKJ8qvCv20U8qynWpOGXAe78ucpAi8FAyUQIAuYIA84GS2tXt//PgHH6RJ4g==")
// flower.verifyProof("eNrdVFlzqkgU/isp7mMSkUVBq27VFY0aQQdxITA1datpGmwFGrsbEVP57wNmm8zyMPM4T1B9zrf0dw48Cz8gyTg6c6H/q7DjPGd9USzLslUqLUJjUW5LuggpClHGMUiYeJKEu89GBYfXtiD4U4XBHUpBi1OcMQxbMCFFKP78GaIIFAkX4wIxHoAwRuK7/m93Aq9y1PjYIoojDIIEDT+Ua+5JAzIaUNP8aWp11aqBzwIOhf6/9yC8SwszRrJXui1IcAg4oU0CwstXwSLYI1hH9iyMiyRZgLTBWoSi9AbnrEhvQpIQWtMuMDxk/1weXp99wQAUooRkoD57SAFO6jOQ/QQQkiLjP9AZpHmCWpCkdYNNEat9AI5J9ia9rm9yc31/uRMwYwXIIBoB3tTktizft+V7SV/Lcr8j92Wlpak9pStLfs12TaygWb8ocNhHUbcdtAOIdABV2IG6pIaSJMndNoAA6B3hSwy1h4I1KXyQvGXdp+hE4NXhPUUxZpxWfZUExn5x7MSHSXGiBeniWc/D37TP9J0PlFVDauPtN4k7gX4pPWYhOtcA7S+VPyzMf3X0niFqJhPWoRxQ1b901nA08A5xdbYRWxTElXv0TGyjGpnquVqmq14wm2l2d6uDyZFaxXJ+UcPInfi4t7Vc5l4enoZD5xIF42FWLnY7be1C09d99WFjaup+GTvHgcFm1WAarczLg9/zoSv53IsUHhvrHRpMDWuKTnypknJZBCNH7enITmXFdPSTm+4PCE1nLJwXxsqMQz7J0ExTPW/iKUqWH80lGKValm6qOrGcEhI1Y3uL3QiYkbAVjrM6bIqa3F/nXC9Q+LcbpPrvNHZBc8IaFsAYok2+c8R3JHxvqL+joinH5+XtQroN4XHzyyOWckINx5otn9DYAa6YL8jwzN3sUEn+vnxcV6vMysku89VAT592g9vBaKkwVcTlbTdEetpxt8ngqeyN/ZnVnrZLXS/YqhtGVbR3dtyrUnKR/UdblObc9NAATrQ9UBU8Vjw0TXePohMid3McDL5/r32err+b1+V4M/8/HPy3y2aomb1uMQ7Mzb6rZ1nX0Mo1mB+5N17M/bXp2HMwcUqZ79RRDsfTPLIty65OW1djMqHSdnTxNDrfrsLhfk07uNuBe3yyGFOV0TE2NbtaOSeZ6UpmHydRZ+EMJ+bqIbatxUIfOqVUTFVvUggvL78Dbh8w9g==")
