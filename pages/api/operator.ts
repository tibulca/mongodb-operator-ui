import type { NextApiRequest, NextApiResponse } from "next";
import { installOperator } from "../../src/backend/services/operator";
import { HttpMethod, HttpStatusCode } from "../../src/core/enums";

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  if (req.method !== HttpMethod.Post || req.body.action !== "install") {
    res.status(HttpStatusCode.NotImplemented).send("NOT IMPLEMENTED");
  } else {
    // todo: req should be stongly typed
    // todo: validation
    const { context, namespace, createResource, withTLS, resourceMembers } = req.body;
    res
      .status(HttpStatusCode.OK)
      .json(await installOperator(context, namespace, createResource, withTLS, resourceMembers));
  }
};

export default handler;
