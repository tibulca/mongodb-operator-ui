import { K8SKind, MongoDBKind } from "../../core/enums";

export type DisplaySettings = {
  HideResources: (K8SKind | MongoDBKind)[];
};
