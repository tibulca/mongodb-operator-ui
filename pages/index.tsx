import type { NextPage } from "next";
import { useEffect, useState } from "react";
import styles from "../src/ui/styles/Home.module.css";
import Deployment from "../src/ui/components/deployment";
import apiClient from "../src/ui/services/clients/api";
import { MongodbDeployment } from "../src/core/models";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
//import Container from "@mui/material/Container";

const Home: NextPage = () => {
  const [deployment, setDeployment] = useState<MongodbDeployment | undefined>();

  useEffect(
    () =>
      apiClient.getMongodbDeployment(setDeployment, (err) => {
        /* display err */
      }),
    []
  );

  return (
    //<Container maxWidth="xl" style={{ height: "100%" }}>
    deployment ? (
      <Deployment data={deployment} />
    ) : (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    )
    //</Container>
  );
};

export default Home;
