import { MAX_ZOOM, DEFAULT_COLORS, TIMELINE_DATA_COLS, TIMELINE_DATA_SPLIT, TIMERANGE_DATA_SPLIT, TIMEPOINT_DATA_SPLIT } from './const';

export const parseTimelineDataText = lines => {
    const keys = [];
    let time_sec_col = -1, time_msec_col = -1;
    TIMELINE_DATA_COLS.forEach((col, index) => {
        if (col.type.indexOf("data_") !== -1) keys.push(index);
        if (col.type === "time_unix_sec") time_sec_col = index;
        if (col.type === "time_unix_millisec") time_msec_col = index;
    });
    const table = lines.map(line => line.replace("\r", '').replace("\n", '').split(TIMELINE_DATA_SPLIT));
    const levels = [];  // multi zoom level data
    levels.push(table.map(line => { 
        const time = Number(time_sec_col !== -1 ? line[time_sec_col] : 0) * 1000 + Number(time_msec_col !== -1 ? line[time_msec_col] : 0);  // create time data
        const values = keys.map(key => Number(line[key]));  // insert data whose column is specified in keys into values
        return { time, values };  // push to levels[0] (raw data level)
    }));
    for (let i = 0; i < MAX_ZOOM; i++) {
        levels.push(reduceData(levels[i]));  // Create different levels
    }
    return levels;
}

const reduceData = data => {
    const res = [], setAve = [], setSum = [];
    let index = 0;
    TIMELINE_DATA_COLS.forEach(col => {
        if (col.type === "data_number_ave") { setAve.push(index); index++; }
        if (col.type === "data_number_sum") { setSum.push(index); index++; }
    });
    for (let i = 0; i * 2 < data.length; i++) {
        const rd = JSON.parse(JSON.stringify(data[i * 2]));
        if (data[i * 2 + 1]) {
            rd.time = Math.ceil((data[i * 2].time + data[i * 2 + 1].time) / 2);
            setAve.forEach(index => {
                rd.values[index] = (data[i * 2].values[index] + data[i * 2 + 1].values[index]) / 2;
            })
            setSum.forEach(index => {
                if (Array.isArray(rd.values[index])) rd.values[index].push(...data[i * 2 + 1].values[index]);
                else rd.values[index] += data[i * 2 + 1].values[index];
            })
        }
        res.push(rd);
    }
    return res;
}

export const parseTimepointsDataText = lines => {
    const table = lines.map(line => line.replace("\r", '').replace("\n", '').split(TIMEPOINT_DATA_SPLIT));
    const timeMode = table[0][0].indexOf(".") === -1 ? 1 : 1000;
    const timepoints = table.map(line => {
        return { time: Number(line[0]) * timeMode };
    });
    return timepoints;
}

export const parseTimerangesDataText = lines => {
    const table = lines.map(line => line.replace("\r", '').replace("\n", '').split(TIMERANGE_DATA_SPLIT));
    const timeMode = table[0][0].indexOf(".") === -1 ? 1 : 1000;
    const colorList = [];
    const timepoints = table.map(line => {
        if (!line[3] || line[3] === "" || line[3].length < 2) {
            line[3] = null;
            colorList.forEach(ncPair => {
                if (ncPair.name === line[2]) line[3] = ncPair.color;
            })
            if (!line[3]) {
                const color = DEFAULT_COLORS(colorList.length % 10);
                line[3] = color;
                colorList.push({
                    name: line[2],
                    color,
                })
            }
        }
        return { timeRange: [Number(line[0]) * timeMode, Number(line[1]) * timeMode], name: line[2], color: line[3] };
    });
    return timepoints;
}
