import { HttpMethod, K8SKind, MongoDBKind } from "./enums";

export type CRD = {
  name: string;
  crs: {
    name: string;
  }[];
};

export type K8SResource = {
  uid: string;
  name: string;
  kind: K8SKind | MongoDBKind;
  namespace?: string;
  creationTimestamp: number;
  ownerReference?: {
    kind: K8SKind | MongoDBKind;
    name: string;
    uid: string;
  };
  dependsOnUIDs?: string[];
  status?: string;
  fullStatus: any;
  spec?: any;
  childs?: string[]; // e.g. containers
  labels?: { [key: string]: string };
};

export type MongodbDeployment = {
  k8sResources: K8SResource[];
};

export type NodeHttpAction = {
  group: string;
  label: string;
  description: string;
  url: string;
  httpMethod: HttpMethod;
};

export type K8SResourceWithActions = K8SResource & {
  actions?: NodeHttpAction[];
};

export type MongodbDeploymentWithActions = {
  k8sResources: K8SResourceWithActions[];
};

export type Context = {
  cluster: string;
  user: string;
  name: string;
  namespace?: string;
};
