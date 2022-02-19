import { AccountProfile, CredentialService, WalletService, IssueFromTemplateRequest } from "@trinsic/trinsic";
import { loadProfile } from "./common";
import { readFileSync } from 'fs';
import { resolve } from 'path';

export class GuestBadgeIssuer {

    getJsonLdFile(filename: string) {
        return resolve(__dirname, "..", "..", "jsonld", filename + ".jsonld");
    }

    proofRequestFrame: JSON = JSON.parse(readFileSync(resolve(this.getJsonLdFile("guest-badge-frame")), "utf8"));
    unsignedCredential: JSON = JSON.parse(readFileSync(resolve(this.getJsonLdFile("guest-badge-unsigned-credential")), "utf8"));

    async issueProofFromTemplate(name: string, email: string, color: string, profile: AccountProfile) {
        let credential_values = JSON.stringify({
            name: name,
            email: email,
            color: color
        });
        let id = "urn:template:__default:mewmbaguestbadge";
        let req = new IssueFromTemplateRequest().setTemplateId(id).setValuesJson(credential_values);

        let walletService = new WalletService({profile: profile});
        // TODO: use mewmba's profile here
        let credentialService = new CredentialService({profile: profile});

        let credential = await credentialService.issueFromTemplate(req);
        let itemId = await walletService.insertItem(JSON.parse(credential));
        let proof = await credentialService.createProof(itemId, this.proofRequestFrame);
        let isVerified = await credentialService.verifyProof(proof);
        console.log("[issueProofFromTemplate] isVerified: " + isVerified);
        return proof;

    }

    async issueProof(profile: AccountProfile) {
        let walletService = new WalletService({profile: profile});
        // TODO: use mewmba's profile here
        let credentialService = new CredentialService({profile: profile});

        let proofRequestJson = this.proofRequestFrame;
        let credentialJson = this.unsignedCredential;
        let credential = await credentialService.issueCredential(credentialJson);
        let itemId = await walletService.insertItem(credential);

        let proof = await credentialService.createProof(itemId, proofRequestJson);
        let isVerified = await credentialService.verifyProof(proof);
        console.log("[issueProof] isVerified: " + isVerified);
        return proof;
    }

}