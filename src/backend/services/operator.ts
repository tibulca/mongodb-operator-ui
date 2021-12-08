import helm from "./helm";

export const installOperator = async (
  context: string,
  namespace: string,
  createResource: boolean,
  withTLS: boolean,
  resourceMembers: number
) => {
  const result: { [action: string]: { command: string; output: string } } = {};

  if (withTLS) {
    result["installCertManager"] = await helm.installCertManager(context);
  }

  result["installMongoDBCommunityOperator"] = await helm.installMongoDBCommunityOperator(context, namespace);

  if (createResource) {
    result["createResource"] = await helm.upgradeMongoDBCommunityOperator(
      context,
      namespace,
      createResource,
      withTLS,
      resourceMembers
    );
  }

  return result;
};
