import { scaleOrdinal, schemeCategory10 } from 'd3';

export const APP_ROOT = process.env.APP_ROOT || "http://localhost:10180";
export const MAX_ZOOM = 12;
export const DEFAULT_TIME_FORMAT = "HH:mm:ss";
export const DEFAULT_COLORS = scaleOrdinal(schemeCategory10);

// Edit below to fit for your data.
export const INPUT_DATA_LIST = [
    {
        name: "Please select the Graph Data",
        timeline: null,
        timepoints: null,
    },
    {
        name: "Sample Data",
        timeline: "sample/sample_timeline.txt",
        timepoints: "sample/sample_timepoints.csv",
        timeranges: "sample/sample_timeranges.tsv",
    },
];
export const TIMELINE_DATA_COLS = [
    {
        name: "Datetime (unix timestamp)",
        type: "time_unix_sec",
    },
    {
        name: "Datetime (millisecond)",
        type: "time_unix_millisec",
    },
    {
        name: "X axis",
        type: "data_number_ave",
    },
    {
        name: "Y axis",
        type: "data_number_ave",
    },
    {
        name: "Z axis",
        type: "data_number_ave",
    },
    {
        name: "(reserved)",
        type: "ignore",
    },
    {
        name: "Number of packets received",
        type: "data_number_sum",
    },
];
export const TIMELINE_DATA_SPLIT = / /;
export const TIMEPOINT_DATA_SPLIT = /,/;
export const TIMERANGE_DATA_SPLIT = /\t/;
