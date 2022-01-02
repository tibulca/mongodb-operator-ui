import { HttpMethod, K8SKind, MongoDBKind, ResourceStatus } from "./enums";

export type DocumentedResult = {
  commands: {
    command: string;
    description?: string;
    output?: string;
  }[];
  docRefs: string[];
};

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
  status?: ResourceStatus;
  fullStatus: any;
  spec?: any;
  childs?: string[]; // e.g. containers
  labels?: { [key: string]: string };
};

export type MongodbDeployment = DocumentedResult & {
  clusters: {
    cluster: string;
    namespace: string;
    k8sResources: K8SResource[];
  }[];
};

export type NodeHttpAction = {
  group: string;
  label: string;
  description: string;
  url: string;
  httpMethod: HttpMethod;
};

export type ResourceWithActions = K8SResource & {
  actions?: NodeHttpAction[];
};

export type MongodbDeploymentWithActions = DocumentedResult & {
  clusters: {
    cluster: string;
    namespace: string;
    k8sResources: ResourceWithActions[];
  }[];
};

export type ResourceWithActionsAndDocs = ResourceWithActions & {
  docs: {
    description?: string;
    url?: string;
    labels: string[];
  };
};

export type MongodbDeploymentWithActionsAndDocs = DocumentedResult & {
  clusters: {
    cluster: string;
    namespace: string;
    k8sResources: ResourceWithActionsAndDocs[];
  }[];
};

export type K8SContext = {
  cluster: string;
  user: string;
  name: string;
  namespace?: string;
};
