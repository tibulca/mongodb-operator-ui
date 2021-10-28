import { useState } from "react";

import { Modal, Typography, Box, Button, Stack, TextField } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import apiClient from "../services/clients/api";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

type NodeInfoModalProps = {
  // todo: node details should not be in this type. Instead, this component should only dispatch the actions (configurable in props)
  node: {
    name: string;
    namespace: string;
    kind: string;
  };
  show: boolean;
  title: string;
  sections: {
    title: string;
    content: string;
  }[];
  onClose: () => void;
};

const downloadPodLogs = async (namespace: string, pod: string, container?: string) => {
  const logs = await apiClient.getPodLogs(namespace, pod, container ?? "");

  const element = document.createElement("a");
  const file = new Blob([logs], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = `logs-${namespace}-${pod}-${Date.now()}.txt`;
  document.body.appendChild(element);
  element.click();
};

const NodeInfoModal = (props: NodeInfoModalProps) => {
  const [expanded, setExpanded] = useState<string | false>("panel0");

  const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  };

  return (
    <Modal
      open={props.show}
      onClose={props.onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      style={{ overflow: "scroll" }}
    >
      <Box sx={style}>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          <Stack direction="row" spacing={2}>
            <h2>{props.title}</h2>
            {props.node.kind === "Pod" && (
              <Button
                size="small"
                // variant="contained"
                onClick={() => downloadPodLogs(props.node.namespace, props.node.name)}
              >
                Logs
              </Button>
            )}
          </Stack>
        </Typography>
        {props.sections.map((s, idx) => (
          <Accordion key={idx} expanded={expanded === `panel${idx}`} onChange={handleChange(`panel${idx}`)}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${idx}a-content`}
              id={`panel${idx}a-header`}
            >
              <Typography>{s.title}:</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <TextField multiline maxRows={20} fullWidth disabled value={s.content} />
                {/* <pre style={{ maxHeight: "500px", overflow: "scroll", fontSize: "smaller" }}>{s.content}</pre> */}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Modal>
  );
};

export default NodeInfoModal;
