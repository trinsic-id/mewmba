import { AccountProfile, CredentialService, WalletService } from "@trinsic/trinsic";
import { inflateSync } from 'zlib';
import { loadMewmbaProfile } from './common';

export class GuestBadgeVerifier {

    getDecodedDocument(encodedProofDocument: string) {
        // decode a compressed/base64-encoded proof document
        let compressed = Buffer.from(encodedProofDocument, "base64");
        let document = JSON.parse(inflateSync(compressed).toString("utf-8"));
        return document;
    }

    async verifyGuestBadgeProof(proofDocument: string, encoded: boolean = false) {
        // Verify a MewmbaGuestBadge proof document. If `encoded` is true, interpret the
        // document as a compressed base64 string. Otherwise, interpret it as a JSON string.

        let proof: JSON;
        if (encoded) {
            proof = this.getDecodedDocument(proofDocument);
        } else {
            proof = JSON.parse(proofDocument);
        }

        let mewmba = await loadMewmbaProfile();
        const credentialService = new CredentialService({profile: mewmba});

        let isVerified = await credentialService.verifyProof(proof);
        console.log("[verify] isVerified: " + isVerified);
    }

}