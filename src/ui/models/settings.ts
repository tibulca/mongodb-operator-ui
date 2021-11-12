import { K8SKind, MongoDBKind } from "../../core/enums";

export type DisplaySettings = {
  HideResources: Set<K8SKind | MongoDBKind>;
};
