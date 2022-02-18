
function createLight(x: number, y: number, colorName: string) {
    const lightId = "fQUHe3C1UWtUbqRu_SpNX"
    const {normal: normalUrl, highlighted: highlightUrl} = getLightImageByColor("red")
    return {
        "templateId": `NeonLightCircle - ${lightId}`,
        "_name": "Neon Light (Circle)",
        "x": x,
        "y": y,
        "offsetX": 2,
        "offsetY": 2.5,
        "color": "#ff0000",
        "orientation": 0,
        "normal": normalUrl,
        "highlighted": highlightUrl,
        "type": 0,
        "width": 1,
        "height": 2,
        "id": `NeonLightCircle - ${lightId}_{randomUUID()}`,
        "_tags": [],
        "properties": {}
    };
}

function getLightImageByColor(colorName: string): { normal: string, highlighted: string } {
    switch (colorName.toLowerCase()) {
        case "red":
            return {
                normal: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/0DLRQPWAwNGhEXNrHhEU4',
                highlighted: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/c65QdKn4fL00rw4WZieWS'
            }
        case "orange":
            return {
                normal: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/0-8Rb8J_0GNvdAmWQautc',
                highlighted: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/SWjr1sxNSuvgbZWhWARj4'
            }
        case "yellow":
            return {
                normal: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/uMGrU7RzdguwhPy2Ymbgq',
                highlighted: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/0U3DKZtDULP1k6iOVmBtl',
            }
        case "green":
            return {
                normal: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/dokURzA5f78OgpErfS_IY',
                highlighted: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/Bg812mDd0rXI6snQnPSpM',
            }
        case "blue":
            return {
                normal: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/eoDdfjyjoAfCtmt68r9Vo',
                highlighted: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/dcioEpDAxSm4nmawMYVKE',
            }
        case "indigo":
            return {
                normal: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/U0SD9Uem6x8aDD6m2RNjx',
                highlighted: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/Jw5D_nqjztp3-K8NvyQUe',
            }
        case "violet":
            return {
                normal: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/y5D5JZCMovB4kqhp-Y0KR',
                highlighted: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/Gsxo8q52CcGETfXr5pjOR',
            }
        case "pink":
            return {
                normal: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/sYUcwU1mFfb3IfUZDGbAn',
                highlighted: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/IUswzLsYYhTTSJeWY_yF4',
            }
    }
    throw Error
}