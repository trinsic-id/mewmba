import { AccountService, AccountProfile } from "@trinsic/trinsic";
import {writeFileSync, readFileSync, existsSync } from 'fs';


export function storeProfile(profile: AccountProfile, alias: string = "mewmba") {
    let file = alias + ".bin";
    writeFileSync(file, profile.serializeBinary());
}

export async function loadProfile(alias: string = "mewmba") {
    let file = alias + ".bin";
    if (existsSync(file)) {
        return AccountProfile.deserializeBinary(readFileSync(file));
    } else {
        let accountService = new AccountService({});
        let profile = (await accountService.signIn()).getProfile()!;
        // TODO: uncomment this, may depend on https://github.com/trinsic-id/sdk/issues/388#issuecomment-1045621852
        // storeProfile(profile, alias);
        return profile;
    }
}