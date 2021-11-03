import type { NextApiRequest, NextApiResponse } from "next";
import { getAgentHealtStatusFile } from "../../../src/backend/services/pod";
import { HttpContentType, HttpHeader, HttpStatusCode } from "../../../src/core/enums";

const handler = async (req: NextApiRequest, res: NextApiResponse<string>) => {
  const output = await getAgentHealtStatusFile(
    <string>req.query.namespace,
    <string>req.query.pod,
    <string>req.query.container
  );

  res
    .status(HttpStatusCode.OK)
    .setHeader(HttpHeader.ContentType, HttpContentType.TextFile)
    .send(JSON.stringify(output, null, 2));
};

export default handler;
