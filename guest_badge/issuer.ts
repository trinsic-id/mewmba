import { AccountProfile, AccountService, CredentialService, WalletService, IssueFromTemplateRequest } from "@trinsic/trinsic";
import { loadMewmbaProfile, loadNewProfile, encodeProofDocument } from "./common";
import { readFileSync } from 'fs';
import { resolve } from 'path';

const GUEST_BADGE_TEMPLATE_ID = "urn:template:__default:mewmbaguestbadge";

export class GuestBadgeIssuer {

    getJsonLdFile(filename: string) {
        return resolve(__dirname, "..", "..", "jsonld", filename + ".jsonld");
    }

    proofRequestFrame: JSON = JSON.parse(readFileSync(resolve(this.getJsonLdFile("guest-badge-frame")), "utf8"));


    async issueGuestBadgeProof(name: string, email: string, color: string, encode: boolean = false) {
        // Issue a MewmbaGuestBadge proof document. If `encode` is true, return it as a compressed
        // base 64 string. Otherwise, return it as a JSON string.

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

        // sanity-check verification will work since mewmba is both issuer and verifier
        credentialService.updateActiveProfile(mewmba);
        let isVerified = await credentialService.verifyProof(proof);
        console.log("[issue] isVerified: " + isVerified);

        if (encode) {
            return encodeProofDocument(proof);
        } else {
            return JSON.stringify(proof);
        }

    }

}