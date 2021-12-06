import { styled, Theme } from "@mui/material/styles";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

interface MuiAppHeaderProps extends MuiAppBarProps {
  open?: boolean;
  drawerwidth: number;
}

const StyledAppHeader = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<MuiAppHeaderProps>(({ theme, open, drawerwidth }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerwidth,
    width: `calc(100% - ${drawerwidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const bgColor = (theme: Theme) => (theme.palette.mode === "dark" ? "#016948" : "#51ac4e");

type AppHeaderProps = {
  theme: Theme;
  refreshInProgress: boolean;
  appConfigDrawerOpen: boolean;
  appConfigDrawerWidth: number;
  onOpenAppConfigDrawer: () => void;
};

const AppHeader = (props: AppHeaderProps) => (
  <StyledAppHeader
    position="fixed"
    open={props.appConfigDrawerOpen}
    sx={{ bgcolor: bgColor(props.theme) }}
    drawerwidth={props.appConfigDrawerWidth}
  >
    <Toolbar>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={props.onOpenAppConfigDrawer}
        edge="start"
        sx={{
          marginRight: "36px",
          ...(props.appConfigDrawerOpen && { display: "none" }),
        }}
      >
        <MenuIcon />
      </IconButton>
      <Typography variant="h5" noWrap component="div">
        MongoDB Operator Dashboard
      </Typography>
      {props.refreshInProgress && (
        <Box sx={{ marginLeft: "30px" }}>
          <CircularProgress />
        </Box>
      )}
    </Toolbar>
  </StyledAppHeader>
);

export default AppHeader;
