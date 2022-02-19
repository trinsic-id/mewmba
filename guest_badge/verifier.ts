import { AccountProfile, CredentialService, WalletService } from "@trinsic/trinsic";
import { inflateSync } from 'zlib';
import { loadProfile } from './common';

export class GuestBadgeVerifier {

    getDecodedDocument(encodedProofDocument: string) {
        // decode a compressed/base64-encoded proof document
        let zippedDocument = Buffer.from(encodedProofDocument, "base64");
        let document = JSON.parse(inflateSync(zippedDocument).toString("utf-8"));
        return document;
    }

    async verifyProof(encodedProofDocument: string, profile: AccountProfile) {
        let document = this.getDecodedDocument(encodedProofDocument)
        let mewmba = await loadProfile();
        const credentialService = new CredentialService({profile: profile});

        let isVerified = await credentialService.verifyProof(document);
        console.log("[verifyProof] isVerified: " + isVerified);
    }

}