export const RobotTypes = {
	8: "Spot",
	7: "MH",
	11: "NC MH",
	96: "Spot-MH",
	99: "Vision-MH",
	98: "Mig",
	97: "NC Locator"
};

class KawasakiParser {
	constructor() {}

	static getControllerObject = async rawStringData => {
		let parsedControllerData, numberOfRobots;
		try {
			parsedControllerData = await this.getRobotDataStringArray(
				rawStringData
			);
			numberOfRobots = await this.getNumberOfRobotsInController(
				parsedControllerData
			);
		} catch (error) {
			throw error;
		}
		let controllerObject = { robots: [] };
		for (let index = 1; index <= numberOfRobots; ++index) {
			let results = await Promise.all([
				this.getRobotInformationObject(parsedControllerData, index),
				this.getRobotTCPCOGArray(parsedControllerData, index),
				this.getRobotInstallPositionObject(parsedControllerData, index),
				this.getRobotJointLimitArray(parsedControllerData, index),
				this.getRobotVSFLinkArray(parsedControllerData, index),
				this.getRobotVSFAreaObject(parsedControllerData, index),
				this.getRobotVSFToolSphereArray(parsedControllerData, index),
				this.getRobotVSFToolBoxArray(parsedControllerData, index)
			]);
			let robot = {
				...results[0],
				tools: results[1],
				installPosition: results[2],
				softLimits: results[3],
				vsf: {
					...results[5],
					linkData: results[4],
					toolSpheres: results[6],
					toolBoxes: results[7]
				}
			};
			controllerObject.robots = [...controllerObject.robots, robot];
		}
		if (controllerObject.robots[0].robotType === RobotTypes.NCMH) {
			try {
				controllerObject.ncTable = await this.getNCTableArray(
					parsedControllerData
				);
			} catch (error) {
				controllerObject.ncTable = [];
				console.log("KAP NC Table Error:", error);
			}
		}
		try {
			let comments = await this.getRobotIOCommentsObject(
				parsedControllerData
			);
			controllerObject = { ...controllerObject, ...comments };
		} catch (error) {
			console.log("KAP Comment Error:", error);
		}

		return controllerObject;
	};

	static getRobotDataStringArray = async rawControllerString => {
		this.parsedControllerData = rawControllerString.split("\n");

		//AS files often have extra characters, must trim all lines.
		for (var i = 0; i < this.parsedControllerData.length; ++i) {
			this.parsedControllerData[i] = this.parsedControllerData[i].trim();
		}
		return this.parsedControllerData;
	};

	static getRobotInformationObject = async (
		parsedControllerData,
		robotNumber
	) => {
		for (var i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i] === `.ROBOTDATA${robotNumber}`) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("ZROBOT.TYPE")) {
						var info = {};
						let line = parsedControllerData[i].split(" ").filter(Boolean);
						info.robotType = parseInt(line[3]);
						info.robotModel = line[6].split("-")[0];
						return info;
					}
					++i;
				}
			}
		}
	};

	static getNumberOfRobotsInController = async parsedControllerData => {
		for (var i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith("ZSYSTEM")) {
				let line = parsedControllerData[i].split(" ").filter(Boolean);
				return parseInt(line[1]);
			}
		}
		throw new Error("Unable to locate number of robots");
	};

	static getRobotIOCommentsObject = async parsedControllerData => {
		for (var i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i] === ".SIG_NAME_LANG2") {
				++i;
				let comments = { outputs: [], inputs: [] };
				while (parsedControllerData[i] != ".END") {
					let line = parsedControllerData[i].split(" ").filter(Boolean);
					if (line[0].slice(0, 4) === "N_OX") {
						let output = { signal: -1, comment: "" };
						output.signal = parseInt(line[0].slice(4));
						output.comment = parsedControllerData[i].substring(
							parsedControllerData[i].indexOf('"') + 1,
							parsedControllerData[i].lastIndexOf('"')
						);
						output.comment === '"' ? (output.comment = "") : null;
						comments.outputs = [...comments.outputs, output];
					} else if (line[0].slice(0, 4) === "N_WX") {
						let input = { signal: -1, comment: "" };
						input.signal = parseInt(line[0].slice(4));
						input.comment = parsedControllerData[i].substring(
							parsedControllerData[i].indexOf('"') + 1,
							parsedControllerData[i].lastIndexOf('"')
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

	static getNCTableArray = async parsedControllerData => {
		let ncs = 64;
		for (var i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith("MAT_TBL[1]")) {
				let mh = [];
				let start = i;
				let end = start + ncs * 2;
				for (let startIndex = start; startIndex < end; ++startIndex) {
					let nc = { joints: [], comment: "" };
					let line = parsedControllerData[startIndex]
						.split(" ")
						.filter(Boolean);
					line.shift();
					for (let j = 0; j < 5; ++j) {
						nc.joints = [...nc.joints, parseFloat(line[j])];
					}
					startIndex++;
					nc.comment = parsedControllerData[startIndex].split(/ (.+)/)[1];
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

	static getRobotTCPCOGArray = async (parsedControllerData, robotNumber) => {
		let target = `.AUXDATA${robotNumber > 1 ? robotNumber : ""}`;
		let maxTools = 9;
		for (var i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("TOOL1")) {
						let start = i;
						let end = start + maxTools * 2;
						let tools = [];
						for (let t = start; t < end; ++t) {
							let tool = { tcp: {}, cog: {} };
							let line = parsedControllerData[t]
								.split(" ")
								.filter(Boolean);
							line.shift();
							tool.tcp.x = parseFloat(line[0]);
							tool.tcp.y = parseFloat(line[1]);
							tool.tcp.z = parseFloat(line[2]);
							tool.tcp.rx = parseFloat(line[3]);
							tool.tcp.ry = parseFloat(line[4]);
							tool.tcp.rz = parseFloat(line[5]);
							++t;
							line = parsedControllerData[t].split(" ").filter(Boolean);
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

	static getRobotInstallPositionObject = async (
		parsedControllerData,
		robot
	) => {
		let target = `.VSFDATA${robot}`;
		for (var i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i] === target) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("SYS_BASE")) {
						const line = parsedControllerData[i]
							.split(" ")
							.filter(Boolean);
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

	static getRobotJointLimitArray = async (
		parsedControllerData,
		robotNumber
	) => {
		const target1 = `.AUXDATA${robotNumber > 1 ? robotNumber : ""}`;
		const target2 = `.ROBOTDATA${robotNumber}`;
		let limits = [];
		for (var i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target2)) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("ZULIMIT")) {
						let max = parsedControllerData[i].split(" ").filter(Boolean);
						max.shift();
						max.pop();
						let min = parsedControllerData[i + 1]
							.split(" ")
							.filter(Boolean);
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
			if (parsedControllerData[i].startsWith(target1)) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("UP-LIM")) {
						let upper = parsedControllerData[i]
							.split(" ")
							.filter(Boolean);
						upper.shift();
						let lower = parsedControllerData[i + 1]
							.split(" ")
							.filter(Boolean);
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

	static getRobotVSFLinkArray = async (parsedControllerData, robotNumber) => {
		const target = `.VSFDATA${robotNumber}`;
		const params = 8;
		for (var i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("VSF_ARMPARAM2")) {
						let links = [];
						for (let index = 0; index < params; ++index) {
							let link = {};
							let line = parsedControllerData[i + index]
								.split(" ")
								.filter(Boolean);
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

	static getRobotVSFAreaObject = async (parsedControllerData, robotNumber) => {
		if (robotNumber > 1) {
			return {};
		}
		const target = `.VSFDATA${robotNumber}`;
		const areas = 9;
		for (var i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("VSF_AREA1")) {
						let vsf = {};
						let line = parsedControllerData[i].split(" ").filter(Boolean);
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
							let line = parsedControllerData[i + index]
								.split(" ")
								.filter(Boolean);
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

	static getRobotVSFToolSphereArray = async (
		parsedControllerData,
		robotNumber
	) => {
		const target = `.VSFDATA${robotNumber}`;
		const toolnum = 9;
		for (var i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("VSF_TOOLSP10")) {
						let tools = [];
						for (let index = 0; index < toolnum; ++index) {
							let line = parsedControllerData[i + index * 2]
								.split(" ")
								.filter(Boolean);
							let line2 = parsedControllerData[i + index * 2]
								.split(" ")
								.filter(Boolean);
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

	static getRobotVSFToolBoxArray = async (
		parsedControllerData,
		robotNumber
	) => {
		const target = `.VSFDATA${robotNumber}`;
		const toolnum = 9;
		for (var i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				let tools = [];
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("VSF_TOOLBOX1 ")) {
						for (let index = 0; index < toolnum; ++index) {
							let line = parsedControllerData[i + index]
								.split(" ")
								.filter(Boolean);
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
					if (parsedControllerData[i].startsWith("VSF_ETCSP1 ")) {
						for (let index = 0; index < toolnum; ++index) {
							let line = parsedControllerData[i + index]
								.split(" ")
								.filter(Boolean);
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

	static getRobotProgramsArray = async (parsedControllerData, robotNumber) => {
		const target = `.PROGRAM r${robotNumber}`;
		let programs = [];
		for (var i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				let program = { name: "", arguments: [], lines: [], comment: "" };
				program.comment = parsedControllerData[i].split(";")[1];
				let argument = parsedControllerData[i].match(/\((.*?)\)/);
				if (argument) {
					program.arguments = argument[1].split(",");
				}
				program.name = parsedControllerData[i].split(" ")[1].split("(")[0];
				while (parsedControllerData[i] != ".END") {
					let parsed = parsedControllerData[i];
					let line = { type: "", comment: "" };
					if (parsed.startsWith(";")) {
						line.type = "comment";
						line.comment = parsed.substr(1);
					} else {
						let comment = parsed.split(";");
						comment.length > 1 ? (line.comment = comment[1]) : null;
						line.type = "as";
						let l = parsed.split(";");
						line.comment = l[1];
						line.command = l[0];
					}
					program.lines = [...program.lines, line];
					++i;
				}
				programs = [...programs, program];
			}
		}
		if (programs.length > 0) {
			return programs;
		}
		throw new Error(
			`Unable to locate program information information in ${target}`
		);
	};

	static getControllerProgramsArray = async parsedControllerData => {
		const target = `.PROGRAM`;
		let programs = [];
		for (var i = 0; i < parsedControllerData.length; ++i) {
			if (
				parsedControllerData[i].startsWith(target) &&
				!parsedControllerData[i].includes("_pg")
			) {
				let program = { name: "", arguments: [], lines: [], comment: "" };
				program.comment = parsedControllerData[i].split(";")[1];
				let argument = parsedControllerData[i].match(/\((.*?)\)/);
				if (argument) {
					program.arguments = argument[1].split(",");
				}
				program.name = parsedControllerData[i].split(" ")[1].split("(")[0];
				++i;
				while (parsedControllerData[i] != ".END") {
					let parsed = parsedControllerData[i];
					let line = { type: "", comment: "" };
					if (parsed.startsWith(";")) {
						line.type = "comment";
						line.comment = parsed.substr(1);
					} else if (parsed.includes(";")) {
						line.type = "as";
						let l = parsed.split(";");
						line.comment = l[1];
						line.command = l[0];
					} else {
						line.type = "as";
						line.command = parsed;
					}
					program.lines = [...program.lines, line];
					++i;
				}
				programs = [...programs, program];
			}
		}
		if (programs.length > 0) {
			return programs;
		}
		throw new Error(
			`Unable to locate program information information in ${target}`
		);
	};
}

export default KawasakiParser;
