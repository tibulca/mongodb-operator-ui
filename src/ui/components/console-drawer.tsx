import React, { useState } from "react";
import { Box, TextField } from "@mui/material";
import Drawer from "@mui/material/Drawer";

type ConsoleDrawerProps = {
  text: string;
};

const ConsoleDrawer = (props: ConsoleDrawerProps) => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setOpen(!open);
  };

  return (
    <Drawer variant="permanent" anchor="bottom" open={true}>
      <Box sx={{ height: open ? 600 : 50 }} role="presentation" onClick={toggleDrawer()} onKeyDown={toggleDrawer()}>
        <TextField multiline maxRows={24} fullWidth disabled value={props.text} />
      </Box>
    </Drawer>
  );
};

export default ConsoleDrawer;
