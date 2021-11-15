// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { MongodbDeployment } from "../../src/core/models";
import { getMongodbDeploymentNetwork } from "../../src/backend/services/deploymentNetwork";
import { HttpStatusCode } from "../../src/core/enums";

const handler = async (req: NextApiRequest, res: NextApiResponse<MongodbDeployment>) =>
  res.status(HttpStatusCode.OK).json(await getMongodbDeploymentNetwork(<string>req.query.context));

export default handler;
