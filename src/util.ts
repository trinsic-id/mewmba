export function gatherApiKey(): string {
    if (process.env.GATHER_API_KEY)
        return process.env.GATHER_API_KEY
    const ApiKeys = require('../api-key')
    return ApiKeys.GATHER_API_KEY;
}

export function gatherMapId(): string {
    if (process.env.GATHER_MAP_ID)
        return process.env.GATHER_MAP_ID
    const ApiKeys = require('../api-key')
    return ApiKeys.GATHER_MAP_ID;
}

export function gatherSpaceId(): string {
    if (process.env.GATHER_SPACE_ID)
        return process.env.GATHER_SPACE_ID
    const ApiKeys = require('../api-key')
    return ApiKeys.GATHER_SPACE_ID;
}