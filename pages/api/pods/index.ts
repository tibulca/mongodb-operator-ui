import type { NextApiRequest, NextApiResponse } from "next";
import { deletePod } from "../../../src/backend/services/pod";
import { HttpMethod, HttpStatusCode } from "../../../src/core/enums";

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  if (req.method === HttpMethod.Get) {
    res.status(HttpStatusCode.NotImplemented).send("NOT IMPLEMENTED");
  } else if (req.method === HttpMethod.Delete) {
    res
      .status(HttpStatusCode.OK)
      .json(await deletePod(<string>req.query.context, <string>req.query.namespace, <string>req.query.pod));
  }
};

export default handler;
