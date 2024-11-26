import React from "react";
import {
  AppBar,
  Toolbar,
  // Typography,
  makeStyles,
  Button
} from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import { Link } from "react-router-dom";

const useStyles = makeStyles(() => ({
  logo: {
    fontFamily: "Work Sans, sans-serif",
    fontWeight: 600,
    color: "#0B274D",
  },
  menuButton: {
    fontFamily: "Open Sans, sans-serif",
    fontWeight: 600,
    color: "#0B274F",
    size: "20px",
    textAlign: "left"
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between"
  },
  header: {
    backgroundColor: "#FFF"
  },
  logoImage: {
    width: "150px", // ระบุขนาดความกว้างของรูปภาพตามที่ต้องการ
  },
}));

const headersData = [];

export default function Header() {
  const { header,menuButton, toolbar, logoImage } = useStyles();

  const displayDesktop = () => {
    return (
      <Toolbar className={toolbar}>
        <div>{getMenuButtons()}</div>
        <Link to="/home" className="nav-link">
          <img src="BlueText.png" className={logoImage}></img>
        </Link>
        <img src="minebeamitsumi_logo_en.png" className={logoImage}></img>
      </Toolbar>
    );
  };

  // const NMBLogo = (
  //   <Typography variant="h6" component="h1" className={logo}>
  //     I-Spindle 4.0
  //   </Typography>
  // );

  const getMenuButtons = () => {
    return headersData.map(({ label, href }) => {
      return (
        <Button
          {...{
            key: label,
            color: "inherit",
            to: href,
            component: RouterLink,
            className: menuButton
          }}
        >
          {label}
        </Button>
      );
    });
  };

  return (
    <header>
      <AppBar className={`${header} main-header`} position="static">
        {displayDesktop()}
      </AppBar>
    </header>
  );
}
