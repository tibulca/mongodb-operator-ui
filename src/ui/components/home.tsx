import type { NextPage } from "next";
import React, { useEffect, useState, useMemo, createContext } from "react";
import Deployment from "./deployment";
import SettingsModal from "./settings";
import apiClient from "../services/clients/api";
import { MongodbDeploymentWithActions } from "../../core/models";
import Box from "@mui/material/Box";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Head from "next/head";
import { DisplaySettings, MongodbDeploymentUIModel } from "../ui-models";
import AppHeader from "./app-header";
import appSettings from "../services/appSettings";
import { generateLayout } from "../services/layout";
import AppConfigDrawer from "./app-config-drawer";
import { Toolbar } from "@mui/material";

const ColorModeContext = createContext({ toggleColorMode: () => {} });
const AppConfigDrawerWidth = 240;

const Home: NextPage = () => {
  const [lastRefreshRequest, setLastRefreshRequest] = useState(Date.now());
  const [refreshInProgress, setRefreshInProgress] = useState(false);

  const [appConfigDrawerOpen, setAppConfigDrawerOpen] = useState(false);

  const [settings, setSettings] = useState<DisplaySettings>(appSettings.load());
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const colorMode = useMemo(
    () => ({ toggleColorMode: () => setThemeMode((prevMode) => (prevMode === "light" ? "dark" : "light")) }),
    []
  );
  const theme = useMemo(() => createTheme({ palette: { mode: themeMode } }), [themeMode]);

  const [rawDeployment, setRawDeployment] = useState<MongodbDeploymentWithActions | undefined>();
  const [deployment, setDeployment] = useState<MongodbDeploymentUIModel | undefined>();

  const handleChangeSettings = (settings: DisplaySettings) => {
    setSettings(settings);
    if (appSettings.load().Context.currentContext !== settings.Context.currentContext) {
      setLastRefreshRequest(Date.now());
    } else if (rawDeployment) {
      setDeployment(generateLayout(rawDeployment, settings));
    }
    appSettings.save(settings);
  };

  const handleSetDeployment = (deployment: MongodbDeploymentWithActions) => {
    setRefreshInProgress(false);
    setRawDeployment(deployment);
    setDeployment(generateLayout(deployment, settings));
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
    <ColorModeContext.Provider value={colorMode}>
      <Head>
        <title>MongoDB Operator Dashboard</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toolbar />
        <Box sx={{ display: "flex" }} role="layout">
          <AppHeader
            theme={theme}
            refreshInProgress={!deployment || refreshInProgress}
            appConfigDrawerOpen={appConfigDrawerOpen}
            appConfigDrawerWidth={AppConfigDrawerWidth}
            onOpenAppConfigDrawer={() => setAppConfigDrawerOpen(true)}
          />

          <AppConfigDrawer
            open={appConfigDrawerOpen}
            width={AppConfigDrawerWidth}
            onRefresh={() => setLastRefreshRequest(Date.now())}
            onClose={() => setAppConfigDrawerOpen(false)}
            onShowSettings={() => setShowSettings(true)}
            onToggleColorMode={colorMode.toggleColorMode}
          />

          <Box role="main" component="main" sx={{ flexGrow: 1, p: 3 }}>
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
  );
};

export default Home;
