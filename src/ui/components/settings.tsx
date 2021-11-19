import {
  Modal,
  Typography,
  Box,
  Stack,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
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
  height: "90%",
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

const SettingsModal = (props: SettingsModalProps) => {
  const showKind = (kind: K8SKind | MongoDBKind) => {
    const display = props.settings.ResourcesMap.get(kind);
    // todo: do not return only a bool
    return !display || display === ResourceDisplay.Show;
  };

  const handleShowKindChange = (kind: K8SKind | MongoDBKind) => (event: React.ChangeEvent<HTMLInputElement>) => {
    // todo: deep clone props.settings
    const s = { ...props.settings };
    if (event.target.checked) {
      s.Resources[kind] = ResourceDisplay.Show;
    } else {
      s.Resources[kind] = ResourceDisplay.Hide;
    }
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
              label="Age"
              onChange={handleContextChange}
            >
              {props.settings.Context.contexts.map((c) => (
                <MenuItem key={c.name} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <h3>Show</h3>
          <FormGroup>
            {ResourcesToFilter.map((k) => (
              <FormControlLabel
                key={k}
                control={
                  <Checkbox
                    checked={showKind(k as K8SKind | MongoDBKind)}
                    onChange={handleShowKindChange(k as K8SKind | MongoDBKind)}
                  />
                }
                label={k}
              />
            ))}
          </FormGroup>
        </Typography>
      </Box>
    </Modal>
  );
};

export default SettingsModal;
