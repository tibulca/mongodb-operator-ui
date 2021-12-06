import { styled, Theme, CSSObject } from "@mui/material/styles";
import MuiDrawer, { DrawerProps } from "@mui/material/Drawer";

const bgColor = (theme: Theme) => (theme.palette.mode === "dark" ? "#016948" : "#51ac4e");

const openedMixin = (theme: Theme, width: number): CSSObject => ({
  width,
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

const WrapperDrawer = (props: DrawerProps & { width: number }) => <MuiDrawer {...props} />;

const StyledDrawer = styled(WrapperDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open, width }) => ({
    width,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
      ...openedMixin(theme, width),
      "& .MuiDrawer-paper": openedMixin(theme, width),
    }),
    ...(!open && {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": closedMixin(theme),
    }),
  })
);

export default StyledDrawer;
