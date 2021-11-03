// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { MongodbDeployment } from "../../src/core/models";
import { getMongodbDeploymentNetwork } from "../../src/backend/services/deploymentNetwork";

const handler = async (req: NextApiRequest, res: NextApiResponse<MongodbDeployment>) =>
  res.status(200).json(await getMongodbDeploymentNetwork());

export default handler;
