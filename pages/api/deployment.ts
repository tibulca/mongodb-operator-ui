// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { MongodbDeployment } from "../../src/core/models";
import { HttpStatusCode } from "../../src/core/enums";
import { getMongodbDeploymentWithActionsAndDocs } from "../../src/backend/services/deploymentDocs";

const handler = async (req: NextApiRequest, res: NextApiResponse<MongodbDeployment>) =>
  res.status(HttpStatusCode.OK).json(await getMongodbDeploymentWithActionsAndDocs(<string>req.query.context));

export default handler;
