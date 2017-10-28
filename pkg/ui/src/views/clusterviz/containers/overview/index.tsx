import React from "react";
import { connect } from "react-redux";

import { refreshNodes, refreshLiveness } from "src/redux/apiReducers";
import { nodesSummarySelector, NodesSummary } from "src/redux/nodes";
import { AdminUIState } from "src/redux/state";
import { renderCanvas } from "./sim";
import "./sim.css";

interface ClusterVizProps {
    nodesSummary: NodesSummary;
    refreshNodes: typeof refreshNodes;
    refreshLiveness: typeof refreshLiveness;
}

export class ClusterVizMain extends React.Component<ClusterVizProps, {}> {
    svgEl: SVGElement;

    componentWillMount() {
        // Refresh nodes status query when mounting.
        this.props.refreshNodes();
        this.props.refreshLiveness();
    }

    componentWillReceiveProps(props: any) {
        // Refresh nodes status query when props are received; this will immediately
        // trigger a new request if previous results are invalidated.
        props.refreshNodes();
        props.refreshLiveness();
    }

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.drawChart();
    }

    drawChart = () => {
        // If the document is not visible (e.g. if the window is minimized) we don't
        // attempt to redraw the chart. Redrawing the chart uses
        // requestAnimationFrame, which isn't called when the tab is in the
        // background, and is then apparently queued up and called en masse when the
        // tab re-enters the foreground. This check prevents the issue in #8896
        // where switching to a tab with the graphs page open that had been in the
        // background caused the UI to run out of memory and either lag or crash.
        // NOTE: This might not work on Android:
        // http://caniuse.com/#feat=pagevisibility
        if (!document.hidden) {
            renderCanvas(this.svgEl);
        }
    }

    render() {
        return (
            <svg style={{width: "100%", height: "100%"}} className="cluster-viz" ref={svg => this.svgEl = svg}/>
        );
    }
}

export default connect(
    (state: AdminUIState) => ({
        nodesSummary: nodesSummarySelector(state),
    }),
    {
        refreshNodes,
        refreshLiveness,
    },
)(ClusterVizMain);
