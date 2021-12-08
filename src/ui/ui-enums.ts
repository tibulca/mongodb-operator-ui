export enum NetworkLayout {
  Fixed = "Fixed",
  AutoArrange = "AutoArrange",
}

export enum ResourceVisibility {
  Show = "Show",
  ShowGrouped = "ShowGrouped",
  ShowOnlyIfReferenced = "ShowOnlyIfReferenced",
  Hide = "Hide",
}

export enum ResourceUIStatus {
  NA = "n/a",
  Running = "running",
  Pending = "pending",
  Completed = "completed",
  Failed = "failed",
}
export const ResourceUIStatusSet = new Set(<string[]>Object.values(ResourceUIStatus));
