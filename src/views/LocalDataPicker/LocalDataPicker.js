import React, { Component } from 'react'
import './style.css'
import { createID } from '../../utils/hash';
import { parseTimelineDataText, parseTimepointsDataText, parseTimerangesDataText } from '../../utils/parser';

const readAsText = file => {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => { resolve(reader.result); };
    });
};

class LocalDataPicker extends Component {

    constructor(props) {
        super(props)
        this.state = {
            pickerID: createID(8),
            fileName: "センサデータを選択...",
        }
        this.handleFileChange = this.handleFileChange.bind(this);
        this.fileInput = React.createRef();
    }

    handleFileChange(event) {
        event.preventDefault();
        const setState = this.setState.bind(this);
        const { appSetState } = this.props;
        setState({
            fileName: "Loading...",
        });
        (async () => {
            if (this.fileInput.current.files && this.fileInput.current.files[0]) {
                const { name } = this.fileInput.current.files[0];
                const content = await readAsText(this.fileInput.current.files[0]);
                const lines = content.split(/\n/).filter(v => v !== '');
                // 内容表示
                if (name.indexOf("timeline") !== -1) {
                    const levels = parseTimelineDataText(lines);
                    appSetState({
                        levels,
                        timeRange: [levels[0][0].time, levels[0][levels[0].length - 1].time],
                        currentTimeRange: [levels[0][0].time, levels[0][levels[0].length - 1].time],
                    })
                }
                if (name.indexOf("timepoints") !== -1) {
                    const timepoints = parseTimepointsDataText(lines);
                    appSetState({ timepoints })
                }
                if (name.indexOf("timeranges") !== -1) {
                    const timeranges = parseTimerangesDataText(lines);
                    appSetState({ timeranges })
                }
                setState({
                    fileName: `${this.fileInput.current.files[0].name} is loaded.`,
                })
            }
        })();
    }

    render() {
        const { pickerID, fileName } = this.state;
        return (
            <div className="data-picker-root" id={`${pickerID}-root`}>
                <div className="form-file d-flex-box">
                    <input type="file" id={`${pickerID}-input-file`} accept=".txt,.csv" className="form-file-input" ref={this.fileInput} onChange={this.handleFileChange} />
                    <label className="form-file-label" htmlFor={`${pickerID}-input-file`}>
                        <span className="form-file-text">{fileName}</span>
                        <span className="form-file-button"><i className="far fa-folder-open"></i></span>
                    </label>
                </div>
            </div>
        );
    }
}

export default LocalDataPicker;
