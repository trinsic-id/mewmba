import {
  CreateProofRequest,
  CredentialService,
  InsertItemRequest,
  IssueFromTemplateRequest,
  TrinsicOptions,
  WalletService,
} from "@trinsic/trinsic";
import {
  encodeProofDocument,
  loadMewmbaProfile,
  loadNewProfile,
} from "./common";
import { readFileSync } from "fs";
import { resolve } from "path";

const GUEST_BADGE_TEMPLATE_ID = "urn:template:__default:mewmbaguestbadge";

export class GuestBadgeIssuer {
  proofRequestFrame: string = readFileSync(
    resolve(this.getJsonLdFile("guest-badge-frame"))
  ).toString();

  getJsonLdFile(filename: string) {
    return resolve(__dirname, "..", "..", "jsonld", filename + ".jsonld");
  }

  async issueGuestBadgeProof(
    name: string,
    email: string,
    color: string,
    encode = false
  ) {
    // Issue a MewmbaGuestBadge proof document. If `encode` is true, return it as a compressed
    // base 64 string. Otherwise, return it as a JSON string.

    const credential_values = JSON.stringify({
      name: name,
      email: email,
      color: color,
    });
    const req = IssueFromTemplateRequest.fromPartial({
      templateId: GUEST_BADGE_TEMPLATE_ID,
      valuesJson: credential_values,
    });

    const mewmba = await loadMewmbaProfile();
    const credentialService = new CredentialService(
        TrinsicOptions.fromPartial({ authToken: mewmba })
    );
    const credential = (await credentialService.issueFromTemplate(req))
      .documentJson;

    const guest = await loadNewProfile();
    const walletService = new WalletService(
        TrinsicOptions.fromPartial({ authToken: guest })
    );
    const itemId = (
      await walletService.insertItem(
        InsertItemRequest.fromPartial({ itemJson: credential })
      )
    ).itemId;
    credentialService.options.authToken = guest;
    const proof = (
      await credentialService.createProof(
        CreateProofRequest.fromPartial({
          revealDocumentJson: this.proofRequestFrame,
          itemId: itemId,
        })
      )
    ).proofDocumentJson;

    // sanity-check verification will work since mewmba is both issuer and verifier
    credentialService.options.authToken = mewmba;
    const isVerified = await credentialService.verifyProof({
      proofDocumentJson: proof,
    });
    console.log("[issue] isVerified: " + isVerified);

    if (encode) {
      return encodeProofDocument(proof ?? "");
    } else {
      return JSON.stringify(proof);
    }
  }
}
