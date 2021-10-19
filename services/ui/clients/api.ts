// todo: use axios

import { MongodbDeployment } from "../../../core/models";

type errCallback = (err: Error) => void;
type successCallback<T> = (result: T) => void;

const getAsync = async <T>(url: string): Promise<T> => {
  const result = await fetch(url);
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

const getMongodbDeployment = (successCb: successCallback<MongodbDeployment>, errCb: errCallback) =>
  get("/api/deployment", (result: MongodbDeployment) => successCb(result), errCb);

export default { get, getAsync, getMongodbDeployment };
