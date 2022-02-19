import { AccountProfile, CredentialService, WalletService } from "@trinsic/trinsic";
import { inflateSync } from 'zlib';
import { loadProfile } from './common';

export class GuestBadgeVerifier {

    getDecodedDocument(encodedProofDocument: string) {
        // decode a compressed/base64-encoded proof document
        let zippedDocument = Buffer.from(encodedProofDocument, "base64");
        let document = inflateSync(zippedDocument).toString("utf-8");
        return document;
    }


    async fetchCredential(credential: string, profile: AccountProfile) {
        let walletService = new WalletService({profile: profile});
        // let query = "SELECT * from c WHERE c.type = 'MewmbaGuestBadge'"
        let results = await walletService.search();
        console.log("results: " + JSON.stringify(results));
    }

    async verifyProof(encodedProofDocument: string) {
        let document = this.getDecodedDocument(encodedProofDocument)
        console.log("got document: " + document);

        let mewmba = await loadProfile();
        const credentialService = new CredentialService({profile: mewmba});

        let isValid = await credentialService.verifyProof(document);
        console.log("Verify result: " + isValid);
    }

}