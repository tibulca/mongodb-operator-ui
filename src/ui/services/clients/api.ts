// todo: use axios

import { MongodbDeployment } from "../../../core/models";

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

const getMongodbDeployment = (successCb: successCallback<MongodbDeployment>, errCb: errCallback) =>
  get("/api/deployment", (result: MongodbDeployment) => successCb(result), errCb);

const getPodLogs = (namespace: string, pod: string, container: string) =>
  getAsyncText(`/api/logs?namespace=${namespace}&pod=${pod}&container=${container}`);

export default { get, getAsyncJSON, getAsyncText, getMongodbDeployment, getPodLogs };
