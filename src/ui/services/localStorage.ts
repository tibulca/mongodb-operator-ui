export default {
  getItem: <T>(key: string) => {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : undefined;
  },
  setItem: <T>(key: string, item: T) => window.localStorage.setItem(key, JSON.stringify(item)),
};
