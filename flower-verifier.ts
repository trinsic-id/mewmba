import { CredentialService, AccountService, AccountProfile, WalletService, IssueFromTemplateRequest, TemplateService, TemplateField, CreateCredentialTemplateRequest} from "@trinsic/trinsic";
import { inflateSync } from 'zlib';
import {writeFileSync, readFileSync, existsSync, readFile } from 'fs';

export class FlowerVerifier {

    storeMewmbaAccount(account: AccountProfile) {
        writeFileSync("mewmba.bin", account.serializeBinary());
    }

    async loadMewmbaAccount() {
        if (existsSync("mewmba.bin")) {
            return AccountProfile.deserializeBinary(readFileSync("mewmba.bin"));
        } else {
            let accountService = new AccountService({});
            let mewmba = (await accountService.signIn()).getProfile()!;
            // TODO: uncomment this, depends on https://github.com/trinsic-id/sdk/issues/388#issuecomment-1045621852
            // this.storeMewmbaAccount(mewmba);
            return mewmba;
        }
    }

    getdecodedDocument(encodedProofDocument: string) {
        // decode a compressed/base64-encoded proof document
        let zippedDocument = Buffer.from(encodedProofDocument, 'base64');
        let document = inflateSync(zippedDocument).toString('utf-8');
        return document;
    }

    async issueProofFromTemplate(mewmba: AccountProfile, walletService: WalletService, credentialService: CredentialService) {
        const proofRequestJson = JSON.parse(readFileSync("guest-badge-proof-frame.jsonld", 'utf8'));
        
        let credential_values = JSON.stringify({
            color: "green",
            email: "4113@example.com",
            name: "4113"
        });

        let id = "urn:template:__default:mewmbaguestbadge";
        let req = new IssueFromTemplateRequest().setTemplateId(id).setValuesJson(credential_values);
        let credential = await credentialService.issueFromTemplate(req);
        let itemId = await walletService.insertItem(JSON.parse(credential));
        const proof = await credentialService.createProof(itemId, proofRequestJson);
        // console.log("got this proof: " + proof);
        return proof;

    }

    async issueProof(mewmba: AccountProfile, walletService: WalletService, credentialService: CredentialService) {
        const proofRequestJson = JSON.parse(readFileSync('guest-badge-proof-frame.jsonld', 'utf8'));
        console.log('proofrequestjson: ' + JSON.stringify(proofRequestJson));
        let credentialJson = JSON.parse(readFileSync('unsigned-credential.json', 'utf8'));
        let credential = await credentialService.issueCredential(credentialJson);
        let itemId = await walletService.insertItem(credential);
        let proof = await credentialService.createProof(itemId, proofRequestJson);
        console.log('got proof: ' + JSON.stringify(proof));
        let valid = await credentialService.verifyProof(proof);
        console.log('valid is: ' + valid);
    }

    async verifyProof(encodedProofDocument: string) {
        let document = this.getdecodedDocument(encodedProofDocument)
        console.log("got document: " + document);

        let mewmba = await this.loadMewmbaAccount();
        const walletService = new WalletService({profile: mewmba});
        const templateService = new TemplateService({profile: mewmba});
        const credentialService = new CredentialService({profile: mewmba});

        let proof = this.issueProof(mewmba, walletService, credentialService);
        let isValid = await credentialService.verifyProof(proof);
        console.log("Verify result: " + isValid);
    }

}