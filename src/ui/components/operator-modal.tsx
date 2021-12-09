import {
  Modal,
  Box,
  Button,
  Snackbar,
  Typography,
  Stack,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  Radio,
  FormLabel,
  RadioGroup,
  Link,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import LoadingButton from "@mui/lab/LoadingButton";
import LaunchIcon from "@mui/icons-material/Launch";
import { useState } from "react";
import api from "../services/clients/api";
import { MongoDBOperator, MongoDBOperatorSet } from "../../core/enums";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "450px",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

type OperatorModalProps = {
  show: boolean;
  operatorIsInstalled: boolean;
  context: string;
  onClose: (result: { operatorChanged: boolean }) => void;
};

const OperatorModal = (props: OperatorModalProps) => {
  const [notification, setNotification] = useState<{ text: string; isError: boolean }>({ text: "", isError: false });
  const [actionInProgress, setActionInProgress] = useState(false);

  const [namespace, setNamespace] = useState("mongodb");
  const [resourceMembers, setResMembers] = useState("3");
  const [createResource, setCreateRes] = useState(true);
  const [withTLS, setWithTLS] = useState(false);

  const installOperator = async () => {
    setActionInProgress(true);
    try {
      await api.postAsync("/api/operator", {
        action: "install",
        context: props.context,
        namespace,
        createResource,
        withTLS,
        resourceMembers: parseInt(resourceMembers),
      });
      setNotification({ text: "", isError: false });
      setActionInProgress(false);
      props.onClose({ operatorChanged: true });
    } catch (error) {
      setNotification({ text: String(error), isError: true });
      setActionInProgress(false);
    }
  };

  return (
    <Modal
      open={props.show}
      onClose={() => props.onClose({ operatorChanged: false })}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      style={{ overflow: "scroll" }}
    >
      <Box sx={style}>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <h2>{props.operatorIsInstalled ? "Configure MongoDB Operator" : "Install MongoDB operator"}</h2>
            <div>
              (uses{" "}
              <Link href="https://github.com/mongodb/helm-charts" target="_blank">
                MongoDB Helm Charts
                <LaunchIcon fontSize="small" />
              </Link>
              )
            </div>
            <FormControl component="fieldset" sx={{ "& .MuiFormGroup-root": { paddingLeft: "30px" } }}>
              <FormLabel component="legend">Operator</FormLabel>
              <RadioGroup
                row
                aria-label="show"
                name={`radio-buttons-group-operator`}
                value={MongoDBOperator.Community}
                onChange={(e) => {}}
              >
                {Array.from(MongoDBOperatorSet.values()).map((v) => (
                  <FormControlLabel
                    key={v}
                    value={v}
                    control={<Radio size="small" />}
                    label={v}
                    disabled={v !== MongoDBOperator.Community}
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "smaller" } }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            <FormControl>
              <TextField
                required
                id="ns"
                label="Namespace"
                value={namespace}
                onChange={(event) => setNamespace(event.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormControlLabel
                control={<Checkbox checked={createResource} onChange={(event) => setCreateRes(event.target.checked)} />}
                label="Create MongoDB resource"
              />
            </FormControl>
            <FormControl>
              <FormControlLabel
                control={<Checkbox checked={withTLS} onChange={(event) => setWithTLS(event.target.checked)} />}
                label={
                  <>
                    With TLS (installs{" "}
                    <Link href="https://cert-manager.io/" target="_blank">
                      cert-manager
                      <LaunchIcon fontSize="small" />
                    </Link>
                    )
                  </>
                }
              />
            </FormControl>
            <FormControl>
              <TextField
                label="Resource members"
                value={resourceMembers}
                onChange={(event) => setResMembers(event.target.value)}
              />
            </FormControl>
            {props.operatorIsInstalled ? (
              "<< TO BE IMPLEMENTED >>"
            ) : (
              <FormControl>
                {actionInProgress ? (
                  <LoadingButton loading variant="contained">
                    Install
                  </LoadingButton>
                ) : (
                  <Button variant="contained" onClick={installOperator}>
                    Install
                  </Button>
                )}
              </FormControl>
            )}
          </Stack>

          <Snackbar
            open={!!notification.text}
            autoHideDuration={3000}
            onClose={() => setNotification({ text: "", isError: false })}
          >
            <MuiAlert
              elevation={6}
              variant="filled"
              onClose={() => setNotification({ text: "", isError: false })}
              severity={notification.isError ? "error" : "success"}
              sx={{ width: "100%" }}
            >
              {notification.text}
            </MuiAlert>
          </Snackbar>
        </Typography>
      </Box>
    </Modal>
  );
};

export default OperatorModal;
