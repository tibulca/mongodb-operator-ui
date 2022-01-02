import helm from "./helm";
import { DocumentedResult } from "../../core/models";

export const installOperator = async (
  context: string,
  namespace: string,
  createResource: boolean,
  withTLS: boolean,
  resourceMembers: number
) => {
  const result: DocumentedResult = { commands: [], docRefs: [] };

  if (withTLS) {
    const installCertManager = await helm.installCertManager(context);
    result.commands.push({
      command: installCertManager.command,
      output: installCertManager.output,
      description: "install cert-manager",
    });
    result.docRefs.push("https://cert-manager.io/docs/installation/");
  }

  const installMongoDBCommunityOperator = await helm.installMongoDBCommunityOperator(context, namespace);
  result.commands.push({
    command: installMongoDBCommunityOperator.command,
    output: installMongoDBCommunityOperator.output,
    description: "install MongoDB Community Operator",
  });
  result.docRefs.push("https://github.com/mongodb/mongodb-kubernetes-operator/blob/master/docs/install-upgrade.md");

  if (createResource) {
    const deployResourceResult = await helm.upgradeMongoDBCommunityOperator(
      context,
      namespace,
      createResource,
      withTLS,
      resourceMembers
    );
    result.commands.push({
      command: deployResourceResult.command,
      output: deployResourceResult.output,
      description: "deploy MongoDB resource",
    });
    result.docRefs.push("https://github.com/mongodb/mongodb-kubernetes-operator/blob/master/docs/deploy-configure.md");
  }

  return result;
};
