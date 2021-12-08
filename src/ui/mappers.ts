import { ResourceStatus } from "../core/enums";
import { ResourceUIStatus } from "./ui-enums";

export const toResourceUIStatus = (status?: ResourceStatus): ResourceUIStatus => {
  switch (status) {
    case ResourceStatus.Completed:
      return ResourceUIStatus.Completed;
    case ResourceStatus.Failed:
      return ResourceUIStatus.Failed;
    case ResourceStatus.Pending:
    case ResourceStatus.Reconciling:
      return ResourceUIStatus.Pending;
    case ResourceStatus.Running:
      return ResourceUIStatus.Running;
    default:
      status && console.error(`status "${status}" not mapped!`);
      return ResourceUIStatus.NA;
  }
};
