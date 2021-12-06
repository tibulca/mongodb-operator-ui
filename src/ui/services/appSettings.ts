import { DisplaySettings } from "../ui-models";
import localStorage from "../services/localStorage";
import { NetworkLayout, ResourceVisibility } from "../ui-enums";
import { K8SKind, MongoDBKind } from "../../core/enums";

const LocalStorageKey = "settings";

export default {
  load: (): DisplaySettings => {
    const SettingsVersion = 1;
    const settings = localStorage.getItem<DisplaySettings>(LocalStorageKey);
    if (settings && settings.SettingsVersion === SettingsVersion) {
      settings.ResourcesMap = new Map(Object.entries(settings.Resources));
      return settings;
    }

    const defaultRes = {
      [K8SKind.PersistentVolume]: ResourceVisibility.Hide,
      [K8SKind.PersistentVolumeClaim]: ResourceVisibility.Hide,
      [K8SKind.Service]: ResourceVisibility.Hide,
      [K8SKind.Secret]: ResourceVisibility.Hide,
      [K8SKind.ConfigMap]: ResourceVisibility.Hide,
      [K8SKind.CustomResourceDefinition]: ResourceVisibility.ShowOnlyIfReferenced,
      [MongoDBKind.MongoDBUser]: ResourceVisibility.ShowOnlyIfReferenced,
    };
    const defaultSettings = {
      SettingsVersion,
      Layout: NetworkLayout.Fixed,
      Resources: defaultRes,
      ResourcesMap: new Map(Object.entries(defaultRes)),
      Context: { contexts: [], currentContext: "" },
    };

    return defaultSettings;
  },
  save: (settings: DisplaySettings) => localStorage.setItem(LocalStorageKey, settings),
};
