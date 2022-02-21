import { AccountProfile, AccountService, CredentialService, WalletService, IssueFromTemplateRequest } from "@trinsic/trinsic";
import { loadMewmbaProfile, loadNewProfile } from "./common";
import { readFileSync } from 'fs';
import { deflateSync } from 'zlib';
import { resolve } from 'path';

const GUEST_BADGE_TEMPLATE_ID = "urn:template:__default:mewmbaguestbadge";

export class GuestBadgeIssuer {

    getJsonLdFile(filename: string) {
        return resolve(__dirname, "..", "..", "jsonld", filename + ".jsonld");
    }

    proofRequestFrame: JSON = JSON.parse(readFileSync(resolve(this.getJsonLdFile("guest-badge-frame")), "utf8"));

    encodeProofDocument(proofDocument: string) {
        let compressed = deflateSync(JSON.stringify(proofDocument));
        let encoded = Buffer.from(compressed).toString("base64");
        return encoded;
    }

    async issueProofFromTemplate(name: string, email: string, color: string) {
        let credential_values = JSON.stringify({
            name: name,
            email: email,
            color: color
        });
        let req = new IssueFromTemplateRequest().setTemplateId(GUEST_BADGE_TEMPLATE_ID)
            .setValuesJson(credential_values);

        let mewmba = await loadMewmbaProfile();
        let credentialService = new CredentialService({profile: mewmba});
        let credential = await credentialService.issueFromTemplate(req);

        let guest = await loadNewProfile()
        let walletService = new WalletService({profile: guest});
        let itemId = await walletService.insertItem(JSON.parse(credential));
        credentialService.updateActiveProfile(guest);
        let proof = await credentialService.createProof(itemId, this.proofRequestFrame);
        console.log('[issueProofFromTemplate] proof: ' + JSON.stringify(proof));

        // sanity-check verification will work since mewmba is both issuer and verifier
        credentialService.updateActiveProfile(mewmba);
        let isVerified = await credentialService.verifyProof(proof);
        console.log("[issueProofFromTemplate] isVerified: " + isVerified);
        return proof;

    }

}