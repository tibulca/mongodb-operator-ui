export enum HttpMethod {
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Delete = "DELETE",
}

export enum HttpContentType {
  JSON = "application/json",
  TextFile = "text/plain",
}

export enum HttpHeader {
  ContentType = "content-type",
}

export enum HttpStatusCode {
  OK = 200,
  BadRequest = 400,
  NotImplemented = 501,
}

export enum K8SKind {
  Pod = "Pod",
  Deployment = "Deployment",
  ReplicaSet = "ReplicaSet",
  StatefulSet = "StatefulSet",
  Secret = "Secret",
  Service = "Service",
  ConfigMap = "ConfigMap",
  CustomResourceDefinition = "CustomResourceDefinition",
  PersistentVolumeClaim = "PersistentVolumeClaim",
  PersistentVolume = "PersistentVolume",
  Namespace = "Namespace",
  NA = "N/A",
}
export const K8SKindSet = new Set(Object.values(K8SKind));

export enum MongoDBKind {
  MongoDB = "MongoDB",
  MongoDBMultiCluster = "MongoDBMulti",
  MongoDBCommunity = "MongoDBCommunity",
  MongoDBUser = "MongoDBUser",
  MongoDBOpsManager = "MongoDBOpsManager",
  // not a resource type
  MongoDBOperator = "MongoDBOperator",
}
export const MongoDBKindSet = new Set(Object.values(MongoDBKind));

export enum MongoDBCRDGroup {
  Enterprise = "mongodb.com",
  Community = "mongodbcommunity.mongodb.com",
}
export const MongoDBCRDGroupSet = new Set(Object.values(MongoDBCRDGroup));

export enum MongoDbOperatorLabel {
  Enterprise = "mongodb-enterprise-operator",
  Community = "mongodb-kubernetes-operator",
}
export const MongoDbOperatorLabelSet = new Set(<string[]>Object.values(MongoDbOperatorLabel));

export enum ResourceStatus {
  Running = "Running",
  Pending = "Pending",
  Reconciling = "Reconciling",
  Completed = "Completed",
  Failed = "Failed",
  Terminating = "Terminating",
}
export const ResourceStatusSet = new Set(<string[]>Object.values(ResourceStatus));

export enum MongoDBOperator {
  Community = "Community",
  Enterprise = "Enterprise",
}
export const MongoDBOperatorSet = new Set(<string[]>Object.values(MongoDBOperator));

export enum ResourceLabel {
  Operator = "Operator",
  MongoDBReplicaSet = "MongoDB ReplicaSet",
  OpsManager = "OpsManager",
  BackupDaemon = "Backup Daemon",
  MongoDBResource = "MongoDBResource",
  MongoDBMultiCluster = "MongoDBMulti",
  MongoDBCommunityResource = "MongoDBCommunityResource",
  MongoDBUser = "MongoDBUser",
}
