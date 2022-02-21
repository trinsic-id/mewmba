import { AccountService, AccountProfile } from "@trinsic/trinsic";
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { deflateSync } from 'zlib';


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

export function encodeProofDocument(proofDocument: string) {
    let compressed = deflateSync(JSON.stringify(proofDocument), {level: 9});
    let encoded = Buffer.from(compressed).toString("base64");
    return encoded;
}