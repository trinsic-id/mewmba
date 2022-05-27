import {
    AccountProfile,
    AccountService,
    CredentialService,
    WalletService,
    IssueFromTemplateRequest,
    ServiceOptions, InsertItemRequest, CreateProofRequest, VerifyProofRequest
} from "@trinsic/trinsic";
import { loadMewmbaProfile, loadNewProfile, encodeProofDocument } from "./common";
import { readFileSync } from 'fs';
import { resolve } from 'path';

const GUEST_BADGE_TEMPLATE_ID = "urn:template:__default:mewmbaguestbadge";

export class GuestBadgeIssuer {

    getJsonLdFile(filename: string) {
        return resolve(__dirname, "..", "..", "jsonld", filename + ".jsonld");
    }

    proofRequestFrame: string = readFileSync(resolve(this.getJsonLdFile("guest-badge-frame"))).toString();


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
        let credentialService = new CredentialService(new ServiceOptions().setAuthToken(mewmba));
        let credential = (await credentialService.issueFromTemplate(req)).getDocumentJson();

        let guest = await loadNewProfile()
        let walletService = new WalletService(new ServiceOptions().setAuthToken(guest));
        let itemId = (await walletService.insertItem(new InsertItemRequest().setItemJson(credential))).getItemId();
        credentialService.options.setAuthToken(guest);
        let proof = (await credentialService.createProof(new CreateProofRequest().setItemId(itemId).setRevealDocumentJson(this.proofRequestFrame))).getProofDocumentJson();

        // sanity-check verification will work since mewmba is both issuer and verifier
        credentialService.options.setAuthToken(mewmba);
        let isVerified = await credentialService.verifyProof(new VerifyProofRequest().setProofDocumentJson(proof));
        console.log("[issue] isVerified: " + isVerified);

        if (encode) {
            return encodeProofDocument(proof);
        } else {
            return JSON.stringify(proof);
        }

    }

}