// todo: use axios

import { HttpContentType, HttpHeader, HttpMethod, HttpStatusCode } from "../../../core/enums";
import { MongodbDeploymentUIModel, NodeHttpAction } from "../../../core/models";

type errCallback = (err: Error) => void;
type successCallback<T> = (result: T) => void;

const getAsyncJSON = async <T>(url: string): Promise<T> => {
  const result = await fetch(url);
  return result.json();
};

const getAsyncText = async (url: string): Promise<string> => {
  const result = await fetch(url);
  return result.text();
};

const deleteAsync = async (url: string): Promise<string> => {
  const result = await fetch(url, { method: HttpMethod.Delete });
  return result.text();
};

const get = <T>(url: string, successCb: successCallback<T>, errCb: errCallback) => {
  const fetchData = async () => {
    try {
      const result = await getAsyncJSON<T>(url);
      successCb(result);
    } catch (err) {
      errCb(<Error>err);
    }
  };

  fetchData();
};

const getMongodbDeployment = (successCb: successCallback<MongodbDeploymentUIModel>, errCb: errCallback) =>
  get("/api/deployment", (result: MongodbDeploymentUIModel) => successCb(result), errCb);

const getPodLogs = (namespace: string, pod: string, container: string) =>
  getAsyncText(`/api/pods/logs?namespace=${namespace}&pod=${pod}&container=${container}`);

const deletePod = (namespace: string, pod: string) => deleteAsync(`/api/pods?namespace=${namespace}&pod=${pod}`);

const executeHttpAction = async (action: NodeHttpAction) => {
  const httpResponse = await fetch(action.url, { method: action.httpMethod });
  const contentType = httpResponse.headers.get(HttpHeader.ContentType);
  return {
    contentType: <HttpContentType>contentType,
    success: httpResponse.status < HttpStatusCode.BadRequest,
    statusCode: httpResponse.status,
    body: await (contentType === HttpContentType.JSON ? httpResponse.json() : httpResponse.text()),
  };
};

export default {
  get,
  getAsyncJSON,
  getAsyncText,
  getMongodbDeployment,
  getPodLogs,
  deletePod,
  executeHttpAction,
};
