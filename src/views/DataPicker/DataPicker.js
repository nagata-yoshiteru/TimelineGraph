import React, { Component } from 'react'
import './style.css'
import { createID } from '../../utils/hash';
import { INPUT_DATA_LIST, APP_ROOT } from '../../utils/const';
import { parseTimelineDataText, parseTimepointsDataText, parseTimerangesDataText } from '../../utils/parser';
const request = require('request');

class DataPicker extends Component {

    constructor(props) {
        super(props)
        this.state = {
            pickerID: createID(8),
        }
        this.loadData = this.loadData.bind(this);
        this.handleFile = this.handleFile.bind(this);
        this.fileInput = React.createRef();
    }

    handleFile(content, type) {
        const lines = content.split(/\n/).filter(v => v !== '');
        // 内容表示
        if (type === "timeline") {
            const levels = parseTimelineDataText(lines);
            this.props.appSetState({
                levels,
                timeRange: [levels[0][0].time, levels[0][levels[0].length - 1].time],
                currentTimeRange: [levels[0][0].time, levels[0][levels[0].length - 1].time],
            })
        }
        if (type === "timepoints") {
            const timepoints = parseTimepointsDataText(lines);
            this.props.appSetState({ timepoints })
        }
        if (type === "timeranges") {
            const timeranges = parseTimerangesDataText(lines);
            this.props.appSetState({ timeranges })
        }
    }

    loadData(index) {
        const _self = this;
        if (index === 0) return;
        console.log("Loading...");
        if (INPUT_DATA_LIST[index].timeline) {
            request.get(`${APP_ROOT}/data/${INPUT_DATA_LIST[index].timeline}`, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    _self.handleFile(body, "timeline");
                } else {
                    console.warn(error);
                    window.alert("Failed to load Timeline data (See browser console for detail.)");
                }
            });
        }
        if (INPUT_DATA_LIST[index].timepoints) {
            request.get(`${APP_ROOT}/data/${INPUT_DATA_LIST[index].timepoints}`, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    console.log(body);
                    _self.handleFile(body, "timepoints");
                } else {
                    console.warn(error);
                    window.alert("Failed to load Timepoints data (See browser console for detail.)");
                }
            });
        }
        if (INPUT_DATA_LIST[index].timeranges) {
            request.get(`${APP_ROOT}/data/${INPUT_DATA_LIST[index].timeranges}`, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    console.log(body);
                    _self.handleFile(body, "timeranges");
                } else {
                    console.warn(error);
                    window.alert("Failed to load Timeranges data (See browser console for detail.)");
                }
            });
        }
    }

    render() {
        const { pickerID } = this.state;
        const dataOptions = INPUT_DATA_LIST.map((data, index) => <option value={index} key={index}>{data.name}</option>);
        return (
            <div className="data-picker-root" id={`${pickerID}-root`}>
                <select className="form-select" id={`${pickerID}-data-select`} onChange={(e) => this.loadData(e.target.value)}>
                    {dataOptions}
                </select>
            </div>
        );
    }
}

export default DataPicker;
