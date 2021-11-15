import type { NextApiRequest, NextApiResponse } from "next";
import { getContexts } from "../../src/backend/services/context";
import { HttpStatusCode } from "../../src/core/enums";

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  res.status(HttpStatusCode.OK).json(getContexts());
};

export default handler;
