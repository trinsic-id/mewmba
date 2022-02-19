import { AccountProfile, CredentialService, WalletService, IssueFromTemplateRequest } from "@trinsic/trinsic";
import { readFileSync } from 'fs';
import { resolve } from 'path';

export class GuestBadgeIssuer {

    getJsonLdFile(filename: string) {
        return resolve(__dirname, "..", "..", "jsonld", filename + ".jsonld");
    }

    getProofRequestJson() {
        return JSON.parse(readFileSync(resolve(this.getJsonLdFile("guest-badge-frame")), "utf8"));
    }

    getUnsignedCredentialJson() {
        return JSON.parse(readFileSync(resolve(this.getJsonLdFile("guest-badge-unsigned-credential")), "utf8"));
    }

    async issueProofFromTemplate(name: string, email: string, color: string, profile: AccountProfile) {
        let proofRequestJson = this.getProofRequestJson();
        let credential_values = JSON.stringify({
            name: name,
            email: email,
            color: color
        });
        let id = "urn:template:__default:mewmbaguestbadge";
        let req = new IssueFromTemplateRequest().setTemplateId(id).setValuesJson(credential_values);

        let credentialService = new CredentialService({profile: profile});
        let walletService = new WalletService({profile: profile});

        let credential = await credentialService.issueFromTemplate(req);
        let itemId = await walletService.insertItem(JSON.parse(credential));
        const proof = await credentialService.createProof(itemId, proofRequestJson);
        console.log("proof: " + JSON.stringify(proof));
        let valid = await credentialService.verifyProof(proof);
        console.log("valid is: " + valid);
        return proof;

    }

    async issueProof(profile: AccountProfile) {
        let credentialService = new CredentialService({profile: profile});
        let walletService = new WalletService({profile: profile});

        let proofRequestJson = this.getProofRequestJson();
        let credentialJson = this.getUnsignedCredentialJson();
        let credential = await credentialService.issueCredential(credentialJson);
        let itemId = await walletService.insertItem(credential);

        let proof = await credentialService.createProof(itemId, proofRequestJson);
        let valid = await credentialService.verifyProof(proof);
        console.log("valid is: " + valid);
        return proof;
    }

}