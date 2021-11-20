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
import { DisplaySettings, ResourceDisplay } from "../models/settings";
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
  height: "80%",
};

// todo: move to i18n
const ResourceDisplayLabels = {
  [ResourceDisplay.Show]: "always",
  [ResourceDisplay.ShowGrouped]: "grouped",
  [ResourceDisplay.ShowOnlyIfReferenced]: "if referenced",
  [ResourceDisplay.Hide]: "hide",
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

const ResourceDisplayValues = Object.values(ResourceDisplay);

const SettingsModal = (props: SettingsModalProps) => {
  const showKind = (kind: K8SKind | MongoDBKind) => props.settings.ResourcesMap.get(kind);

  const handleShowKindChange = (kind: K8SKind | MongoDBKind) => (event: React.ChangeEvent<HTMLInputElement>) => {
    // todo: deep clone props.settings
    const s = { ...props.settings };
    s.Resources[kind] = event.target.value as ResourceDisplay;
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
                  onChange={handleShowKindChange(k as K8SKind | MongoDBKind)}
                >
                  {ResourceDisplayValues.map((v) => (
                    <FormControlLabel
                      key={v}
                      value={v}
                      control={<Radio size="small" />}
                      label={ResourceDisplayLabels[v]}
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
