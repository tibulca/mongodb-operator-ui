import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const toOneLine = (cmd: string) =>
  cmd
    .split("\n")
    .map((l) => l.trim())
    .join(" ");

const executeHelmCommand = async (cmd: string) => {
  console.log(`execute HELM command:\n  ${cmd}`);

  const res = await execAsync(`sh -c "${toOneLine(cmd)}"`);

  console.log(`HELM command result:\n  ${res.stdout}, ${res.stderr}`);
  if (res.stderr) {
    throw new Error(res.stderr);
  }
  return { command: toOneLine(cmd), output: res.stdout };
};

export default {
  executeHelmCommand,

  installCertManager: (context: string) =>
    executeHelmCommand(`
      helm install
        cert-manager
        https://charts.jetstack.io/charts/cert-manager-v1.6.1.tgz
        --kube-context=${context}
        --namespace=cert-manager
        --create-namespace
        --set installCRDs=true
    `),

  installMongoDBCommunityOperator: (context: string, namespace: string) =>
    executeHelmCommand(`
      helm install 
        --repo https://mongodb.github.io/helm-charts 
        mongodb-community-operator 
        community-operator
        --kube-context=${context}
        --namespace=${namespace}
        --create-namespace 
        --set community-operator-crds.enabled=true
        --set createResource=false
        --set resource.tls.enabled=false
    `),

  upgradeMongoDBCommunityOperator: (
    context: string,
    namespace: string,
    createResource: boolean,
    withTLS: boolean,
    resourceMembers: number
  ) =>
    executeHelmCommand(`
      helm upgrade 
        --repo https://mongodb.github.io/helm-charts 
        mongodb-community-operator 
        community-operator
        --kube-context=${context}
        --namespace=${namespace}
        --set createResource=${createResource} 
        --set resource.members=${resourceMembers}
        --set resource.tls.enabled=${withTLS}
        --set resource.tls.useCertManager=${withTLS}
    `),
};
