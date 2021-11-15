import { K8SKind, MongoDBKind } from "../../core/enums";
import { Context } from "../../core/models";

export type DisplaySettings = {
  HideResources: (K8SKind | MongoDBKind)[];
  Context: {
    currentContext: string;
    contexts: Context[];
  };
};
