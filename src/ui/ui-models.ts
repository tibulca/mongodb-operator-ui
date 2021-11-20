import { K8SKind, MongoDBKind } from "../core/enums";
import { Context, K8SResourceWithActions } from "../core/models";
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
    contexts: Context[];
  };
};

export type K8SResourceUIModel = K8SResourceWithActions & {
  ui: {
    location: {
      x: number;
      y: number;
    };
  };
};

export type MongodbDeploymentUIModel = {
  k8sResources: K8SResourceUIModel[];
};
