import { K8SContext, ResourceWithActions } from "../core/models";
import { NetworkLayout, ResourceVisibility } from "./ui-enums";

export type Node = { id: string; label: string; group: string; shape?: string; image?: string };
export type Edge = { from: string; to: string; dashes?: number[] };

export type DisplaySettings = {
  SettingsVersion: number;
  Layout: NetworkLayout;
  Resources: { [kind: string]: ResourceVisibility };
  // this is just a map of the Resource field (maps are not correctly serialized when saved to local storage)
  ResourcesMap: Map<string, ResourceVisibility>;
  Context: {
    currentContext: string;
    contexts: K8SContext[];
  };
};

export type ResourceUIModel = ResourceWithActions & {
  ui: {
    location: {
      x: number;
      y: number;
    };
    font?: {
      size: number;
      bold: boolean;
    };
    size?: {
      height: number;
      width: number;
    };
  };
  isGroup: boolean;
};

export type MongodbDeploymentUIModel = {
  resources: ResourceUIModel[];
  resourceGroups: Map<string, ResourceUIModel[]>;
};
