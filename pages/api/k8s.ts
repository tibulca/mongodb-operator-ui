// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import k8sClient from "../../services/backend/clients/k8s";

type Data = {
  data: any;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const data = [];
  const pods = await k8sClient.getPods("mongodb");
  const crds = await k8sClient.getCRDs("mongodb.com");
  for (const crd of crds) {
    const crs = await k8sClient.getCRs(crd.spec.group, crd.spec.versions[0].name, "mongodb", crd.spec.names.plural);
    data.push(`crd: ${crd.spec.names.kind}`);

    data.push(...crs.map((c: any) => `cr: ${crd.spec.names.kind}/${c.metadata.name}`));
  }

  data.push(...pods.items.map((p: any) => `pod: ${p.metadata.name}`));

  res.status(200).json({ data });
};

export default handler;
