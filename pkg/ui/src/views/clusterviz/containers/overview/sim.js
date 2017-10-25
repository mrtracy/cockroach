import * as d3 from "d3";

export function renderCanvas(svg) {
    d3.select(svg).append("circle").attr("cx", 0).attr("cy", 0).attr("r", 200);
}
