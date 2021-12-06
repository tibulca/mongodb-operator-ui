import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Button,
  Stack,
  Snackbar,
  TextField,
  CircularProgress,
  Toolbar,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MuiAlert from "@mui/material/Alert";
import apiClient from "../services/clients/api";
import { HttpContentType } from "../../core/enums";
import { NodeHttpAction } from "../../core/models";
import PositionedMenu from "./positioned-menu";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { styled } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";

type Anchor = "top" | "left" | "bottom" | "right";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

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

type InfoSection = {
  title: string;
  content: string;
};

type NodeInfoDrawerProps = {
  // todo: node details should not be in this type. Instead, this component should only dispatch the actions (configurable in props)
  node: {
    name: string;
    namespace: string;
    kind: string;
  };
  title: string;
  sections: InfoSection[];
  actions: NodeHttpAction[];
  onClose: () => void;
  open: boolean;
  width: number;
};

const downloadTextFile = (filename: string, text: string) => {
  const file = new Blob([text], { type: HttpContentType.TextFile });
  const element = document.createElement("a");
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();

  // const wnd = window.open("about:blank") as Window;
  // wnd.document.write(text);
  // wnd.document.close();
};

const executeAction = async (action: NodeHttpAction) => {
  try {
    const response = await apiClient.executeHttpAction(action);
    if (response.contentType === HttpContentType.TextFile) {
      downloadTextFile(`${action.group}-${action.label}-${Date.now()}.txt`, String(response.body));
    }
    return response.success;
  } catch (e) {
    console.error(e);
    return false;
  }
};

const renderActions = (
  actions: NodeHttpAction[],
  start: (action: NodeHttpAction) => void,
  done: (action: NodeHttpAction, response: { text: string; isError: boolean }) => void
) => {
  if (!actions || !actions.length) {
    return null;
  }

  const groupedActions = actions.reduce((acc, action) => {
    if (!acc.has(action.group)) {
      acc.set(action.group, []);
    }
    acc.get(action.group)?.push(action);
    return acc;
  }, new Map<string, NodeHttpAction[]>());

  const executeActionAndProcessResponse = (action: NodeHttpAction) => {
    start(action);
    executeAction(action).then((success) =>
      done(action, {
        text: `"${action.description}" ${success ? "was successful" : "failed"}`,
        isError: !success,
      })
    );
  };

  return Array.from(groupedActions.entries()).map(([group, groupActions]) =>
    groupActions.length === 1 ? (
      <Button key={groupActions[0].url} size="small" onClick={() => executeActionAndProcessResponse(groupActions[0])}>
        {groupActions[0].label}
      </Button>
    ) : (
      <div key={group} style={{ display: "flex", alignItems: "center" }}>
        <PositionedMenu
          title={group}
          options={groupActions.map((a) => a.label)}
          onOptionSelect={(idx: number) => executeActionAndProcessResponse(groupActions[idx])}
        />
      </div>
    )
  );
};

const renderInfoSections = (
  sections: InfoSection[],
  expandedPanel: string | boolean,
  setExpandedPanel: (panel: string | false) => void
) => {
  const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpandedPanel(newExpanded ? panel : false);
  };

  return sections.map((s, idx) => (
    <ListItem key={idx}>
      <Accordion
        key={idx}
        expanded={expandedPanel === `panel${idx}`}
        onChange={handleChange(`panel${idx}`)}
        style={{ width: "100%" }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`panel${idx}a-content`}
          id={`panel${idx}a-header`}
        >
          <Typography>{s.title}:</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            <TextField multiline maxRows={15} fullWidth disabled value={s.content} />
            {/* <pre style={{ maxHeight: "500px", overflow: "scroll", fontSize: "smaller" }}>{s.content}</pre> */}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </ListItem>
  ));
};

const NodeInfoDrawer = (props: NodeInfoDrawerProps) => {
  const [expanded, setExpanded] = useState<string | false>("panel0");
  const [notification, setNotification] = useState<{ text: string; isError: boolean }>({ text: "", isError: false });
  const [actionInProgress, setActionInProgress] = useState(false);

  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const toggleDrawer = (anchor: Anchor, open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const anchor = "right";

  return (
    <Drawer anchor={anchor} open={props.open} onClose={props.onClose}>
      <Toolbar />
      <Box
        sx={{ width: props.width }}
        role="presentation"
        onClick={toggleDrawer(anchor, false)}
        onKeyDown={toggleDrawer(anchor, false)}
      >
        <Typography id="modal-modal-description" sx={{ mt: 2, paddingLeft: "20px" }}>
          <h2>{props.title}</h2>
          <Stack direction="row" spacing={2}>
            {renderActions(
              props.actions,
              (action: NodeHttpAction) => setActionInProgress(true),
              (action: NodeHttpAction, response: { text: string; isError: boolean }) => {
                setActionInProgress(false);
                setNotification(response);
              }
            )}
            {actionInProgress && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <CircularProgress />
              </div>
            )}
          </Stack>
        </Typography>
        <List>{renderInfoSections(props.sections, expanded, (panel: string | false) => setExpanded(panel))}</List>
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
      </Box>
    </Drawer>
  );
};

export default NodeInfoDrawer;
