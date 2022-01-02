import { K8SKind, HttpMethod, MongoDBKind, ResourceLabel } from "../../core/enums";
import {
  K8SResource,
  MongodbDeploymentWithActions,
  MongodbDeploymentWithActionsAndDocs,
  ResourceWithActions,
  ResourceWithActionsAndDocs,
} from "../../core/models";
import { getMongodbDeploymentWithActions } from "./deploymentActions";

const URLs = {
  EnterpriseOperator: "https://docs.mongodb.com/kubernetes-operator/master/",
  CommunityOperator: "https://github.com/mongodb/mongodb-kubernetes-operator",
  OpsManager: "https://docs.opsmanager.mongodb.com/",
  OpsManagerResource: "https://docs.mongodb.com/kubernetes-operator/stable/reference/k8s-operator-om-specification/",
  MongoDBEnterpriseResource:
    "https://docs.mongodb.com/kubernetes-operator/stable/reference/k8s-operator-specification/",
};

const docProviders = new Map<K8SKind | MongoDBKind, (res: ResourceWithActions) => ResourceWithActionsAndDocs>([
  [
    K8SKind.Deployment,
    (res) => {
      return { ...res, docs: { labels: [] } };
    },
  ],
  [
    MongoDBKind.MongoDB,
    (res) => {
      return {
        ...res,
        docs: {
          description:
            "MongoDB Resource specs - used by the Operator to create a containerized MongoDB Enterprise deployment",
          url: URLs.MongoDBEnterpriseResource,
          labels: [ResourceLabel.MongoDBResource],
        },
      };
    },
  ],
  [
    MongoDBKind.MongoDBCommunity,
    (res) => {
      return {
        ...res,
        docs: {
          description:
            "MongoDB Community Resource specs - used by the Operator to create a containerized MongoDB deployment",
          url: URLs.CommunityOperator,
          labels: [ResourceLabel.MongoDBCommunityResource],
        },
      };
    },
  ],
  [
    MongoDBKind.MongoDBOpsManager,
    (res) => {
      return {
        ...res,
        docs: {
          description:
            "OpsManager Resource specs - used by the Operator to create a containerized Ops Manager deployment",
          url: URLs.OpsManagerResource,
          labels: [ResourceLabel.OpsManager],
        },
      };
    },
  ],
]);

const withDocs = (res: ResourceWithActions): ResourceWithActionsAndDocs =>
  docProviders.get(res.kind)?.(res) || { ...res, docs: { labels: [] } };

export const getMongodbDeploymentWithActionsAndDocs = async (
  context: string
): Promise<MongodbDeploymentWithActionsAndDocs> => {
  const deployment = await getMongodbDeploymentWithActions(context);
  return {
    ...deployment,
    clusters: deployment.clusters.map((c) => ({
      cluster: c.cluster,
      namespace: c.namespace,
      k8sResources: c.k8sResources.map(withDocs),
    })),
  };
};
