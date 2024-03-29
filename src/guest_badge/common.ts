import { existsSync, readFileSync, writeFileSync } from "fs";
import { deflateSync } from "zlib";
import {TrinsicService} from "@trinsic/trinsic";

export function storeProfile(profile: string, filename: string) {
  writeFileSync(filename, profile);
}

export async function loadNewProfile(): Promise<string> {
  const trinsic = new TrinsicService();
  const wallet = await trinsic.wallet().createWallet({});
  return wallet.authToken ?? "";
}

export async function loadMewmbaProfile(): Promise<string> {
  // load mewmba's profile from disk if available, otherwise create it.

  const filename = "mewmba.bin";
  if (existsSync(filename)) {
    return readFileSync(filename).toString();
  } else {
    const profile = await loadNewProfile();
    storeProfile(profile, filename);
    return profile;
  }
}

export function encodeProofDocument(proofDocument: string) {
  const compressed = deflateSync(JSON.stringify(proofDocument), { level: 9 });
  return Buffer.from(compressed).toString("base64");
}
