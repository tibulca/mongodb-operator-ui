export type CRD = {
  name: string;
  crs: {
    name: string;
  }[];
};

export type K8SObject = {
  uid: string;
  name: string;
  kind: string;
  namespace?: string;
  ownerReference?: {
    // kind: string;
    // name: string;
    uid: string;
  };
  dependsOnUIDs?: string[];
  status?: string;
  spec?: any;
};

export type Pod = K8SObject & { kind: "Pod" };
export type Deployment = K8SObject & { kind: "Deployment" };
export type StatefulSet = K8SObject & { kind: "StatefulSet" };
export type CustomResource = K8SObject & {};
export type CustomResourceDefinition = K8SObject & { kind: "CustomResourceDefinition" };

export type MongodbDeployment = {
  // clusters: {
  //   name: string;
  //   isCentral?: boolean;
  // }[];
  // operator: {
  //   cluster: string;
  //   namespace: string;
  //   deployment: string;
  //   pod: string;
  // };
  // opsManager: {
  //   cluster: string;
  //   namespace: string;
  //   sts: string;
  //   pods: string[];
  // };
  // mongodb: {
  //   cluster: string;
  //   namespace: string;
  //   sts: string;
  //   pods: string[];
  // }[];
  k8sObjects: K8SObject[];
};
