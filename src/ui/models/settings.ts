import { K8SKind, MongoDBKind } from "../../core/enums";
import { Context } from "../../core/models";

export enum ResourceDisplay {
  Show = "Show",
  ShowGrouped = "ShowGrouped",
  ShowOnlyIfReferenced = "ShowOnlyIfReferenced",
  Hide = "Hide",
}

export type DisplaySettings = {
  SettingsVersion: number;
  Resources: { [kind: string]: ResourceDisplay };
  // this is just a map of the Resource field (maps are not correctly serialized when saved to local storage)
  ResourcesMap: Map<string, ResourceDisplay>;
  Context: {
    currentContext: string;
    contexts: Context[];
  };
};
