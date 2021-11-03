import { HttpMethod, K8SKind } from "./enums";

export type CRD = {
  name: string;
  crs: {
    name: string;
  }[];
};

export type K8SObject = {
  uid: string;
  name: string;
  kind: K8SKind | string;
  namespace?: string;
  ownerReference?: {
    // kind: string;
    // name: string;
    uid: string;
  };
  dependsOnUIDs?: string[];
  status?: string;
  spec?: any;
  childs?: string[]; // e.g. containers
};

export type MongodbDeployment = {
  k8sObjects: K8SObject[];
};

export type K8SObjectWithActions = K8SObject & {
  actions?: {
    group: string;
    label: string;
    url: string;
    httpMethod: HttpMethod;
  }[];
};

export type MongodbDeploymentWithActions = {
  k8sObjects: K8SObjectWithActions[];
};

export type K8SObjectUIModel = K8SObjectWithActions & {
  ui: {
    location: {
      x: number;
      y: number;
    };
  };
};

export type MongodbDeploymentUIModel = {
  k8sObjects: K8SObjectUIModel[];
};
