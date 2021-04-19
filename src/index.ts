import {
	ControllerObjectAlias,
	IOCommentObjectAlias,
	RobotObjectAlias,
	MHTableObjectAlias,
	RobotTypeAlias,
	ToolObjectAlias,
	InstallPositionAlias,
	SoftLimitObjectAlias,
	LinkObjectAlias,
	VSFZoneObjectAlias,
	LineObjectAlias,
	ToolSphereObjectAlias,
	SphereObjectAlias,
	ToolBoxObjectAlias,
	ProgramObjectAlias,
	ProgramLineObjectAlias,
} from "./interfaces";

export default class KawasakiParser {
	/***********************************************************************
	 *	Main Entry Point
	 *
	 *	Expects a utf8 string buffer containing the contents of an as file.
	 *	Returns a promise, object of structure ControllerObjectAlias (see alias.ts)
	 ************************************************************************/
	static getControllerObject = async (
		rawStringData: string
	): Promise<ControllerObjectAlias> => {
		// Parse controller data
		let parsedControllerData: string[] = [];
		let numberOfRobots = 0;
		const controllerObject: ControllerObjectAlias = {
			controllerType: "",
			manufacturer: "Kawasaki",
			robots: [],
			ncTable: [],
			ioComments: { inputs: [], outputs: [] },
			commonPrograms: [],
			stringVars: [],
			realVars: [],
			jointVars: [],
			transVars: [],
			errors: [],
		};

		// Parse utf8 string into array of formatted strings for each line
		try {
			const data = await KawasakiParser.getRobotDataStringArray(
				rawStringData
			);
			parsedControllerData = data.data;
			controllerObject.errors.concat(data.errors);
		} catch (error) {
			controllerObject.errors.push(error);
			return controllerObject;
		}

		// Determine number of robots in controller
		try {
			const data = await KawasakiParser.getNumberOfRobotsInController(
				parsedControllerData
			);
			data.data !== 0 ? (numberOfRobots = data.data) : null;
			data.errors.length > 0
				? controllerObject.errors.concat(data.errors)
				: null;
		} catch (error) {
			controllerObject.errors.push(error);
			return controllerObject;
		}

		// Parse robot specific data
		if (numberOfRobots > 0) {
			for (let index = 1; index <= numberOfRobots; ++index) {
				const [
					robotInfo,
					robotTCP,
					robotInstall,
					robotJoint,
					robotLink,
					robotArea,
					robotSphere,
					robotBox,
					robotPrograms,
				] = await Promise.all([
					KawasakiParser.getRobotInformationObject(
						parsedControllerData,
						index
					),
					KawasakiParser.getRobotTCPCOGArray(parsedControllerData, index),
					KawasakiParser.getRobotInstallPositionObject(
						parsedControllerData,
						index
					),
					KawasakiParser.getRobotJointSoftLimitArray(
						parsedControllerData,
						index
					),
					KawasakiParser.getRobotVSFLinkArray(parsedControllerData, index),
					KawasakiParser.getRobotVSFAreaPartsObject(
						parsedControllerData,
						index
					),
					KawasakiParser.getRobotVSFToolSphereArray(
						parsedControllerData,
						index
					),
					KawasakiParser.getRobotVSFToolBoxArray(
						parsedControllerData,
						index
					),
					KawasakiParser.getRobotProgramsArray(
						parsedControllerData,
						index
					),
				]);
				const robot: RobotObjectAlias = {
					robotType: "",
					robotModel: "",
					tools: [],
					installPosition: {
						x: 0,
						y: 0,
						z: 0,
						rx: 0,
						ry: 0,
						rz: 0,
					},
					vsf: {
						area: {
							enabled: false,
							upper: 0,
							lower: 0,
							lines: [],
						},
						parts: [],
						linkData: [],
						toolSpheres: [],
						toolBoxes: [],
						softLimits: [],
					},
					spot: [],
					rac: [],
					programs: [],
				};
				robotInfo.errors.length > 0
					? controllerObject.errors.concat(robotInfo.errors)
					: null;
				robot.robotType = robotInfo.data.robotType;
				robot.robotModel = robotInfo.data.robotModel;
				robotTCP.errors.length > 0
					? controllerObject.errors.concat(robotTCP.errors)
					: null;
				robot.tools = robotTCP.data;
				robotInstall.errors.length > 0
					? controllerObject.errors.concat(robotInstall.errors)
					: null;
				robot.installPosition = robotInstall.data;
				robotJoint.errors.length > 0
					? controllerObject.errors.concat(robotJoint.errors)
					: null;
				robot.vsf.softLimits = robotJoint.data;
				robotLink.errors.length > 0
					? controllerObject.errors.concat(robotLink.errors)
					: null;
				robot.vsf.linkData = robotLink.data;
				robotLink.errors.length > 0
					? controllerObject.errors.concat(robotLink.errors)
					: null;
				robot.vsf.linkData = robotLink.data;
				robotArea.errors.length > 0
					? controllerObject.errors.concat(robotArea.errors)
					: null;
				robot.vsf.area = robotArea.data.area;
				robot.vsf.parts = robotArea.data.parts;
				robotSphere.errors.length > 0
					? controllerObject.errors.concat(robotSphere.errors)
					: null;
				robot.vsf.toolSpheres = robotSphere.data;
				robotBox.errors.length > 0
					? controllerObject.errors.concat(robotBox.errors)
					: null;
				robot.vsf.toolBoxes = robotBox.data;
				robotPrograms.errors.length > 0
					? controllerObject.errors.concat(robotPrograms.errors)
					: null;
				robot.programs = robotPrograms.data;
				/*
				const robottttttt = {
					...results[0],
					tools: results[1],
					installPosition: results[2],
					softLimits: results[3],
					vsf: {
						...results[5],
						linkData: results[4],
						toolSpheres: results[6],
						toolBoxes: results[7],
					},
					programs: results[8],
				};
				*/
				controllerObject.robots.push(robot);
			}
			if (controllerObject.robots[0].robotType === "NC") {
				try {
					const data = await KawasakiParser.getNCTableArray(
						parsedControllerData
					);
					data.errors.length > 0
						? controllerObject.errors.concat(data.errors)
						: null;
					controllerObject.ncTable = data.data;
				} catch (error) {
					controllerObject.errors.push(error);
				}
			}
		}

		// Parse controller IO comments
		try {
			const data = await KawasakiParser.getRobotIOCommentsObject(
				parsedControllerData
			);
			data.errors.length > 0
				? controllerObject.errors.concat(data.errors)
				: null;
			controllerObject.ioComments = data.data;
		} catch (error) {
			controllerObject.errors.push(error);
		}

		try {
			const data = await KawasakiParser.getControllerProgramsArray(
				parsedControllerData
			);
			data.errors.length > 0
				? controllerObject.errors.concat(data.errors)
				: null;
			controllerObject.commonPrograms = data.data;
		} catch (error) {
			controllerObject.errors.push(error);
		}
		return controllerObject;
	};

	/***********************************************************************
	 *	Parse utf8 string into array of parsed lines
	 *
	 *	Expects a utf8 string containing the contents of an as file.
	 *	Returns a promise, object of structure {data: string[], errors: string[]}
	 ************************************************************************/
	static getRobotDataStringArray = async (
		rawControllerString: string
	): Promise<{ data: string[]; errors: string[] }> => {
		const errors: string[] = [];
		let data: string[] = [];
		if (rawControllerString === "") {
			errors.push("Error: rawData is empty string");
		} else {
			const parsedControllerData = rawControllerString.split("\n");
			//AS files often have extra characters, must trim all lines.
			for (let i = 0; i < parsedControllerData.length; ++i) {
				parsedControllerData[i] = parsedControllerData[i].trim();
			}
			data = parsedControllerData;
		}

		return { data: data, errors: errors };
	};

	/***********************************************************************
	 *	Determine Number Of Robots in controller
	 *
	 *	Expects a utf8 string array containing the contents of an as file.
	 *	Returns a promise, object of structure {data: number, errors: string[]}
	 ************************************************************************/
	static getNumberOfRobotsInController = async (
		parsedControllerData: string[]
	): Promise<{ data: number; errors: string[] }> => {
		const data: { data: number; errors: string[] } = {
			data: 0,
			errors: [],
		};
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith("ZSYSTEM")) {
				const line = parsedControllerData[i].split(" ").filter(Boolean);
				try {
					data.data = parseInt(line[1]);
				} catch (error) {
					data.errors.push("Unable to parse number");
				}
				return data;
			}
		}
		data.errors.push("Unable to locate number of robots");
		return data;
	};

	/***********************************************************************
	 *	Get Human Readable Robot type from integer
	 *
	 *	Expects an integer.
	 *	Returns an object of structure {data: string, errors: string[]}
	 ************************************************************************/
	static getRobotTypeFromInt = (
		type: number
	): {
		data: RobotTypeAlias;
		errors: string[];
	} => {
		let robotType: RobotTypeAlias = "";
		const errors: string[] = [];
		if (Number.isInteger(type)) {
			switch (type) {
				case 7:
					robotType = "MH";
					break;
				case 8:
					robotType = "Spot";
					break;
				case 11:
					robotType = "NC";
					break;
				case 96:
					robotType = "Spot-MH";
					break;
				case 97:
					robotType = "Locator";
					break;
				case 98:
					robotType = "Mig";
					break;
				case 99:
					robotType = "Vision";
					break;
				case 900:
					robotType = "Hem";
					break;
				default:
					errors.push("Error: type number provided not found");
					break;
			}
		} else {
			errors.push("Error: type number provided no an integer");
		}
		return { data: robotType, errors: errors };
	};

	/***********************************************************************
	 *	Parse general robot information
	 *
	 *	Expects a utf8 string array containing the contents of an as file and a robot number.
	 *	Returns a promise, object of structure {data: {robotType: string, robotModel: string}, errors: string[]}
	 ************************************************************************/
	static getRobotInformationObject = async (
		parsedControllerData: string[],
		robotNumber: number
	): Promise<{
		data: {
			robotType: RobotTypeAlias;
			robotModel: string;
		};
		errors: string[];
	}> => {
		const data: {
			robotType: RobotTypeAlias;
			robotModel: string;
		} = {
			robotType: "",
			robotModel: "",
		};
		const errors: string[] = [];
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i] === `.ROBOTDATA${robotNumber}`) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("ZROBOT.TYPE")) {
						const line = parsedControllerData[i]
							.split(" ")
							.filter(Boolean);
						const rData = KawasakiParser.getRobotTypeFromInt(
							parseInt(line[3])
						);
						rData.errors.length > 0 ? errors.concat(rData.errors) : null;
						data.robotType = rData.data;
						data.robotModel = line[6].split("-")[0];
						return { data: data, errors: errors };
					}
					++i;
				}
				errors.push("Unable to locate ZROBOT.TYPE");
			}
		}
		errors.push("Unable to locate .ROBOTDATA");
		return { data: data, errors: errors };
	};

	/***********************************************************************
	 *	Parse controller IO comments
	 *
	 *	Expects a utf8 string array containing the contents of an as file.
	 *	Returns a promise, object of structure {data: {inputs: [], outputs: []}, errors: string[]}
	 ************************************************************************/
	static getRobotIOCommentsObject = async (
		parsedControllerData: string[]
	): Promise<{ data: IOCommentObjectAlias; errors: string[] }> => {
		const comments: IOCommentObjectAlias = {
			inputs: [],
			outputs: [],
		};
		const errors: string[] = [];
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i] === ".SIG_NAME_LANG2") {
				++i;
				while (parsedControllerData[i] != ".END") {
					const line = parsedControllerData[i].split(" ").filter(Boolean);
					if (line[0].slice(0, 4) === "N_OX") {
						const output = { signal: -1, comment: "" };
						const signal = parseInt(line[0].slice(4));
						let comment = parsedControllerData[i].substring(
							parsedControllerData[i].indexOf('"') + 1,
							parsedControllerData[i].lastIndexOf('"')
						);
						comment === '"' ? (comment = "") : null;
						typeof signal === "number"
							? (output.signal = signal)
							: errors.push("Error: Signal not a number");
						comments.outputs.push(output);
					} else if (line[0].slice(0, 4) === "N_WX") {
						const input = { signal: -1, comment: "" };
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
				if (comments.inputs.length === 0) {
					errors.push(`Input or output arrays are empty`);
				}
			}
		}
		return { data: comments, errors: errors };
	};

	/***********************************************************************
	 *	Parse controller NC table data
	 *
	 *	Expects a utf8 string array containing the contents of an as file.
	 *	Returns a promise, object of structure:
	 * {data: [{tableIndex: number, axisData: number[], comment: string}], errors: string[]}
	 ************************************************************************/
	static getNCTableArray = async (
		parsedControllerData: string[]
	): Promise<{ data: MHTableObjectAlias[]; errors: string[] }> => {
		const data: MHTableObjectAlias[] = [];
		const errors = [];
		const ncs = 64;
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith("MAT_TBL[1]")) {
				const start = i;
				const end = start + ncs * 2;
				let index = 1;
				for (let startIndex = start; startIndex < end; ++startIndex) {
					const mh: MHTableObjectAlias = {
						tableIndex: index,
						axisData: [],
						comment: "",
					};
					const line = parsedControllerData[startIndex]
						.split(" ")
						.filter(Boolean);
					line.shift();
					for (let j = 0; j < 5; ++j) {
						const val = parseFloat(line[j]);
						typeof val === "number"
							? mh.axisData.push(val)
							: errors.push("Error: NC axis value not type number");
					}
					mh.axisData.length === 0
						? errors.push(
								`Error: Axis table array is empty: Index ${index}`
						  )
						: null;
					startIndex++;
					mh.comment = parsedControllerData[startIndex].split(/ (.+)/)[1];
					data.push(mh);
					++index;
				}
				if (data.length === 0) {
					errors.push("Error: NC table array is empty");
				}
				return { data: data, errors: errors };
			}
		}
		errors.push("Error: Unable to locate NC Table Data");
		return { data: data, errors: errors };
	};

	/***********************************************************************
	 *	Parse robot TCP and COG Information
	 *
	 *	Expects a utf8 string array containing the contents of an as file and an integer for the robot number.
	 *	Returns a promise, object of structure {data: [{tcp: {}, cog: {}}], errors: string[]}
	 ************************************************************************/
	static getRobotTCPCOGArray = async (
		parsedControllerData: string[],
		robotNumber: number
	): Promise<{ data: ToolObjectAlias[]; errors: string[] }> => {
		const data: ToolObjectAlias[] = [];
		const errors = [];
		const target = `.AUXDATA${robotNumber > 1 ? robotNumber : ""}`;
		const maxTools = 9;
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("TOOL1")) {
						const start = i;
						const end = start + maxTools * 2;
						for (let t = start; t < end; ++t) {
							const tool: ToolObjectAlias = {
								tcp: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
								cog: { weight: 0, x: 0, y: 0, z: 0 },
							};
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
							data.push(tool);
						}
						if (data.length === 0) {
							errors.push("Error: Tool array is empty");
						}
						return { data: data, errors: errors };
					}
					++i;
				}
				errors.push("Error: unable to find tool information");
			}
		}
		errors.push(`Error: unable to find robot tool section for ${target}`);
		return { data: data, errors: errors };
	};

	/***********************************************************************
	 *	Parse robot installation data
	 *
	 *	Expects a utf8 string array containing the contents of an as file and an integer for the robot number.
	 *	Returns a promise, object of structure:
	 * {data: {x: number, y: number, z: number, rx: number, ry: number, rz: number}, errors: string[]}
	 ************************************************************************/
	static getRobotInstallPositionObject = async (
		parsedControllerData: string[],
		robot: number
	): Promise<{ data: InstallPositionAlias; errors: string[] }> => {
		const data: InstallPositionAlias = {
			x: 0,
			y: 0,
			z: 0,
			rx: 0,
			ry: 0,
			rz: 0,
		};
		const errors: string[] = [];
		const target = `.VSFDATA${robot}`;
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i] === target) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("SYS_BASE")) {
						const line = parsedControllerData[i]
							.split(" ")
							.filter(Boolean);
						if (line.length < 7) {
							errors.push(
								`Error: Install Data retrieved is missing values: Robot ${robot}`
							);
							return { data: data, errors: errors };
						}
						data.x = parseFloat(line[1]);
						data.y = parseFloat(line[2]);
						data.z = parseFloat(line[3]);
						data.rx = parseFloat(line[4]);
						data.ry = parseFloat(line[5]);
						data.rz = parseFloat(line[6]);
						return { data: data, errors: errors };
					}
					++i;
				}
			}
		}
		errors.push(
			`Error: Unable to locate robot install information in ${target}`
		);
		return { data: data, errors: errors };
	};

	/***********************************************************************
	 *	Parse robot joint limit data
	 *
	 *	Expects a utf8 string array containing the contents of an as file and an integer for the robot number.
	 *	Returns a promise, object of structure:
	 * {data: [{max: number, min: number, upper: number, lower: number}], errors: string[]}
	 ************************************************************************/
	static getRobotJointSoftLimitArray = async (
		parsedControllerData: string[],
		robotNumber: number
	): Promise<{ data: SoftLimitObjectAlias[]; errors: string[] }> => {
		const data: SoftLimitObjectAlias[] = [];
		const errors: string[] = [];
		const target1 = `.AUXDATA${robotNumber > 1 ? robotNumber : ""}`;
		const target2 = `.ROBOTDATA${robotNumber}`;
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target2)) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("ZULIMIT")) {
						const max = parsedControllerData[i]
							.split(" ")
							.filter(Boolean);
						max.shift();
						max.pop();
						const min = parsedControllerData[i + 1]
							.split(" ")
							.filter(Boolean);
						min.shift();
						min.pop();
						for (let index = 0; index < max.length; ++index) {
							const val: SoftLimitObjectAlias = {
								max: 0,
								min: 0,
								upper: 0,
								lower: 0,
							};
							const ma = parseFloat(max[index]);
							const mi = parseFloat(min[index]);
							typeof ma === "number" ? (val.max = ma) : null;
							typeof mi === "number" ? (val.min = mi) : null;
							data.push(val);
						}
					}
					++i;
				}
			}
			if (parsedControllerData[i].startsWith(target1)) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("UP-LIM")) {
						const upper = parsedControllerData[i]
							.split(" ")
							.filter(Boolean);
						upper.shift();
						const lower = parsedControllerData[i + 1]
							.split(" ")
							.filter(Boolean);
						lower.shift();
						for (let index = 0; index < upper.length; ++index) {
							const lo = parseFloat(lower[index]);
							const up = parseFloat(upper[index]);
							if (index <= data.length) {
								typeof lo === "number"
									? (data[index].lower = lo)
									: null;
								typeof up === "number"
									? (data[index].upper = up)
									: null;
							} else {
								errors.push(
									`Error: Upper/Lower array larger than min/max array: Index ${index}`
								);
							}
						}
					}
					++i;
				}
			}
		}
		errors.push(
			`Unable to locate robot limit information in ${target1} or ${target2}`
		);
		return { data: data, errors: errors };
	};

	/***********************************************************************
	 *	Parse robot link data
	 *
	 *	Expects a utf8 string array containing the contents of an as file and an integer for the robot number.
	 *	Returns a promise, object of structure:
	 * {data: [{max: number, min: number, upper: number, lower: number}], errors: string[]}
	 ************************************************************************/
	static getRobotVSFLinkArray = async (
		parsedControllerData: string[],
		robotNumber: number
	): Promise<{ data: LinkObjectAlias[]; errors: string[] }> => {
		const target = `.VSFDATA${robotNumber}`;
		const params = 8;
		const data: LinkObjectAlias[] = [];
		const errors: string[] = [];
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("VSF_ARMPARAM2")) {
						for (let index = 0; index < params; ++index) {
							const link: LinkObjectAlias = {
								radius: 0,
								joint: 0,
								x1: 0,
								y1: 0,
								z1: 0,
								x2: 0,
								y2: 0,
								z2: 0,
							};
							const line = parsedControllerData[i + index]
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
							data.push(link);
						}
					}
					++i;
				}
				errors.push(`Error: Unable to locate VSF_ARMPARAM2`);
				return { data: data, errors: errors };
			}
		}
		errors.push(
			`Error: Unable to locate robot link information in ${target}`
		);
		return { data: data, errors: errors };
	};

	/***********************************************************************
	 *	Parse robot vsf area and part range data
	 *
	 *	Expects a utf8 string array containing the contents of an as file and an integer for the robot number.
	 *	Returns a promise, object of structure:
	 * {data: {area:VSFZoneObjectAlias, parts: VSFZoneObjectAlias[]}, errors: string[]}
	 ************************************************************************/
	static getRobotVSFAreaPartsObject = async (
		parsedControllerData: string[],
		robotNumber: number
	): Promise<{
		data: { area: VSFZoneObjectAlias; parts: VSFZoneObjectAlias[] };
		errors: string[];
	}> => {
		const data: { area: VSFZoneObjectAlias; parts: VSFZoneObjectAlias[] } = {
			area: { enabled: false, upper: 0, lower: 0, lines: [] },
			parts: [],
		};
		const errors: string[] = [];
		if (robotNumber > 1) {
			return { data: data, errors: errors };
		}
		const target = `.VSFDATA${robotNumber}`;
		const areas = 9;
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("VSF_AREA1")) {
						const line = parsedControllerData[i]
							.split(" ")
							.filter(Boolean);
						data.area.enabled = parseInt(line[1]) === 1 ? true : false;
						data.area.upper = parseFloat(line[34]) / 100;
						data.area.lower = parseFloat(line[35]) / 100;
						for (let l = 0; l < 8; ++l) {
							const al: LineObjectAlias = { x1: 0, y1: 0, x2: 0, y2: 0 };
							al.x1 = parseFloat(line[4 * l + 2]) / 100;
							al.y1 = parseFloat(line[4 * l + 3]) / 100;
							al.x2 = parseFloat(line[4 * l + 4]) / 100;
							al.y2 = parseFloat(line[4 * l + 5]) / 100;
							data.area.lines.push(al);
						}
						//Parse part ranges
						for (let index = 1; index < areas; ++index) {
							const part: VSFZoneObjectAlias = {
								enabled: false,
								upper: 0,
								lower: 0,
								lines: [],
							};
							const line = parsedControllerData[i + index]
								.split(" ")
								.filter(Boolean);
							part.enabled = parseInt(line[1]) === 1 ? true : false;
							part.upper = parseFloat(line[18]) / 100;
							part.lower = parseFloat(line[19]) / 100;
							for (let l = 0; l < 4; ++l) {
								const al: LineObjectAlias = {
									x1: 0,
									y1: 0,
									x2: 0,
									y2: 0,
								};
								al.x1 = parseFloat(line[4 * l + 2]) / 100;
								al.y1 = parseFloat(line[4 * l + 3]) / 100;
								al.x2 = parseFloat(line[4 * l + 4]) / 100;
								al.y2 = parseFloat(line[4 * l + 5]) / 100;
								part.lines.push(al);
							}
							data.parts.push(part);
						}
						return { data: data, errors: errors };
					}
					++i;
				}
				errors.push(`Error: Unable to locate VSF_AREA1 in ${target}`);
				return { data: data, errors: errors };
			}
		}
		errors.push(`Error: Unable to locate vsf area information in ${target}`);
		return { data: data, errors: errors };
	};

	/***********************************************************************
	 *	Parse robot vsf tool spheres data
	 *
	 *	Expects a utf8 string array containing the contents of an as file and an integer for the robot number.
	 *	Returns a promise, object of structure:
	 * { data: ToolSphereObjectAlias[]; errors: string[] }
	 ************************************************************************/
	static getRobotVSFToolSphereArray = async (
		parsedControllerData: string[],
		robotNumber: number
	): Promise<{ data: ToolSphereObjectAlias[]; errors: string[] }> => {
		const target = `.VSFDATA${robotNumber}`;
		const toolnum = 9;
		const data: ToolSphereObjectAlias[] = [];
		const errors: string[] = [];
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("VSF_TOOLSP10")) {
						for (let index = 0; index < toolnum; ++index) {
							const line = parsedControllerData[i + index * 2]
								.split(" ")
								.filter(Boolean);
							const line2 = parsedControllerData[i + index * 2]
								.split(" ")
								.filter(Boolean);
							const tool: ToolSphereObjectAlias = {
								index: index,
								spheres: [],
							};
							let page1: SphereObjectAlias[] = [];
							let page2: SphereObjectAlias[] = [];
							for (let s = 0; s < 10; ++s) {
								const s1: SphereObjectAlias = {
									x: 0,
									y: 0,
									z: 0,
									radius: 0,
								};
								const s2: SphereObjectAlias = {
									x: 0,
									y: 0,
									z: 0,
									radius: 0,
								};
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
							tool.spheres.concat(page1, page2);
							data.push(tool);
						}
						return { data: data, errors: errors };
					}
					++i;
				}
				errors.push(
					`Error: Unable to locate vsf tool spheres section VSF_TOOLSP10`
				);
				return { data: data, errors: errors };
			}
		}
		errors.push(
			`Error: Unable to locate vsf tool sphere information in ${target}`
		);
		return { data: data, errors: errors };
	};

	/***********************************************************************
	 *	Parse robot vsf tool box data
	 *
	 *	Expects a utf8 string array containing the contents of an as file and an integer for the robot number.
	 *	Returns a promise, object of structure:
	 * {data: {area:VSFZoneObjectAlias, parts: VSFZoneObjectAlias[]}, errors: string[]}
	 ************************************************************************/
	static getRobotVSFToolBoxArray = async (
		parsedControllerData: string[],
		robotNumber: number
	): Promise<{ data: ToolBoxObjectAlias[]; errors: string[] }> => {
		const target = `.VSFDATA${robotNumber}`;
		const toolnum = 9;
		const data: ToolBoxObjectAlias[] = [];
		const errors: string[] = [];
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("VSF_TOOLBOX1 ")) {
						for (let index = 0; index < toolnum; ++index) {
							const line = parsedControllerData[i + index]
								.split(" ")
								.filter(Boolean);
							const tool: ToolBoxObjectAlias = {
								rotation: 0,
								x: 0,
								y: 0,
								z: 0,
								depth: 0,
								width: 0,
								height: 0,
								spheres: [],
							};
							tool.rotation = parseFloat(line[1]) / 100;
							tool.x = parseFloat(line[2]) / 100;
							tool.y = parseFloat(line[3]) / 100;
							tool.z = parseFloat(line[4]) / 100;
							tool.depth = parseFloat(line[5]) / 100;
							tool.width = parseFloat(line[6]) / 100;
							tool.height = parseFloat(line[7]) / 100;
							data.push(tool);
						}
					}
					if (parsedControllerData[i].startsWith("VSF_ETCSP1 ")) {
						for (let index = 0; index < toolnum; ++index) {
							const line = parsedControllerData[i + index]
								.split(" ")
								.filter(Boolean);
							const s1: SphereObjectAlias = {
								radius: 0,
								x: 0,
								y: 0,
								z: 0,
							};
							const s2: SphereObjectAlias = {
								radius: 0,
								x: 0,
								y: 0,
								z: 0,
							};
							s1.radius = parseFloat(line[1]) / 10;
							s1.x = parseFloat(line[2]) / 10;
							s1.y = parseFloat(line[3]) / 10;
							s1.z = parseFloat(line[4]) / 10;
							s2.radius = parseFloat(line[5]) / 10;
							s2.x = parseFloat(line[6]) / 10;
							s2.y = parseFloat(line[7]) / 10;
							s2.z = parseFloat(line[8]) / 10;
							data[index].spheres.concat(s1, s2);
						}
						return { data: data, errors: errors };
					}
					++i;
				}
				errors.push(
					`Error: Unable to locate VSF_TOOLBOX1 information in ${target}`
				);
				return { data: data, errors: errors };
			}
		}
		errors.push(
			`Error: Unable to locate vsf tool box information in ${target}`
		);
		return { data: data, errors: errors };
	};

	/***********************************************************************
	 *	Parse robot program data
	 *
	 *	Expects a utf8 string array containing the contents of an as file and an integer for the robot number.
	 *	Returns a promise, object of structure:
	 * {data: ProgramObjectAlias[], errors: string[]}
	 ************************************************************************/
	static getRobotProgramsArray = async (
		parsedControllerData: string[],
		robotNumber: number
	): Promise<{ data: ProgramObjectAlias[]; errors: string[] }> => {
		const target = `.PROGRAM r${robotNumber}`;
		const data: ProgramObjectAlias[] = [];
		const errors: string[] = [];
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				const program: ProgramObjectAlias = {
					name: "",
					arguments: [],
					lines: [],
					comment: "",
				};
				program.comment = parsedControllerData[i].split(";")[1];
				const argument = parsedControllerData[i].match(/\((.*?)\)/);
				if (argument) {
					program.arguments = argument[1].split(",");
				}
				program.name = parsedControllerData[i].split(" ")[1].split("(")[0];
				while (parsedControllerData[i] != ".END") {
					const parsed = parsedControllerData[i];
					if (parsed.startsWith(";")) {
						const line: ProgramLineObjectAlias = {
							type: "comment",
							line: "",
							comment: "",
						};
						line.comment = parsed.substr(1);
						program.lines.push(line);
					} else if (parsed.startsWith("FN")) {
						const line: ProgramLineObjectAlias = {
							type: "function",
							comment: "",
							function: 0,
							arguments: [],
							interpolation: "",
							speed: 0,
							accuracy: 0,
							timer: 0,
							tool: 0,
							work: 0,
							group: 0,
							operation: "",
							clamp: 0,
						};
						const comment = parsed.split(";");
						comment.length > 1 ? (line.comment = comment[1]) : null;
						const func = parsed.split("[")[0];
						line.function = parseInt(func.slice(2));
						let args = parsed.split("[")[1];
						args = args.substring(0, args.length - 1);
						line.arguments = args.split(",").filter(Boolean);
						program.lines.push(line);
					} else if (
						parsed.startsWith("JOINT") ||
						parsed.startsWith("LINEAR")
					) {
						const line: ProgramLineObjectAlias = {
							type: "block",
							comment: "",
							function: 0,
							arguments: [],
							interpolation: "",
							speed: 0,
							accuracy: 0,
							timer: 0,
							tool: 0,
							work: 0,
							group: 0,
							operation: "",
							clamp: 0,
						};
						const comment = parsed.split(";");
						comment.length > 1 ? (line.comment = comment[1]) : null;
						const parsed2 = parsed.split(" ").filter(Boolean);
						/*
						parsed2[parsed2.length - 1].startsWith(";")
							? parsed2.pop()
							: (parsed2[parsed2.length - 1] = parsed2[
									parsed2.length - 1
							  ].split(";")[0]);
						*/
						line.interpolation = parsed2[0];
						if (parsed2[1].startsWith("SPEED")) {
							line.speed = parseInt(
								parsed2[1].slice(parsed2[1].length - 2)
							);
						} else {
							line.speed = parseInt(
								parsed2[1].substring(0, parsed2[1].length)
							);
						}
						line.accuracy = parseInt(
							parsed2[2].slice(parsed2[2].length - 2)
						);
						line.timer = parseInt(
							parsed2[3].slice(parsed2[3].length - 2)
						);
						line.tool = parseInt(parsed2[4].slice(parsed2[4].length - 2));
						line.work = parseInt(parsed2[5].slice(parsed2[5].length - 2));
						line.group = parseInt(
							parsed2[6].slice(parsed2[6].length - 2)
						);
						let index = 0;
						if (parsed2[7] === "END" || parsed2[7] === "JUMP") {
							line.operation = parsed2[7];
							++index;
						}
						line.clamp = parseInt(
							parsed2[7 + index].slice(parsed2[7 + index].length - 2)
						);
						program.lines.push(line);
					} else {
						const line: ProgramLineObjectAlias = {
							type: "as",
							line: "",
							comment: "",
						};
						const comment = parsed.split(";");
						comment.length > 1 ? (line.comment = comment[1]) : null;
						line.line = comment[0];
						program.lines.push(line);
					}
					++i;
				}
				data.push(program);
			}
		}
		if (data.length === 0) {
			errors.push(
				`Error: Unable to locate program information in ${target}`
			);
		}
		return { data: data, errors: errors };
	};

	/***********************************************************************
	 *	Parse controller program data
	 *
	 *	Expects a utf8 string array containing the contents of an as file.
	 *	Returns a promise, object of structure:
	 * {data: ProgramObjectAlias[], errors: string[]}
	 ************************************************************************/
	static getControllerProgramsArray = async (
		parsedControllerData: string[]
	): Promise<{ data: ProgramObjectAlias[]; errors: string[] }> => {
		const target = `.PROGRAM`;
		const data: ProgramObjectAlias[] = [];
		const errors: string[] = [];
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (
				parsedControllerData[i].startsWith(target) &&
				!parsedControllerData[i].includes("_pg")
			) {
				const program: ProgramObjectAlias = {
					name: "",
					arguments: [],
					lines: [],
					comment: "",
				};
				program.comment = parsedControllerData[i].split(";")[1];
				const argument = parsedControllerData[i].match(/\((.*?)\)/);
				if (argument) {
					program.arguments = argument[1].split(",");
				}
				program.name = parsedControllerData[i].split(" ")[1].split("(")[0];
				while (parsedControllerData[i] != ".END") {
					const parsed = parsedControllerData[i];
					if (parsed.startsWith(";")) {
						const line: ProgramLineObjectAlias = {
							type: "comment",
							line: "",
							comment: "",
						};
						line.comment = parsed.substr(1);
						program.lines.push(line);
					} else if (parsed.startsWith("FN")) {
						const line: ProgramLineObjectAlias = {
							type: "function",
							comment: "",
							function: 0,
							arguments: [],
							interpolation: "",
							speed: 0,
							accuracy: 0,
							timer: 0,
							tool: 0,
							work: 0,
							group: 0,
							operation: "",
							clamp: 0,
						};
						const comment = parsed.split(";");
						comment.length > 1 ? (line.comment = comment[1]) : null;
						const func = parsed.split("[")[0];
						line.function = parseInt(func.slice(2));
						let args = parsed.split("[")[1];
						args = args.substring(0, args.length - 1);
						line.arguments = args.split(",").filter(Boolean);
						program.lines.push(line);
					} else if (
						parsed.startsWith("JOINT") ||
						parsed.startsWith("LINEAR")
					) {
						const line: ProgramLineObjectAlias = {
							type: "block",
							comment: "",
							function: 0,
							arguments: [],
							interpolation: "",
							speed: 0,
							accuracy: 0,
							timer: 0,
							tool: 0,
							work: 0,
							group: 0,
							operation: "",
							clamp: 0,
						};
						const comment = parsed.split(";");
						comment.length > 1 ? (line.comment = comment[1]) : null;
						const parsed2 = parsed.split(" ").filter(Boolean);
						/*
						parsed2[parsed2.length - 1].startsWith(";")
							? parsed2.pop()
							: (parsed2[parsed2.length - 1] = parsed2[
									parsed2.length - 1
							  ].split(";")[0]);
						*/
						line.interpolation = parsed2[0];
						if (parsed2[1].startsWith("SPEED")) {
							line.speed = parseInt(
								parsed2[1].slice(parsed2[1].length - 2)
							);
						} else {
							line.speed = parseInt(
								parsed2[1].substring(0, parsed2[1].length)
							);
						}
						line.accuracy = parseInt(
							parsed2[2].slice(parsed2[2].length - 2)
						);
						line.timer = parseInt(
							parsed2[3].slice(parsed2[3].length - 2)
						);
						line.tool = parseInt(parsed2[4].slice(parsed2[4].length - 2));
						line.work = parseInt(parsed2[5].slice(parsed2[5].length - 2));
						line.group = parseInt(
							parsed2[6].slice(parsed2[6].length - 2)
						);
						let index = 0;
						if (parsed2[7] === "END" || parsed2[7] === "JUMP") {
							line.operation = parsed2[7];
							++index;
						}
						line.clamp = parseInt(
							parsed2[7 + index].slice(parsed2[7 + index].length - 2)
						);
						program.lines.push(line);
					} else {
						const line: ProgramLineObjectAlias = {
							type: "as",
							line: "",
							comment: "",
						};
						const comment = parsed.split(";");
						comment.length > 1 ? (line.comment = comment[1]) : null;
						line.line = comment[0];
						program.lines.push(line);
					}
					++i;
				}
				data.push(program);
			}
		}
		if (data.length === 0) {
			errors.push(
				`Error: Unable to locate program information in ${target}`
			);
		}
		return { data: data, errors: errors };
	};
}
