export function gatherApiKey(): string {
  if (process.env.GATHER_API_KEY) return process.env.GATHER_API_KEY;
  const ApiKeys = require("../api-key");
  return ApiKeys.GATHER_API_KEY;
}

export function gatherMapId(): string {
  if (process.env.GATHER_MAP_ID) return process.env.GATHER_MAP_ID;
  const ApiKeys = require("../api-key");
  return ApiKeys.GATHER_MAP_ID;
}

export function gatherSpaceId(): string {
  if (process.env.GATHER_SPACE_ID) return process.env.GATHER_SPACE_ID;
  const ApiKeys = require("../api-key");
  return ApiKeys.GATHER_SPACE_ID;
}

export function slackOAuthToken(): string {
  if (process.env.SLACK_BOT_USER_OAUTH_TOKEN)
    return process.env.SLACK_BOT_USER_OAUTH_TOKEN;
  const ApiKeys = require("../api-key");
  return ApiKeys.SLACK_BOT_USER_OAUTH_TOKEN;
}

export function slackSocketToken(): string {
  if (process.env.SLACK_SOCKET_TOKEN) return process.env.SLACK_SOCKET_TOKEN;
  const ApiKeys = require("../api-key");
  return ApiKeys.SLACK_SOCKET_TOKEN;
}

export function githubPlatformToken(): string {
  if (process.env.API_GITHUB_PAT) return process.env.API_GITHUB_PAT;
  const ApiKeys = require("../api-key");
  return ApiKeys.API_GITHUB_PAT;
}
