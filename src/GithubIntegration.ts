import { request } from "@octokit/request";
import {githubPlatformToken} from "./util";

// TODO - Maybe other defaults
export async function createIssue(
  title: string,
  body: string,
  owner: string = "trinsic-id",
  repo: string = "server"
): Promise<string> {
  const result = await request("POST /repos/{owner}/{repo}/issues", {
    headers: {
      authorization: `token ${githubPlatformToken()}`,
    },
    owner: owner,
    repo: repo,
    title: title,
    body: body,
  });
  console.log(result);
  return result.data.html_url;
}
