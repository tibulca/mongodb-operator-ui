import axios from "axios";

import { HttpContentType, HttpHeader, HttpMethod, HttpStatusCode } from "../../../core/enums";
import { K8SContext, MongodbDeploymentWithActions, NodeHttpAction } from "../../../core/models";
import { Time } from "../../../core/utils";

type errCallback = (err: Error) => void;
type successCallback<T> = (result: T) => void;

const getAsync = async <T>(url: string): Promise<T> => {
  const result = await axios.get<T>(url, { timeout: Time.Seconds(10) });
  return result.data;
};

const deleteAsync = async (url: string): Promise<string> => {
  const result = await fetch(url, { method: HttpMethod.Delete });
  return result.text();
};

const postAsync = async <T>(url: string, data: string): Promise<T> => {
  const result = await fetch(url, { method: HttpMethod.Post, body: data });
  return result.json();
};

const get = <T>(url: string, successCb: successCallback<T>, errCb: errCallback) => {
  const fetchData = async () => {
    try {
      const result = await getAsync<T>(url);
      successCb(result);
    } catch (err) {
      errCb(<Error>err);
    }
  };

  fetchData();
};

const getMongodbDeployment = (
  context: string,
  successCb: successCallback<MongodbDeploymentWithActions>,
  errCb: errCallback
) => get(`/api/deployment?context=${context}`, (result: MongodbDeploymentWithActions) => successCb(result), errCb);

const getPodLogs = (context: string, namespace: string, pod: string, container: string) =>
  getAsync<string>(`/api/pods/logs?context=${context}&namespace=${namespace}&pod=${pod}&container=${container}`);

const deletePod = (context: string, namespace: string, pod: string) =>
  deleteAsync(`/api/pods?context=${context}&namespace=${namespace}&pod=${pod}`);

const executeHttpAction = async (action: NodeHttpAction) => {
  const httpResponse = await axios({
    method: action.httpMethod,
    url: action.url,
    timeout: Time.Seconds(5),
  });

  return {
    contentType: <HttpContentType>httpResponse.headers[HttpHeader.ContentType],
    success: httpResponse.status < HttpStatusCode.BadRequest,
    statusCode: httpResponse.status,
    body: typeof httpResponse.data === "string" ? httpResponse.data : JSON.stringify(httpResponse.data, null, 2),
  };
};

const getContexts = (successCb: successCallback<{ contexts: K8SContext[]; currentContext: string }>, errCb: errCallback) =>
  get("/api/context", (result: { contexts: K8SContext[]; currentContext: string }) => successCb(result), errCb);

export default {
  get,
  getAsync,
  getMongodbDeployment,
  getPodLogs,
  deletePod,
  executeHttpAction,
  getContexts,
};
