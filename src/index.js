import fs from "fs";

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
		this.controller;
	}
	init = async rawStringData => {
		this.data = await this.parseRawData(rawStringData);
	};
	/** This is deprecated, this module should not take care of file IO. TODO: Remove and bump major */
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
	parseRobotType = async (data, robot) => {
		for (var i = 0; i < data.length; ++i) {
			if (data[i] === `.ROBOTDATA${robot}`) {
				while (data[i] != ".END") {
					if (data[i].startsWith("ZROBOT.TYPE")) {
						var info = {};
						let line = data[i].split(" ").filter(Boolean);
						info.robotType = parseInt(line[3]);
						info.robotModel = line[6].split("-")[0];
						return info;
					}
					++i;
				}
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
	parseRobotInstallPosition = async (data, robot) => {
		let target = `.VSFDATA${robot}`;
		let maxTools = 9;
		for (var i = 0; i < data.length; ++i) {
			if (data[i] === target) {
				while (data[i] != ".END") {
					if (data[i].startsWith("SYS_BASE")) {
						const line = data[i].split(" ").filter(Boolean);
						if (line.length < 7) {
							throw new Error("Data retrieved is missing values");
						}
						let install = {};
						install.x = parseFloat(line[1]);
						install.y = parseFloat(line[2]);
						install.z = parseFloat(line[3]);
						install.rx = parseFloat(line[4]);
						install.ry = parseFloat(line[5]);
						install.rz = parseFloat(line[6]);
						return install;
					}
					++i;
				}
			}
		}
		throw new Error(
			`Unable to locate robot install information in ${target}`
		);
	};
	parseRobotJointLimits = async (data, robot) => {
		const target1 = `.AUXDATA${robot > 1 ? robot : ""}`;
		const target2 = `.ROBOTDATA${robot}`;
		let limits = [];
		for (var i = 0; i < data.length; ++i) {
			if (data[i].startsWith(target2)) {
				while (data[i] != ".END") {
					if (data[i].startsWith("ZULIMIT")) {
						let max = data[i].split(" ").filter(Boolean);
						max.shift();
						max.pop();
						let min = data[i + 1].split(" ").filter(Boolean);
						min.shift();
						min.pop();
						for (let index = 0; index < max.length; ++index) {
							let limit = {};
							limit.max = parseFloat(max[index]);
							limit.min = parseFloat(min[index]);
							limits = [...limits, limit];
						}
					}
					++i;
				}
			}
			if (data[i].startsWith(target1)) {
				while (data[i] != ".END") {
					if (data[i].startsWith("UP-LIM")) {
						let upper = data[i].split(" ").filter(Boolean);
						upper.shift();
						let lower = data[i + 1].split(" ").filter(Boolean);
						lower.shift();
						for (let index = 0; index < upper.length; ++index) {
							limits[index].upper = parseFloat(upper[index]);
							limits[index].lower = parseFloat(lower[index]);
						}
						return limits;
					}
					++i;
				}
			}
		}
		throw new Error(
			`Unable to locate robot limit information in ${target1} or ${target2}`
		);
	};
	parseRobotVSFLink = async (data, robot) => {
		const target = `.VSFDATA${robot}`;
		const params = 8;
		for (var i = 0; i < data.length; ++i) {
			if (data[i].startsWith(target)) {
				while (data[i] != ".END") {
					if (data[i].startsWith("VSF_ARMPARAM2")) {
						let links = [];
						for (let index = 0; index < params; ++index) {
							let link = {};
							let line = data[i + index].split(" ").filter(Boolean);
							link.radius = parseFloat(line[1]) / 10;
							link.joint = parseInt(line[2]);
							link.x1 = parseFloat(line[3]) / 10;
							link.y1 = parseFloat(line[4]) / 10;
							link.z1 = parseFloat(line[5]) / 10;
							link.x2 = parseFloat(line[6]) / 10;
							link.y2 = parseFloat(line[7]) / 10;
							link.z2 = parseFloat(line[8]) / 10;
							links = [...links, link];
						}
						return links;
					}
					++i;
				}
			}
		}
		throw new Error(`Unable to locate robot link information in ${target}`);
	};
	parseRobotVSFArea = async (data, robot) => {
		const target = `.VSFDATA${robot}`;
		const areas = 9;
		for (var i = 0; i < data.length; ++i) {
			if (data[i].startsWith(target)) {
				while (data[i] != ".END") {
					if (data[i].startsWith("VSF_AREA1")) {
						let vsf = {};
						let line = data[i].split(" ").filter(Boolean);
						let area = {};
						area.enabled = parseInt(line[1]);
						area.upper = parseFloat(line[34]) / 100;
						area.lower = parseFloat(line[35]) / 100;
						area.lines = [];
						for (let l = 0; l < 8; ++l) {
							let al = {};
							al.x1 = parseFloat(line[4 * l + 2]) / 100;
							al.y1 = parseFloat(line[4 * l + 3]) / 100;
							al.x2 = parseFloat(line[4 * l + 4]) / 100;
							al.y2 = parseFloat(line[4 * l + 5]) / 100;
							area.lines = [...area.lines, al];
						}
						vsf.area = area;
						vsf.parts = [];
						for (let index = 1; index < areas; ++index) {
							let part = {};
							let line = data[i + index].split(" ").filter(Boolean);
							part.enabled = parseInt(line[1]);
							part.upper = parseFloat(line[18]) / 100;
							part.lower = parseFloat(line[19]) / 100;
							part.lines = [];
							for (let l = 0; l < 4; ++l) {
								let al = {};
								al.x1 = parseFloat(line[4 * l + 2]) / 100;
								al.y1 = parseFloat(line[4 * l + 3]) / 100;
								al.x2 = parseFloat(line[4 * l + 4]) / 100;
								al.y2 = parseFloat(line[4 * l + 5]) / 100;
								part.lines = [...part.lines, al];
							}
							vsf.parts = [...vsf.parts, part];
						}
						return vsf;
					}
					++i;
				}
			}
		}
		throw new Error(`Unable to locate vsf area information in ${target}`);
	};
	parseRobotVSFToolSpheres = async (data, robot) => {
		const target = `.VSFDATA${robot}`;
		const toolnum = 9;
		for (var i = 0; i < data.length; ++i) {
			if (data[i].startsWith(target)) {
				while (data[i] != ".END") {
					if (data[i].startsWith("VSF_TOOLSP10")) {
						let tools = [];
						for (let index = 0; index < toolnum; ++index) {
							let line = data[i + index * 2].split(" ").filter(Boolean);
							let line2 = data[i + index * 2].split(" ").filter(Boolean);
							let tool = {};
							let page1 = [];
							let page2 = [];
							for (let s = 0; s < 10; ++s) {
								let s1 = {};
								let s2 = {};
								s1.x = parseFloat(line[4 * s + 1]) / 10;
								s1.y = parseFloat(line[4 * s + 2]) / 10;
								s1.z = parseFloat(line[4 * s + 3]) / 10;
								s1.radius = parseFloat(line[4 * s + 4]) / 10;
								s2.x = parseFloat(line2[4 * s + 1]) / 10;
								s2.y = parseFloat(line2[4 * s + 2]) / 10;
								s2.z = parseFloat(line2[4 * s + 3]) / 10;
								s2.radius = parseFloat(line2[4 * s + 4]) / 10;
								page1 = [...page1, s1];
								page2 = [...page2, s2];
							}
							tool.spheres = [...page1, ...page2];
							tools = [...tools, tool];
						}
						return tools;
					}
					++i;
				}
			}
		}
		throw new Error(
			`Unable to locate vsf tool sphere information in ${target}`
		);
	};
	parseRobotVSFToolBoxes = async (data, robot) => {
		const target = `.VSFDATA${robot}`;
		const toolnum = 9;
		for (var i = 0; i < data.length; ++i) {
			if (data[i].startsWith(target)) {
				let tools = [];
				while (data[i] != ".END") {
					if (data[i].startsWith("VSF_TOOLBOX1 ")) {
						for (let index = 0; index < toolnum; ++index) {
							let line = data[i + index].split(" ").filter(Boolean);
							let tool = {};
							tool.rotation = parseFloat(line[1]) / 100;
							tool.x = parseFloat(line[2]) / 100;
							tool.y = parseFloat(line[3]) / 100;
							tool.z = parseFloat(line[4]) / 100;
							tool.depth = parseFloat(line[5]) / 100;
							tool.width = parseFloat(line[6]) / 100;
							tool.height = parseFloat(line[7]) / 100;
							tools = [...tools, tool];
						}
					}
					if (data[i].startsWith("VSF_ETCSP1 ")) {
						for (let index = 0; index < toolnum; ++index) {
							let line = data[i + index].split(" ").filter(Boolean);
							tools[index].spheres = [];
							let s1 = {};
							let s2 = {};
							s1.radius = parseFloat(line[1]) / 10;
							s1.x = parseFloat(line[2]) / 10;
							s1.y = parseFloat(line[3]) / 10;
							s1.z = parseFloat(line[4]) / 10;
							s2.radius = parseFloat(line[5]) / 10;
							s2.x = parseFloat(line[6]) / 10;
							s2.y = parseFloat(line[7]) / 10;
							s2.z = parseFloat(line[8]) / 10;
							tools[index].spheres = [...tools[index].spheres, s1, s2];
						}
						return tools;
					}
					++i;
				}
			}
		}
		throw new Error(
			`Unable to locate vsf tool sphere information in ${target}`
		);
	};
}

export default KawasakiParser;
