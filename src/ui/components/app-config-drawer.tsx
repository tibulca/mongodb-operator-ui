import { styled } from "@mui/material/styles";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SettingsIcon from "@mui/icons-material/Settings";
import RefreshIcon from "@mui/icons-material/Refresh";
import StyledDrawer from "./styled-drawer";
import theme from "../theme";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

type AppConfigDrawerProps = {
  open: boolean;
  width: number;
  onRefresh: () => void;
  onShowSettings: () => void;
  onToggleColorMode: () => void;
  onClose: () => void;
};

const AppConfigDrawer = (props: AppConfigDrawerProps) => {
  return (
    <StyledDrawer variant="permanent" open={props.open} width={props.width}>
      <DrawerHeader>
        <IconButton onClick={props.onClose}>
          {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        <ListItem button onClick={props.onRefresh}>
          <ListItemIcon>
            <RefreshIcon />
          </ListItemIcon>
          <ListItemText primary={"Refresh"} />
        </ListItem>
        <ListItem button onClick={props.onToggleColorMode}>
          <ListItemIcon>{theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}</ListItemIcon>
          <ListItemText primary={"Theme"} />
        </ListItem>
        <ListItem button onClick={props.onShowSettings}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary={"Settings"} />
        </ListItem>
        {/* {["Inbox", "Starred", "Send email", "Drafts"].map((text, index) => (
              <ListItem button key={text}>
                <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))} */}
      </List>
      {/* <Divider /> */}
      {/* <List>
            {["All mail", "Trash", "Spam"].map((text, index) => (
              <ListItem button key={text}>
                <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List> */}
    </StyledDrawer>
  );
};

export default AppConfigDrawer;
