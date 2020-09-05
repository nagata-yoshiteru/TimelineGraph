import React, { Component } from 'react'
import './style.css'
import { createID } from '../../utils/hash';

class TimeFormat extends Component {

    constructor(props) {
        super(props)
        this.state = {
            pickerID: createID(8),
        }
    }

    render() {
        const { pickerID } = this.state;
        const { appSetState } = this.props;
        return (
            <div className="time-format-root container" id={`${pickerID}-root`}>
                <div className="row">
                    <div className="col-6">
                        <select className="form-select" onChange={(e) => appSetState({ timeFormat: e.target.value })} defaultValue="HH:mm:ss">
                            <option value="HH:mm:ss">時:分:秒</option>
                            <option value="X">UNIX (秒)</option>
                        </select>
                    </div>
                    <div className="col-6">
                        <select className="form-select" onChange={(e) => appSetState({ timeOffset: e.target.value })} defaultValue="0">
                            <option value="0">実時刻</option>
                            <option value="data">相対時刻 (データ)</option>
                            <option value="range">相対時刻 (選択範囲)</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    }
}

export default TimeFormat;
