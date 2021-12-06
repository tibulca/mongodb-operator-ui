import { K8SKind } from "./enums";
import { K8SResource } from "./models";

export const Time = {
  Seconds: (seconds: number) => seconds * 1000,
};

export const balanceSortedArray = <T>(arr: T[]) => {
  const result = new Array<T>(arr.length);
  arr.forEach((el, idx) => {
    const mod = idx % 2;
    const div = (idx - mod) / 2;
    const newIdx = mod === 0 ? div : arr.length - 1 - div;
    result[newIdx] = el;
  });

  return result;
};

export const isOperatorPod = (kRes: K8SResource) =>
  kRes.kind === K8SKind.Pod &&
  kRes.name.includes("operator") &&
  !kRes.name.includes("operator-ui") &&
  kRes.ownerReference?.kind === K8SKind.ReplicaSet;

export const groupBy = <T>(arr: T[], keyGetter: (el: T) => string): Map<string, T[]> =>
  arr.reduce((groups, el) => {
    const groupKey = keyGetter(el);
    groups.set(groupKey, [...(groups.get(groupKey) || []), el]);
    return groups;
  }, new Map<string, T[]>());
