import {
  Modal,
  Typography,
  Box,
  Stack,
  FormControl,
  FormGroup,
  FormLabel,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  RadioGroup,
  Radio,
} from "@mui/material";
import { DisplaySettings } from "../ui-models";
import { NetworkLayout, ResourceVisibility } from "../ui-enums";
import { K8SKind, MongoDBKind } from "../../core/enums";

const style = {
  position: "absolute" as "absolute",
  top: "53%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  height: "85%",
};

// todo: move to i18n
const aResourceVisibilityLabels = {
  [ResourceVisibility.Show]: "display all",
  [ResourceVisibility.ShowGrouped]: "display as a group",
  [ResourceVisibility.ShowOnlyIfReferenced]: "if referenced",
  [ResourceVisibility.Hide]: "hide all",
};

type SettingsModalProps = {
  show: boolean;
  settings: DisplaySettings;
  // todo: replace with OnSave
  onUpdate: (settings: DisplaySettings) => void;
  onClose: () => void;
};

const ResourcesToFilter = [
  K8SKind.CustomResourceDefinition,
  K8SKind.PersistentVolume,
  K8SKind.PersistentVolumeClaim,
  K8SKind.Service,
  //K8SKind.ConfigMap,
  K8SKind.Secret,
  MongoDBKind.MongoDBUser,
];

const ResourceVisibilityValues = Object.values(ResourceVisibility);
const NetworkLayoutValues = Object.values(NetworkLayout);

const SettingsModal = (props: SettingsModalProps) => {
  const showKind = (kind: K8SKind | MongoDBKind) => props.settings.ResourcesMap.get(kind);

  const handleVisibilityChange = (kind: K8SKind | MongoDBKind) => (event: React.ChangeEvent<HTMLInputElement>) => {
    // todo: deep clone props.settings
    const s = { ...props.settings };
    s.Resources[kind] = event.target.value as ResourceVisibility;
    s.ResourcesMap = new Map(Object.entries(s.Resources));
    props.onUpdate(s);
  };

  const handleContextChange = (event: SelectChangeEvent) =>
    props.onUpdate({
      ...props.settings,
      Context: {
        ...props.settings.Context,
        currentContext: event.target.value as string,
      },
    });

  const handleLayoutChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    props.onUpdate({
      ...props.settings,
      Layout: event.target.value as NetworkLayout,
    });

  return (
    <Modal
      open={props.show}
      onClose={props.onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      style={{ overflow: "scroll" }}
    >
      <Box role="modal" sx={style}>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          <Stack direction="row" spacing={2}>
            <h2>Display settings</h2>
          </Stack>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Context</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={props.settings.Context.currentContext}
              label="Context"
              onChange={handleContextChange}
            >
              {props.settings.Context.contexts.map((c) => (
                <MenuItem key={c.name} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <h3>Layout</h3>
          <FormControl component="fieldset" sx={{ "& .MuiFormGroup-root": { paddingLeft: "30px" } }}>
            <RadioGroup
              row
              aria-label="show"
              name={`row-radio-buttons-group-${props.settings.Layout}`}
              value={props.settings.Layout}
              onChange={handleLayoutChange}
            >
              {NetworkLayoutValues.map((v) => (
                <FormControlLabel
                  key={v}
                  value={v}
                  control={<Radio size="small" />}
                  label={v}
                  sx={{ "& .MuiFormControlLabel-label": { fontSize: "smaller" } }}
                />
              ))}
            </RadioGroup>
          </FormControl>
          <h3>Resources</h3>
          <FormGroup>
            {ResourcesToFilter.map((k) => (
              <FormControl key={k} component="fieldset" sx={{ "& .MuiFormGroup-root": { paddingLeft: "30px" } }}>
                <FormLabel component="legend">{k}</FormLabel>
                <RadioGroup
                  row
                  aria-label="show"
                  name={`row-radio-buttons-group-${k}`}
                  value={showKind(k as K8SKind | MongoDBKind)}
                  onChange={handleVisibilityChange(k as K8SKind | MongoDBKind)}
                >
                  {ResourceVisibilityValues.map((v) => (
                    <FormControlLabel
                      key={v}
                      value={v}
                      control={<Radio size="small" />}
                      label={aResourceVisibilityLabels[v]}
                      sx={{ "& .MuiFormControlLabel-label": { fontSize: "smaller" } }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            ))}
          </FormGroup>
        </Typography>
      </Box>
    </Modal>
  );
};

export default SettingsModal;
