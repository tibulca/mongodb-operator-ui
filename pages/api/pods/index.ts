import type { NextApiRequest, NextApiResponse } from "next";
import { deletePod } from "../../../src/backend/services/pod";

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  if (req.method === "GET") {
    res.status(501).send("NOT IMPLEMENTED");
  } else if (req.method === "DELETE") {
    res
      .status(200)
      .json(await deletePod(<string>req.query.context, <string>req.query.namespace, <string>req.query.pod));
  }
};

export default handler;
