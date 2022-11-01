import { randomInt, randomUUID } from "crypto";
import { WireObject } from "@gathertown/gather-game-common/src/generated_DO_NOT_TOUCH/events";

type LightUrls = {
  normal: string;
  highlighted: string;
};

export function CreateLight(
  x: number,
  y: number,
  colorName: string
): WireObject {
  const lightId = "fQUHe3C1UWtUbqRu_SpNX";
  const { normal: normalUrl, highlighted: highlightUrl } =
    getLightImageByColor(colorName);
  return {
    templateId: `NeonLightCircle - ${lightId}`,
    _name: "Neon Light (Circle)",
    x: x,
    y: y,
    offsetX: 2,
    offsetY: 2.5,
    color: "#ff0000",
    orientation: 0,
    normal: normalUrl,
    highlighted: highlightUrl,
    type: 0,
    width: 1,
    height: 2,
    id: `NeonLightCircle - ${lightId}_{randomUUID()}`,
    _tags: [],
  };
}

export function CreateCoffeeCup(x: number, y: number): WireObject {
  return {
    _tags: ["flair", "decoration", "food", "eating", "office decor"],
    templateId: "ToGoCoffee - eFynd1wtJVeD5aLmLNtBk",
    _name: "To-Go Coffee",
    x: Math.floor(x),
    y: Math.floor(y),
    offsetX: 32 * (x - Math.floor(x)),
    offsetY: 32 * (y - Math.floor(y)),
    color: "#c4824e",
    orientation: 0,
    normal:
      "https://cdn.gather.town/v0/b/gather-town.appspot.com/o/internal-dashboard-upload%2FMF3MlC43S7RZrzux?alt=media&token=6dc635a5-0a8a-4aab-8a81-da1ee33aff21",
    highlighted:
      "https://cdn.gather.town/v0/b/gather-town.appspot.com/o/internal-dashboard-upload%2FdbPBZUNtHcRtKgo2?alt=media&token=0183a74a-b722-4f99-a193-ee865d919212",
    type: 0,
    width: 1,
    height: 1,
    id: `ToGoCoffee - eFynd1wtJVeD5aLmLNtBk_${randomUUID()}`,
  };
}

export function RandomColor(): string {
  const colors = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "indigo",
    "violet",
    "pink",
  ];
  return colors[randomInt(colors.length)];
}

function getLightImageByColor(colorName: string): LightUrls {
  switch (colorName.toLowerCase()) {
    case "violet":
      return {
        normal:
          "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/0DLRQPWAwNGhEXNrHhEU4",
        highlighted:
          "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/c65QdKn4fL00rw4WZieWS",
      };
    case "indigo":
      return {
        normal:
          "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/0-8Rb8J_0GNvdAmWQautc",
        highlighted:
          "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/SWjr1sxNSuvgbZWhWARj4",
      };
    case "blue":
      return {
        normal:
          "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/uMGrU7RzdguwhPy2Ymbgq",
        highlighted:
          "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/0U3DKZtDULP1k6iOVmBtl",
      };
    case "green":
      return {
        normal:
          "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/dokURzA5f78OgpErfS_IY",
        highlighted:
          "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/Bg812mDd0rXI6snQnPSpM",
      };
    case "pink":
      return {
        normal:
          "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/eoDdfjyjoAfCtmt68r9Vo",
        highlighted:
          "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/dcioEpDAxSm4nmawMYVKE",
      };
    case "orange":
      return {
        normal:
          "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/U0SD9Uem6x8aDD6m2RNjx",
        highlighted:
          "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/Jw5D_nqjztp3-K8NvyQUe",
      };
    case "yellow":
      return {
        normal:
          "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/y5D5JZCMovB4kqhp-Y0KR",
        highlighted:
          "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/Gsxo8q52CcGETfXr5pjOR",
      };
    case "red":
      return {
        normal:
          "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/sYUcwU1mFfb3IfUZDGbAn",
        highlighted:
          "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/internal-dashboard/images/IUswzLsYYhTTSJeWY_yF4",
      };
  }
  throw Error;
}
