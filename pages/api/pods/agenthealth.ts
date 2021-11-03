import type { NextApiRequest, NextApiResponse } from "next";
import { getAgentHealtStatusFile } from "../../../src/backend/services/pod";
import { HttpContentType, HttpHeader, HttpStatusCode } from "../../../src/core/enums";

const handler = async (req: NextApiRequest, res: NextApiResponse<string>) =>
  res
    .status(HttpStatusCode.OK)
    .setHeader(HttpHeader.ContentType, HttpContentType.TextFile)
    .send(
      await getAgentHealtStatusFile(<string>req.query.namespace, <string>req.query.pod, <string>req.query.container)
    );

export default handler;
