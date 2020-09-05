import React, { Component } from 'react';
import './App.css';
import SensorDataGraph from './views/SensorDataGraph';
import LocalDataPicker from './views/LocalDataPicker';
import DataPicker from './views/DataPicker';
import TimePicker from './views/TimePicker';
import { DEFAULT_TIME_FORMAT } from './utils/const';
import TimeFormat from './views/TimeFormat';

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      levels: [[]],
      timepoints: [],
      timeranges: [],
      timeRange: [1600000000000, 1600001000000],
      currentTimeRange: [1600000000000, 1600001000000],
      sliding: false,
      timeFormat: DEFAULT_TIME_FORMAT,
      timeOffset: 0,
    }
  }

  render() {
    const setState = this.setState.bind(this);
    const { timeRange, currentTimeRange, levels, sliding, timeFormat, timeOffset, timepoints, timeranges } = this.state;
    return (
      <div className="App">
        <div className="header-bar container">
          <div className="row">
            <div className="col-4">
              <DataPicker
                appSetState={setState}
              />
            </div>
            <div className="col-4">
              <LocalDataPicker
                appSetState={setState}
              />
            </div>
            <div className="col-4">
              <TimeFormat
                appSetState={setState}
              />
            </div>
          </div>

        </div>
        <div className="graph-view">
          <SensorDataGraph
            appSetState={setState}
            title="Acceleration"
            legends={[
              { name: "X axis", color: "#006EFF" },
              { name: "Y axis", color: "#FF401F" },
              { name: "Z axis", color: "#00EB0C" },
            ]}
            yLabel="Acceleration [G]"
            timeRange={timeRange}
            currentTimeRange={currentTimeRange}
            levels={levels}
            sliding={sliding}
            timeFormat={timeFormat}
            timeOffset={timeOffset}
            timepoints={timepoints}
            timeranges={timeranges}
          />
        </div>
        <div className="time-picker">
          <TimePicker
            appSetState={setState}
            timeRange={timeRange}
            currentTimeRange={currentTimeRange}
            timeOffset={timeOffset}
            timeFormat={timeFormat}
          />
        </div>
      </div>
    );
  }
}

export default App;
