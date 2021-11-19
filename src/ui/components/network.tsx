import React, { useState } from "react";
import NetworkGraph from "react-graph-vis";
import { Network as VisNetwork, Options as VisOptions } from "vis";
import { v4 } from "uuid";

import "react-graph-vis/node_modules/vis-network/styles/vis-network.css";

import * as NetworkModels from "../models/network";

const options: VisOptions = {
  layout: {
    //hierarchical: true,
    // hierarchical: {
    //   direction: "UD",
    //   sortMethod: "directed", // hubsize / directed
    //   shakeTowards: "roots", // roots / leaves
    //   edgeMinimization: true,
    //   parentCentralization: false,
    //   blockShifting: false,
    //   nodeSpacing: 200,
    //   treeSpacing: 175,
    //   levelSeparation: 150,
    // },
  },
  interaction: {
    dragNodes: true,
  },
  physics: {
    enabled: false,
  },
  nodes: {
    shape: "box",
    font: {
      multi: true,
    },
  },
  groups: {
    Operator: {
      size: 50,
      font: { size: 18 },
    },
    // Pod: {
    //   shapeProperties: { borderDashes: [5, 5] },
    //   color: { border: "#334433", background: "#339933" },
    //   borderWidth: 1,
    //   size: 30,
    //   font: { size: 10, color: "#ffffff" },
    // },
  },
  edges: {
    color: "#888888",
    width: 1,
    smooth: {
      enabled: true,
      type: "cubicBezier", //"vertical",
      forceDirection: "none",
      roundness: 0.1,
    },
  },
};

const events = (selectNode: (uid: string | undefined) => void) => ({
  select(event: any) {
    const { nodes, edges } = event;
    console.log("Selected nodes:");
    console.log(nodes);
    console.log("Selected edges:");
    console.log(edges);
    selectNode(nodes[0]);
  },
});

export type NetworkProps = {
  data: {
    nodes: NetworkModels.Node[];
    edges: NetworkModels.Edge[];
  };
  onSelectNode: (uid: string | undefined) => void;
};

const Network = (props: NetworkProps) => {
  const [network, setNetwork] = useState<VisNetwork | null>(null);

  return (
    <NetworkGraph
      key={v4()}
      graph={props.data}
      options={options}
      events={events(props.onSelectNode)}
      getNetwork={(n: VisNetwork) => {
        // if you want access to vis.js network api you can set the state
        // in a parent component using this property
        !network && setNetwork(n);
      }}
    />
  );
};

export default Network;
