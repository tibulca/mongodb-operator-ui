import type { NextPage } from "next";
import React, { useEffect, useState, useMemo, createContext } from "react";
import Deployment from "./deployment";
import SettingsModal from "./settings";
import apiClient from "../services/clients/api";
import { Context, MongodbDeploymentWithActions } from "../../core/models";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
//import Container from "@mui/material/Container";
import { styled, Theme, CSSObject } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import RefreshIcon from "@mui/icons-material/Refresh";
import CssBaseline from "@mui/material/CssBaseline";
import Head from "next/head";
import { DisplaySettings, MongodbDeploymentUIModel } from "../ui-models";
import AppHeader from "./app-header";
import localStorage from "../services/localStorage";

//import "../src/ui/styles/globals.css";
import theme from "../theme";
import styles from "../styles/Home.module.css";
import { K8SKind, MongoDBKind } from "../../core/enums";
import { generateFixedLayout } from "../services/layout/fixed";
import { NetworkLayout, ResourceVisibility } from "../ui-enums";

const ColorModeContext = createContext({ toggleColorMode: () => {} });

const drawerWidth = 240;

const bgColor = (theme: Theme) => (theme.palette.mode === "dark" ? "#016948" : "#51ac4e");

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  backgroundColor: bgColor(theme),
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  backgroundColor: bgColor(theme),
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const localStorageSettings = (): DisplaySettings => {
  const SettingsVersion = 1;
  const settings = localStorage.getItem<DisplaySettings>("settings");
  if (settings && settings.SettingsVersion === SettingsVersion) {
    settings.ResourcesMap = new Map(Object.entries(settings.Resources));
    return settings;
  }

  const defaultRes = {
    [K8SKind.PersistentVolume]: ResourceVisibility.Hide,
    [K8SKind.PersistentVolumeClaim]: ResourceVisibility.Hide,
    [K8SKind.Service]: ResourceVisibility.Hide,
    [K8SKind.Secret]: ResourceVisibility.Hide,
    [K8SKind.ConfigMap]: ResourceVisibility.Hide,
    [K8SKind.CustomResourceDefinition]: ResourceVisibility.ShowOnlyIfReferenced,
    [MongoDBKind.MongoDBUser]: ResourceVisibility.ShowOnlyIfReferenced,
  };
  const defaultSettings = {
    SettingsVersion,
    Layout: NetworkLayout.Fixed,
    Resources: defaultRes,
    ResourcesMap: new Map(Object.entries(defaultRes)),
    Context: { contexts: [], currentContext: "" },
  };

  return defaultSettings;
};

const Home: NextPage = () => {
  const [lastRefreshRequest, setLastRefreshRequest] = useState(Date.now());
  const [refreshInProgress, setRefreshInProgress] = useState(false);
  const [settings, setSettings] = useState<DisplaySettings>(localStorageSettings());

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const colorMode = useMemo(
    () => ({ toggleColorMode: () => setThemeMode((prevMode) => (prevMode === "light" ? "dark" : "light")) }),
    []
  );
  const theme = useMemo(() => createTheme({ palette: { mode: themeMode } }), [themeMode]);

  const [rawDeployment, setRawDeployment] = useState<MongodbDeploymentWithActions | undefined>();
  const [deployment, setDeployment] = useState<MongodbDeploymentUIModel | undefined>();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  const handleChangeSettings = (settings: DisplaySettings) => {
    setSettings(settings);
    if (localStorageSettings().Context.currentContext !== settings.Context.currentContext) {
      setLastRefreshRequest(Date.now());
    } else if (rawDeployment) {
      setDeployment(generateFixedLayout(rawDeployment, settings));
    }
    localStorage.setItem("settings", settings);
  };

  const handleSetDeployment = (deployment: MongodbDeploymentWithActions) => {
    setRefreshInProgress(false);
    setRawDeployment(deployment);
    setDeployment(generateFixedLayout(deployment, settings));
  };

  useEffect(() => {
    setRefreshInProgress(true);
    if (settings.Context.currentContext) {
      apiClient.getMongodbDeployment(settings.Context.currentContext, handleSetDeployment, (err) => {
        console.log(err);
        setRefreshInProgress(false);
        /* display err */
      });
    } else {
      apiClient.getContexts(
        (c) => {
          setSettings({ ...settings, Context: c });
          apiClient.getMongodbDeployment(c.currentContext, handleSetDeployment, (err) => {
            console.log(err);
            setRefreshInProgress(false);
            /* display err */
          });
        },
        (err) => {
          console.log(err);
          /* display err */
        }
      );
    }
  }, [lastRefreshRequest]);

  return (
    //<Container maxWidth="xl" style={{ height: "100%" }}>
    <ColorModeContext.Provider value={colorMode}>
      <Head>
        <title>MongoDB Operator Dashboard</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: "flex" }} role="layout">
          <AppHeader position="fixed" open={drawerOpen} sx={{ bgcolor: bgColor(theme) }} drawerwidth={drawerWidth}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={{
                  marginRight: "36px",
                  ...(drawerOpen && { display: "none" }),
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h5" noWrap component="div">
                MongoDB Operator Dashboard
              </Typography>
              {(!deployment || refreshInProgress) && (
                <Box sx={{ marginLeft: "30px" }}>
                  <CircularProgress />
                </Box>
              )}
            </Toolbar>
          </AppHeader>

          <Drawer variant="permanent" open={drawerOpen}>
            <DrawerHeader>
              <IconButton onClick={handleDrawerClose}>
                {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </DrawerHeader>
            <Divider />
            <List>
              <ListItem button onClick={() => setLastRefreshRequest(Date.now())}>
                <ListItemIcon>
                  <RefreshIcon />
                </ListItemIcon>
                <ListItemText primary={"Refresh"} />
              </ListItem>
              <ListItem button onClick={colorMode.toggleColorMode}>
                <ListItemIcon>{theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}</ListItemIcon>
                <ListItemText primary={"Theme"} />
              </ListItem>
              <ListItem button onClick={() => setShowSettings(true)}>
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
          </Drawer>

          <Box role="main" component="main" sx={{ flexGrow: 1, p: 3 }}>
            <DrawerHeader />
            {deployment && <Deployment data={deployment} settings={settings} />}
          </Box>

          <SettingsModal
            show={showSettings}
            settings={settings}
            onUpdate={handleChangeSettings}
            onClose={() => setShowSettings(false)}
          />
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
    //</Container>
  );
};

export default Home;
