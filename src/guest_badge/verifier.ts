import {CredentialService, ServiceOptions} from "@trinsic/trinsic";
import {inflateSync} from 'zlib';
import {loadMewmbaProfile} from './common';
import {debuglog} from "util";

export class GuestBadgeVerifier {
    logger = debuglog('GuestBadgeVerifier');

    getDecodedDocument(encodedProofDocument: string): string {
        // decode a compressed/base64-encoded proof document
        let compressed = Buffer.from(encodedProofDocument, "base64");
        return inflateSync(compressed).toString("utf-8")
    }

    async verifyGuestBadgeProof(proofDocument: string, encoded: boolean = false) {
        // Verify a MewmbaGuestBadge proof document. If `encoded` is true, interpret the
        // document as a compressed base64 string. Otherwise, interpret it as a JSON string.

        let proof: string = proofDocument;
        if (encoded) {
            proof = this.getDecodedDocument(proofDocument);
        } else {
        }

        let mewmba = await loadMewmbaProfile();
        const credentialService = new CredentialService(ServiceOptions.fromPartial({authToken: mewmba}));

        let isVerified = await credentialService.verifyProof({proofDocumentJson: proofDocument});
        this.logger("[verify] isVerified: " + isVerified);
    }

}