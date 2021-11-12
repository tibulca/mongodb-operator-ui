import { Modal, Typography, Box, Stack } from "@mui/material";
import { DisplaySettings } from "../models/settings";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
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
  MongoDBKind.MongoDBUser,
];

const SettingsModal = (props: SettingsModalProps) => {
  const showKind = (kind: K8SKind | MongoDBKind) => !props.settings.HideResources.has(kind);

  const handleShowKindChange = (kind: K8SKind | MongoDBKind) => (event: React.ChangeEvent<HTMLInputElement>) => {
    // todo: deep clone props.settings
    const s = { ...props.settings };
    if (event.target.checked) {
      s.HideResources.delete(kind);
    } else {
      s.HideResources.add(kind);
    }
    props.onUpdate(s);
  };

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
