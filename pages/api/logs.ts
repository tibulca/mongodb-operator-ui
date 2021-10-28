import type { NextApiRequest, NextApiResponse } from "next";
import { getPodLogs } from "../../src/backend/services/pod";

const handler = async (req: NextApiRequest, res: NextApiResponse<string>) =>
  res
    .status(200)
    .send(await getPodLogs(<string>req.query.namespace, <string>req.query.pod, <string>req.query.container));

export default handler;
