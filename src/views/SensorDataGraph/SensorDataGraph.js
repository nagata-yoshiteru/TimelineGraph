import React, { Component } from 'react'
import './style.css'
import * as d3 from 'd3';
import { createID } from '../../utils/hash';
import { MAX_ZOOM, DEFAULT_TIME_FORMAT, DEFAULT_COLORS, TIMELINE_DATA_COLS } from '../../utils/const';
import moment from 'moment';

const defaultStrokeColors = DEFAULT_COLORS;
const rangeLabelOffset = 4;

class SensorDataGraph extends Component {

    constructor(props) {
        super(props)
        this.state = {
            graphID: createID(8),
            valueRange: null,
            showControl: true,
        }
        this.currentData = null;
        this.yMax = 0.1;
        this.drawGraph = this.drawGraph.bind(this)
        this.clearGraph = this.clearGraph.bind(this)
        this.createTooltipTable = this.createTooltipTable.bind(this)
        this.expandValue = this.expandValue.bind(this)
        this.shrinkValue = this.shrinkValue.bind(this)
        this.fitValue = this.fitValue.bind(this)
        this.resizeTimer = false;
    }

    // static getDerivedStateFromProps(props, state) {
    // 	return state;
    // }

    componentDidMount() {
        const _self = this;
        this.drawGraph()
        window.addEventListener("resize", () => {
            if (_self.resizeTimer !== false) {
                clearTimeout(_self.resizeTimer);
            }
            _self.resizeTimer = setTimeout(this.componentDidUpdate.bind(_self), 200);
        });
    }

    componentDidUpdate() {
        this.clearGraph()
        this.drawGraph()
    }

    drawGraph() {
        const { graphID, valueRange } = this.state;
        const { timeRange, currentTimeRange, legends, yLabel, levels, sliding, timeFormat, timeOffset, appSetState, timepoints, timeranges } = this.props;
        const _self = this;
        const areaDiv = d3.select(`#${graphID}-area`);
        const width = Number(areaDiv.style("width").replace("px", "")),
            height = Number(areaDiv.style("height").replace("px", "")),
            margins = [8, 16, 48, 64];
        const dataCount = (currentTimeRange[1] - currentTimeRange[0]) / (timeRange[1] - timeRange[0]) * levels[0].length;
        const useLevel = Math.log2(dataCount / (width - margins[1] - margins[3])) + (sliding ? 1 : 0);
        // console.log("w", width, "h", height, "dataCount", dataCount, "useLevel", useLevel, "sliding", sliding);
        const data = levels[Math.floor(useLevel < 0 ? 0 : useLevel > MAX_ZOOM ? MAX_ZOOM : useLevel)].filter(d => currentTimeRange[0] <= d.time && d.time <= currentTimeRange[1]);
        this.currentData = data;

        legends.forEach(leg => {
            let i = 0;
            TIMELINE_DATA_COLS.forEach(col => {
                if (col.name === leg.name) leg.index = i;
                if (col.type.indexOf("data_") !== -1) i++;
            });
        });

        const svg = areaDiv.append("svg")
            .attr("height", height)
            .attr("width", width)
            .append("g")
            .attr("transform", "translate(0, 0)");
        const xOffset = timeOffset === "data" ? timeRange[0] : timeOffset === "range" ? currentTimeRange[0] : 0;
        const x = d3.scaleTime()
            .domain([currentTimeRange[0] - xOffset, currentTimeRange[1] - xOffset])
            .range([margins[3], width - margins[1]]);

        let yMax = 0.1;
        if (!valueRange) {
            if (!sliding) {
                legends.forEach(leg => {
                    yMax = d3.max([yMax, 1.1 * d3.max(data, d => Math.abs(d.values[leg.index]))])
                })
                this.yMax = yMax;
            } else {
                yMax = this.yMax;
            }
        }

        const y = d3.scaleLinear()
            .domain(valueRange || [-yMax, yMax])
            .range([height - margins[2], margins[0]]);

        const legendSvg = d3.select(`#${graphID}-legend`)
            .append("svg")
            .attr("width", width)
            .attr("height", 32)
        const legendG = legendSvg
            .selectAll('g')
            .data(legends)
            .enter()
            .append('g')
            .attr("class", "legends")

        legendG.append('rect') // 凡例の色付け四角
            .attr("x", 0)
            .attr("y", 10)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", (leg, i) => leg.color || defaultStrokeColors(i)) // 色付け

        legendG.append('text')  // 凡例の文言
            .attr("x", 20)
            .attr("y", 20)
            .text((leg, i) => leg.name || `Legend ${i + 1}`)
            //.attr("class", "textselected")
            .style("text-anchor", "start")
        //.style("font-size", 15)

        const padding = 20;
        legendG.attr("transform", (_, i) => {
            return "translate(" + (d3.sum(legends, (_, j) => {
                if (j < i) {
                    return legendG._groups[0][j].getBBox().width;   // 各凡例の横幅サイズ取得
                } else {
                    return 0;
                }
            }) + padding * i) + ",0)";
        });
        legendSvg.attr("width", () => d3.sum(legends, (_, i) => legendG._groups[0][i].getBBox().width + padding) - padding)

        svg.append("g")
            .selectAll("rect")
            .data(timeranges)
            .enter()
            .append("rect")
            .attr("x", d => x(d.timeRange[0] - xOffset))
            .attr("y", margins[0])
            .attr("width", d => x(d.timeRange[1]) - x(d.timeRange[0]))
            .attr("height", height - margins[0] - margins[2])
            .attr("fill", d => d.color)
            .attr("opacity", 0.5)

        svg.append("g")
            .selectAll("rect")
            .data(timepoints)
            .enter()
            .append("rect")
            .attr("x", d => x(d.time - xOffset))
            .attr("y", margins[0])
            .attr("width", 1)
            .attr("height", height - margins[0] - margins[2])
            .attr("fill", "yellow")

        svg.append("g")
            .selectAll("text")
            .data(timeranges)
            .enter()
            .append("text")
            .attr("text-anchor", "start")
            .attr("font-size", 10)
            .attr("x", d => x(d.timeRange[0] - xOffset) + rangeLabelOffset)
            .attr("y", height - margins[2] - rangeLabelOffset)
            .text(d => d.name)

        legends.forEach((leg, index) => {
            const path = svg.append("path");
            let line = d3.line().x(d => x(d.time - xOffset)).y(d => y(d.values[leg.index]));
            path.datum(data).attr("fill", "none").attr("stroke", leg.color || defaultStrokeColors(index)).attr("d", line)
        });

        svg.append("g")
            .append("rect")
            .attr("class", "bg-white")
            .attr("x", 0)
            .attr("y", height - margins[2] + 6)  // 6px for axis
            .attr("width", width)
            .attr("height", margins[2] - 6)

        svg.append("g")
            .append("rect")
            .attr("class", "bg-white")
            .attr("x", 0)
            .attr("y", 0)  // 6px for axis
            .attr("width", margins[3] - 6)
            .attr("height", height)

        svg.append("g")
            .append("rect")
            .attr("class", "bg-white")
            .attr("x", width - margins[1])
            .attr("y", 0)  // 6px for axis
            .attr("width", margins[1])
            .attr("height", height)


        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margins[2]) + ")")
            .call(d3.axisBottom(x).tickFormat((d) =>
                xOffset !== 0
                    ? moment(d).utc().format(timeFormat || DEFAULT_TIME_FORMAT)
                    : moment(d).format(timeFormat || DEFAULT_TIME_FORMAT)
            ))

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (margins[3]) + ", 0)")
            .call(d3.axisLeft(y))

        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", margins[3] + ((width - margins[1] - margins[3]) / 2))
            .attr("y", height - (margins[2] / 4))
            .text("Time");

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("x", - margins[0] - ((height - margins[0] - margins[2]) / 2))
            .attr("y", margins[3] / 8)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text(yLabel || "Value");

        if (!sliding) {
            const tooltip = areaDiv.append("div").attr("class", "tooltip");

            svg.append("g")
                .selectAll("rect")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", d => x(d.time - xOffset))
                .attr("y", margins[0])
                .attr("width", 1)
                .attr("height", height - margins[0] - margins[2])
                .attr("fill", "transparent")
                .attr("class", "bar")
                .on("mouseover", (_, i) => tooltip
                    .style("visibility", "visible")
                    .html(this.createTooltipTable(i, Math.floor(useLevel < 0 ? 0 : useLevel > MAX_ZOOM ? MAX_ZOOM : useLevel)))
                )
                .on("mousemove", () => tooltip
                    .style("top", (d3.event.pageY + 10) + "px")
                    .style("left", (d3.event.pageX + 5) + "px")
                )
                .on("mouseout", () => tooltip.style("visibility", "hidden"))
        }

        window.addEventListener("keydown", (e) => {
            switch (e.keyCode) {
                case 17:
                    function brushed() {
                        if (!d3.event.selection) return;
                        const x0 = x.invert(d3.event.selection[0][0]);
                        const y1 = y.invert(d3.event.selection[0][1]);
                        const x1 = x.invert(d3.event.selection[1][0]);
                        const y0 = y.invert(d3.event.selection[1][1]);
                        console.log(x0, y0, x1, y1);
                        appSetState({ currentTimeRange: [x0.getTime() + xOffset, x1.getTime() + xOffset] });
                        _self.setState({ valueRange: [y0, y1] });
                    }
                    const brush = d3.brush()
                        .extent([
                            [margins[1], margins[0]],
                            [width - margins[3], height - margins[2]]
                        ])
                        .on("end", brushed);
                    svg.append("g")
                        .attr("id", `${graphID}-brush`)
                        .call(brush)
                    break;
                case 27:
                    console.log("ESC");
                    d3.select(`#${graphID}-brush`).remove();
                    break;
                default:
                    break;
            }
        });
    }

    clearGraph() {
        const { graphID } = this.state;
        d3.select(`#${graphID}-area`).selectAll("*").remove();
        d3.select(`#${graphID}-legend`).selectAll("*").remove();
    }

    createTooltipTable(index, useLevel) {
        const { legends, timeRange, currentTimeRange, timeFormat, timeOffset } = this.props;
        const data = this.currentData;
        const lines = legends.map((leg, i) => `<tr><td class="leg" style="color: ${leg.color || defaultStrokeColors(i)}">${leg.name}</td><td class="val">${data[index].values[leg.index].toFixed(6)}</td></tr>`).join('');
        const xOffset = timeOffset === "data" ? timeRange[0] : timeOffset === "range" ? currentTimeRange[0] : 0;
        const date = new Date(data[index].time - xOffset);
        const timeStr = xOffset !== 0
            ? moment(date).utc().format((timeFormat || DEFAULT_TIME_FORMAT) + ".SSS")
            : moment(date).format((timeFormat || DEFAULT_TIME_FORMAT) + ".SSS");
        return `<table class="mini-data"><tr><th class="leg">Time</th><td class="val">${timeStr}</td></tr>${lines}</table>`;
    }

    expandValue() {
        const { valueRange } = this.state;
        if (valueRange) {
            const center = (valueRange[0] + valueRange[1]) / 2;
            this.setState({
                valueRange: [
                    (valueRange[0] + center) / 2,
                    (center + valueRange[1]) / 2,
                ]
            })
        } else {
            const { yMax } = this;
            this.setState({ valueRange: [-yMax / 2, yMax / 2] });
        }
    }

    shrinkValue() {
        const { valueRange } = this.state;
        if (valueRange) {
            const delta = (valueRange[1] - valueRange[0]) / 2;
            this.setState({
                valueRange: [
                    valueRange[0] - delta,
                    valueRange[1] + delta,
                ]
            })
        } else {
            const { yMax } = this;
            this.setState({ valueRange: [-yMax * 2, yMax * 2] });
        }
    }

    fitValue() {
        const { legends } = this.props;
        const data = this.currentData;
        let yMax = -100, yMin = 100;
        legends.forEach(leg => {
            yMax = d3.max([yMax, 1.1 * d3.max(data, d => d.values[leg.index])])
            yMin = d3.min([yMin, 1.1 * d3.min(data, d => d.values[leg.index])])
        })
        this.setState({ valueRange: [yMin, yMax] });
    }

    render() {
        const { graphID, showControl } = this.state;
        const { title } = this.props;
        const setState = this.setState.bind(this);
        return (
            <div className="timeline-data-graph-root" id={`${graphID}-root`}>
                <div className="timeline-data-graph-title" id={`${graphID}-title`}>
                    {title || "Graph"}
                    {showControl ?
                        <div className="timeline-data-graph-control" id={`${graphID}-control`}>
                            <button type="button" className="btn btn-sm btn-danger" onClick={() => setState({ valueRange: null })}>V</button>
                            <button type="button" className="btn btn-sm btn-success" onClick={() => this.expandValue()}>V+</button>
                            <button type="button" className="btn btn-sm btn-primary" onClick={() => this.shrinkValue()}>V-</button>
                            <button type="button" className="btn btn-sm btn-secondary" onClick={() => this.fitValue()}>[V]</button>
                        </div>
                        : null}
                </div>
                <div className="timeline-data-graph-area" id={`${graphID}-area`}>
                </div>
                <div className="timeline-data-graph-legend" id={`${graphID}-legend`}>
                </div>
            </div>
        );
    }
}

export default SensorDataGraph;
