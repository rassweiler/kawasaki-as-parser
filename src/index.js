import fs from "fs";
import { SlowBuffer } from "buffer";

export const RobotTypes = {
	SPOT: "Spot",
	MH: "MH",
	NCMH: "NC-MH",
	SPOTMH: "Spot-MH",
	VISION: "Vision-MH",
	MIG: "Mig",
	NC: "NC Locator"
};

class KawasakiParser {
	constructor() {
		this.data;
		this.filePath;
		this.controller;
	}
	init = async filePath => {
		this.filePath = filePath;
		let rawData = await this.readFile(filePath);
		this.data = await this.parseRawData(rawData);
	};
	readFile = async filePath => {
		this.filePath = filePath;
		return fs.promises.readFile(filePath, "utf8");
	};
	parseRawData = async rawData => {
		this.data = rawData.split("\n");
		for (var i = 0; i < this.data.length; ++i) {
			this.data[i] = this.data[i].trim();
		}
		return this.data;
	};
	parseRobotType = async data => {
		for (var i = 0; i < data.length; ++i) {
			if (data[i].startsWith("ZROBOT.TYPE")) {
				var info = {};
				let line = data[i].split(" ").filter(Boolean);
				info.robotType = parseInt(line[3]);
				info.robotModel = line[6].split("-")[0];
				return info;
			}
		}
	};
	parseRobotNumber = async data => {
		for (var i = 0; i < data.length; ++i) {
			if (data[i].startsWith("ZSYSTEM")) {
				let line = data[i].split(" ").filter(Boolean);
				return parseInt(line[1]);
			}
		}
		throw new Error("Unable to locate robot numbers");
	};
	parseRobotComments = async data => {
		for (var i = 0; i < data.length; ++i) {
			if (data[i] === ".SIG_NAME_LANG2") {
				++i;
				let comments = { outputs: [], inputs: [] };
				while (data[i] != ".END") {
					let line = data[i].split(" ").filter(Boolean);
					if (line[0].slice(0, 4) === "N_OX") {
						let output = { signal: -1, comment: "" };
						output.signal = parseInt(line[0].slice(4));
						output.comment = data[i].substring(
							data[i].indexOf('"') + 1,
							data[i].lastIndexOf('"')
						);
						output.comment === '"' ? (output.comment = "") : null;
						comments.outputs = [...comments.outputs, output];
					} else if (line[0].slice(0, 4) === "N_WX") {
						let input = { signal: -1, comment: "" };
						input.signal = parseInt(line[0].slice(4));
						input.comment = data[i].substring(
							data[i].indexOf('"') + 1,
							data[i].lastIndexOf('"')
						);
						input.comment === '"' ? (input.comment = "") : null;
						comments.inputs = [...comments.inputs, input];
					}
					++i;
				}
				if (comments.inputs.length > 0) {
					return comments;
				} else {
					throw new Error(`Input or output arrays are empty`);
				}
			}
		}
		throw new Error("Unable to locate robot numbers");
	};
	parseNCTable = async data => {
		let ncs = 64;
		for (var i = 0; i < data.length; ++i) {
			if (data[i].startsWith("MAT_TBL[1]")) {
				let mh = [];
				let start = i;
				let end = start + ncs * 2;
				for (let startIndex = start; startIndex < end; ++startIndex) {
					let nc = { joints: [], comment: "" };
					let line = data[startIndex].split(" ").filter(Boolean);
					line.shift();
					for (let j = 0; j < 5; ++j) {
						nc.joints = [...nc.joints, parseFloat(line[j])];
					}
					startIndex++;
					nc.comment = data[startIndex].split(/ (.+)/)[1];
					mh = [...mh, nc];
				}
				if (mh.length > 0) {
					return mh;
				} else {
					throw new Error("MH NC array is empty");
				}
			}
		}
		throw new Error("Unable to locate robot numbers");
	};
	parseRobotTCPCOG = async (data, robot) => {
		let target = `.AUXDATA${robot > 1 ? robot : ""}`;
		let maxTools = 9;
		for (var i = 0; i < data.length; ++i) {
			if (data[i].startsWith(target)) {
				while (data[i] != ".END") {
					if (data[i].startsWith("TOOL1")) {
						let start = i;
						let end = start + maxTools * 2;
						let tools = [];
						for (let t = start; t < end; ++t) {
							let tool = { tcp: {}, cog: {} };
							let line = data[t].split(" ").filter(Boolean);
							line.shift();
							tool.tcp.x = parseFloat(line[0]);
							tool.tcp.y = parseFloat(line[1]);
							tool.tcp.z = parseFloat(line[2]);
							tool.tcp.rx = parseFloat(line[3]);
							tool.tcp.ry = parseFloat(line[4]);
							tool.tcp.rz = parseFloat(line[5]);
							++t;
							line = data[t].split(" ").filter(Boolean);
							line.shift();
							tool.cog.weight = parseFloat(line[0]);
							tool.cog.x = parseFloat(line[1]);
							tool.cog.y = parseFloat(line[2]);
							tool.cog.z = parseFloat(line[3]);
							tools = [...tools, tool];
						}
						if (tools.length > 1) {
							return tools;
						} else {
							throw new Error(`Tool array is empty ${tools}`);
						}
					}
					++i;
				}
			}
		}
		throw new Error(`Unable to locate robot tool information in ${target}`);
	};
}

export default KawasakiParser;
