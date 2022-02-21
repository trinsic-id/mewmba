import { AccountProfile, CredentialService, WalletService } from "@trinsic/trinsic";
import { inflateSync } from 'zlib';
import { loadMewmbaProfile } from './common';

export class GuestBadgeVerifier {

    getDecodedDocument(encodedProofDocument: string) {
        // decode a compressed/base64-encoded proof document
        let zippedDocument = Buffer.from(encodedProofDocument, "base64");
        let document = JSON.parse(inflateSync(zippedDocument).toString("utf-8"));
        return document;
    }

    async verifyProof(encodedProofDocument: string) {
        let document = this.getDecodedDocument(encodedProofDocument)
        let mewmba = await loadMewmbaProfile();
        const credentialService = new CredentialService({profile: mewmba});

        let isVerified = await credentialService.verifyProof(document);
        console.log("[verifyProof] isVerified: " + isVerified);
    }

}