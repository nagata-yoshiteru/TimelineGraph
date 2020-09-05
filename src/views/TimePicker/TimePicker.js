import React, { Component } from 'react'
import './style.css'
import { createID } from '../../utils/hash';
// import Slider from 'rc-slider';
import InputRange from 'react-input-range';
import { DEFAULT_TIME_FORMAT } from '../../utils/const';
import moment from 'moment';

// const Range = Slider.Range;

class TimePicker extends Component {

    constructor(props) {
        super(props)
        this.state = {
            pickerID: createID(8),
            rangeWidth: 0,
        }
        this.setCurrentTimeRange0 = this.setCurrentTimeRange0.bind(this);
        this.setCurrentTimeRange1 = this.setCurrentTimeRange1.bind(this);
        this.expandTime = this.expandTime.bind(this);
        this.shrinkTime = this.shrinkTime.bind(this);
        this.moveSlider = this.moveSlider.bind(this);
        this.sliderTimer = false;
        window.onmousewheel = (event) => {
            const { rangeWidth } = this.state;
            const { currentTimeRange, timeRange, appSetState } = this.props;
            const scrollAmount = event.wheelDelta * rangeWidth * 0.01;
            if (currentTimeRange[0] - scrollAmount < timeRange[0])
                appSetState({ currentTimeRange: [timeRange[0], timeRange[0] + rangeWidth] });
            else if (currentTimeRange[1] - scrollAmount > timeRange[1])
                appSetState({ currentTimeRange: [timeRange[1] - rangeWidth, timeRange[1]] });
            else
                appSetState({ currentTimeRange: [currentTimeRange[0] - scrollAmount, currentTimeRange[1] - scrollAmount], sliding: true });
            if (this.sliderTimer !== false) {
                clearTimeout(this.sliderTimer);
            }
            this.sliderTimer = setTimeout(() => appSetState({ sliding: false }), 200);
        }
    }

    setCurrentTimeRange0(e) {
        const { currentTimeRange, timeRange, appSetState } = this.props;
        const val = Math.max(Number(e.target.value), timeRange[0]);
        this.setState({ rangeWidth: currentTimeRange[1] - val });
        appSetState({ currentTimeRange: [val, currentTimeRange[1]] });
    }

    setCurrentTimeRange1(e) {
        const { currentTimeRange, timeRange, appSetState } = this.props;
        const val = Math.min(Number(e.target.value), timeRange[1]);
        this.setState({ rangeWidth: val - currentTimeRange[0] });
        appSetState({ currentTimeRange: [currentTimeRange[0], val] });
    }

    moveSlider(v) {
        const { appSetState } = this.props;
        this.setState({ rangeWidth: v.max - v.min });
        appSetState({ currentTimeRange: [v.min, v.max], sliding: true });
        if (this.sliderTimer !== false) {
            clearTimeout(this.sliderTimer);
        }
        this.sliderTimer = setTimeout(() => appSetState({ sliding: false }), 200);
    }

    expandTime() {
        const { currentTimeRange, appSetState } = this.props;
        const center = (currentTimeRange[0] + currentTimeRange[1]) / 2;
        appSetState({
            currentTimeRange: [
                Math.round((currentTimeRange[0] + center) / 2),
                Math.round((center + currentTimeRange[1]) / 2),
            ]
        })
    }

    shrinkTime() {
        const { currentTimeRange, appSetState } = this.props;
        const delta = (currentTimeRange[1] - currentTimeRange[0]) / 2;
        appSetState({
            currentTimeRange: [
                currentTimeRange[0] - delta,
                currentTimeRange[1] + delta,
            ]
        })
    }

    render() {
        const { /*setCurrentTimeRange0, setCurrentTimeRange1,*/ moveSlider } = this;
        const { pickerID } = this.state;
        const { timeRange, currentTimeRange, appSetState, timeFormat, timeOffset } = this.props;
        const xOffset = timeOffset === "data" ? timeRange[0] : timeOffset === "range" ? currentTimeRange[0] : 0;
        return (
            <div className="time-picker-root container" id={`${pickerID}-root`}>
                <div className="row">
                    <div className="col-3 col-lg-2">
                        {/* <input type="number" value={currentTimeRange[0]} onChange={(e) => setCurrentTimeRange0(e)} />
                        <input type="number" value={currentTimeRange[1]} onChange={(e) => setCurrentTimeRange1(e)} /> */}
                        <button type="button" className="btn btn-danger d-flex-box" onClick={() => appSetState({ currentTimeRange: timeRange })}>T</button>
                        <button type="button" className="btn btn-success d-flex-box" onClick={() => this.expandTime()}>T+</button>
                        <button type="button" className="btn btn-primary d-flex-box" onClick={() => this.shrinkTime()}>T-</button>
                    </div>
                    <div className="col">
                        <InputRange
                            draggableTrack
                            allowSameValues={false}
                            maxValue={timeRange[1]}
                            minValue={timeRange[0]}
                            onChange={v => moveSlider(v)}
                            value={{ min: currentTimeRange[0], max: currentTimeRange[1] }}
                            formatLabel={date => (xOffset !== 0
                                ? moment(date - xOffset).utc().format((timeFormat || DEFAULT_TIME_FORMAT) + ".SSS")
                                : moment(date - xOffset).format((timeFormat || DEFAULT_TIME_FORMAT) + ".SSS"))}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default TimePicker;
