import { AccountService, AccountProfile } from "@trinsic/trinsic";
import {writeFileSync, readFileSync, existsSync } from 'fs';


export function storeProfile(profile: AccountProfile, filename: string) {
    writeFileSync(filename, profile.serializeBinary());
}

export async function loadNewProfile() {
    let accountService = new AccountService({});
    return (await accountService.signIn()).getProfile()!;
}

export async function loadMewmbaProfile() {
    // load mewmba's profile from disk if available, otherwise create it.

    let filename = "mewmba.bin"
    if (existsSync(filename)) {
        return AccountProfile.deserializeBinary(readFileSync(filename));
    } else {
        let profile = await loadNewProfile();
        storeProfile(profile, filename);
        return profile;
    }
}