import { useState } from "react";

import { Modal, Typography, Box } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
  show: boolean;
  title: string;
  sections: {
    title: string;
    content: string;
  }[];
  onClose: () => void;
};

export const NodeInfoModal = (props: NodeInfoModalProps) => {
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
          <h2>{props.title}</h2>
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
                <pre style={{ maxHeight: "500px", overflow: "scroll", fontSize: "smaller" }}>{s.content}</pre>
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Modal>
  );
};
