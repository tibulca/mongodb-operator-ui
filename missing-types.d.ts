declare module "react-graph-vis" {
  import { Component } from "react";
  import { Network, NetworkEvents, Options, Node, Edge, DataSet } from "vis";

  export interface graphEvents {
    [event: NetworkEvents]: (params?: any) => void;
  }

  export interface graphData {
    nodes: Node[];
    edges: Edge[];
  }

  export interface NetworkGraphProps {
    graph: graphData;
    options?: Options;
    events?: graphEvents;
    identifier?: string;
    style?: React.CSSProperties;
    getNetwork?: (network: Network) => void;
    getNodes?: (nodes: DataSet) => void;
    getEdges?: (edges: DataSet) => void;
  }

  export interface NetworkGraphState {
    identifier: string;
  }

  export default class NetworkGraph extends Component<NetworkGraphProps, NetworkGraphState> {
    render();
  }
}
