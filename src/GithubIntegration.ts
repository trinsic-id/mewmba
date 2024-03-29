import { request } from "@octokit/request";
import { githubPlatformToken } from "./util";

// TODO - Maybe other defaults
export async function createIssue(
  title: string,
  body: string,
  owner = "trinsic-id",
  repo = "server"
): Promise<string> {
  const result = await request("POST /repos/{owner}/{repo}/issues", {
    headers: {
      authorization: `token ${githubPlatformToken()}`,
    },
    owner: owner.trim(),
    repo: repo.trim(),
    title: title.trim(),
    body: body.trim(),
  });
  console.log(result);
  return result.data.html_url;
}
