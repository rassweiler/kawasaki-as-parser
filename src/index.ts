import {
	ControllerObjectAlias,
	IOCommentObjectAlias,
	RobotObjectAlias,
	MHTableObjectAlias,
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
	BCDObjectAlias,
	StringVarObjectAlias,
	RealVarObjectAlias,
	JointVarObjectAlias,
	TransVarObjectAlias,
	SwitchAlias,
	PositionObjectAlias,
	SpotObjectAlias,
	StepupObjectAlias,
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
	): Promise<{ data: ControllerObjectAlias; errors: string[] }> => {
		// Parse controller data
		let parsedControllerData: string[] = [];
		let numberOfRobots = 0;
		const controllerObject: ControllerObjectAlias = {
			controllerType: "",
			manufacturer: "Kawasaki",
			robots: [],
			ioComments: { inputs: [], outputs: [] },
			commonPrograms: [],
			stringVars: [],
			realVars: [],
			jointVars: [],
			transVars: [],
		};
		let errors: string[] = [];

		// Parse utf8 string into array of formatted strings for each line
		try {
			const data = await KawasakiParser.getRobotDataStringArray(
				rawStringData
			);
			parsedControllerData = data.data;
			errors = errors.concat(data.errors);
		} catch (error) {
			errors.push(error);
			return { data: controllerObject, errors: errors };
		}

		// Determine controller type
		try {
			const data = await KawasakiParser.getControllerTypeString(
				parsedControllerData
			);
			controllerObject.controllerType = data.data;
			data.errors.length > 0 ? (errors = errors.concat(data.errors)) : null;
		} catch (error) {
			errors.push(error);
			return { data: controllerObject, errors: errors };
		}

		// Determine number of robots in controller
		try {
			const data = await KawasakiParser.getNumberOfRobotsInController(
				parsedControllerData
			);
			data.data !== 0 ? (numberOfRobots = data.data) : null;
			data.errors.length > 0 ? (errors = errors.concat(data.errors)) : null;
		} catch (error) {
			errors.push(error);
			return { data: controllerObject, errors: errors };
		}

		// Parse robot specific data
		if (numberOfRobots > 0) {
			for (let index = 1; index <= numberOfRobots; ++index) {
				const robot: RobotObjectAlias = {
					type: "",
					model: "",
					bcds: [],
					ncTable: [],
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
					isLinear: false,
					spotGuns: [],
					rac: [],
					programs: [],
					switches: [],
					homePosition: [],
					jumpPosition: [],
					currentPosition: {
						program: 0,
						step: 0,
						joints: [],
					},
				};
				const [
					robotInfo,
					robotNC,
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
					KawasakiParser.getNCTableArray(parsedControllerData, index),
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
				const robotLinear = await KawasakiParser.getRobotLinearBool(
					parsedControllerData,
					index
				);
				robotLinear.errors.length > 0
					? (errors = errors.concat(robotLinear.errors))
					: null;
				robot.isLinear = robotLinear.data;
				const [
					robotBCD,
					robotSwitches,
					robotHome,
					robotJump,
					robotPosition,
				] = await Promise.all([
					KawasakiParser.getRobotBCDArray(parsedControllerData, index),
					KawasakiParser.getRobotSwitchArray(parsedControllerData, index),
					KawasakiParser.getRobotHomePositionArray(
						parsedControllerData,
						index
					),
					KawasakiParser.getRobotJumpPositionArray(
						parsedControllerData,
						index
					),
					KawasakiParser.getRobotPositionObject(
						parsedControllerData,
						index,
						controllerObject.controllerType
					),
				]);
				robotInfo.errors.length > 0
					? (errors = errors.concat(robotInfo.errors))
					: null;
				robot.type = robotInfo.data.type;
				robot.model = robotInfo.data.model;
				robotBCD.errors.length > 0
					? (errors = errors.concat(robotBCD.errors))
					: null;
				robot.bcds = robotBCD.data;
				robotNC.errors.length > 0
					? (errors = errors.concat(robotNC.errors))
					: null;
				robot.ncTable = robotNC.data;
				robotTCP.errors.length > 0
					? (errors = errors.concat(robotTCP.errors))
					: null;
				robot.tools = robotTCP.data;
				robotInstall.errors.length > 0
					? (errors = errors.concat(robotInstall.errors))
					: null;
				robot.installPosition = robotInstall.data;
				robotJoint.errors.length > 0
					? (errors = errors.concat(robotJoint.errors))
					: null;
				robot.vsf.softLimits = robotJoint.data;
				robotLink.errors.length > 0
					? (errors = errors.concat(robotLink.errors))
					: null;
				robot.vsf.linkData = robotLink.data;
				robotLink.errors.length > 0
					? (errors = errors.concat(robotLink.errors))
					: null;
				robot.vsf.linkData = robotLink.data;
				robotArea.errors.length > 0
					? (errors = errors.concat(robotArea.errors))
					: null;
				robot.vsf.area = robotArea.data.area;
				robot.vsf.parts = robotArea.data.parts;
				robotSphere.errors.length > 0
					? (errors = errors.concat(robotSphere.errors))
					: null;
				robot.vsf.toolSpheres = robotSphere.data;
				robotBox.errors.length > 0
					? (errors = errors.concat(robotBox.errors))
					: null;
				robot.vsf.toolBoxes = robotBox.data;
				robotPrograms.errors.length > 0
					? (errors = errors.concat(robotPrograms.errors))
					: null;
				robot.programs = robotPrograms.data;
				robotSwitches.errors.length > 0
					? (errors = errors.concat(robotSwitches.errors))
					: null;
				robot.switches = robotSwitches.data;
				robotHome.errors.length > 0
					? (errors = errors.concat(robotHome.errors))
					: null;
				robot.homePosition = robotHome.data;
				robotJump.errors.length > 0
					? (errors = errors.concat(robotJump.errors))
					: null;
				robot.jumpPosition = robotJump.data;
				robotPosition.errors.length > 0
					? (errors = errors.concat(robotPosition.errors))
					: null;
				robot.currentPosition = robotPosition.data;
				for (let numGun = 1; numGun < 16; numGun += 1) {
					const gunData = await KawasakiParser.getRobotGunDataObject(
						parsedControllerData,
						index,
						numGun,
						robot.isLinear
					);
					gunData.errors.length > 0
						? (errors = errors.concat(gunData.errors))
						: null;
					robot.spotGuns.push(gunData.data);
				}
				controllerObject.robots.push(robot);
			}
		}

		// Parse controller IO comments
		try {
			const data = await KawasakiParser.getRobotIOCommentsObject(
				parsedControllerData
			);
			data.errors.length > 0 ? (errors = errors.concat(data.errors)) : null;
			controllerObject.ioComments = data.data;
		} catch (error) {
			errors.push(error);
		}

		// Parse controller Programs
		try {
			const data = await KawasakiParser.getControllerProgramsArray(
				parsedControllerData
			);
			data.errors.length > 0 ? (errors = errors.concat(data.errors)) : null;
			controllerObject.commonPrograms = data.data;
		} catch (error) {
			errors.push(error);
		}

		// Parse controller variables
		try {
			const [strings, reals, joints, trans] = await Promise.all([
				KawasakiParser.getControllerStringsArray(parsedControllerData),
				KawasakiParser.getControllerRealsArray(parsedControllerData),
				KawasakiParser.getControllerJointsArray(parsedControllerData),
				KawasakiParser.getControllerTransArray(parsedControllerData),
			]);
			strings.errors.length > 0
				? (errors = errors.concat(strings.errors))
				: null;
			controllerObject.stringVars = strings.data;
			reals.errors.length > 0
				? (errors = errors.concat(reals.errors))
				: null;
			controllerObject.realVars = reals.data;
			joints.errors.length > 0
				? (errors = errors.concat(joints.errors))
				: null;
			controllerObject.jointVars = joints.data;
			trans.errors.length > 0
				? (errors = errors.concat(trans.errors))
				: null;
			controllerObject.transVars = trans.data;
		} catch (error) {
			errors.push(error);
		}
		return { data: controllerObject, errors: errors };
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
		if (Buffer.isBuffer(rawControllerString)) {
			errors.push("Error: rawData is string buffer");
		} else if (rawControllerString === "") {
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
		for (let i = 0; i < parsedControllerData.length; i += 1) {
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
	 *	Determine the type of controller
	 *
	 *	Expects a utf8 string array containing the contents of an as file.
	 *	Returns a promise, object of structure {data: string, errors: string[]}
	 ************************************************************************/
	static getControllerTypeString = async (
		parsedControllerData: string[]
	): Promise<{ data: string; errors: string[] }> => {
		const data: { data: string; errors: string[] } = {
			data: "",
			errors: [],
		};
		for (let i = 0; i < parsedControllerData.length; i += 1) {
			if (parsedControllerData[i].includes("TCONTROLLER")) {
				data.data = "T";
				return data;
			}
			if (parsedControllerData[i].includes("ECONTROLLER")) {
				data.data = "E";
				return data;
			}
		}
		data.errors.push("Unable to locate controller type");
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
		data: string;
		errors: string[];
	} => {
		let robotType = "";
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
			type: string;
			model: string;
		};
		errors: string[];
	}> => {
		const data: {
			type: string;
			model: string;
		} = {
			type: "",
			model: "",
		};
		let errors: string[] = [];
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
						rData.errors.length > 0
							? (errors = errors.concat(rData.errors))
							: null;
						data.type = rData.data;
						data.model = line[6].split("-")[0];
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
	 *	Determine the robots current position
	 *
	 *	Expects a utf8 string array containing the contents of an as file, the robot number, and the controller type.
	 *	Returns a promise, object of structure {data: PositionObjectAlias, errors: string[]}
	 ************************************************************************/
	static getRobotPositionObject = async (
		parsedControllerData: string[],
		robotNumber: number,
		controllerType: string
	): Promise<{ data: PositionObjectAlias; errors: string[] }> => {
		const data: { data: PositionObjectAlias; errors: string[] } = {
			data: {
				program: 0,
				step: 0,
				joints: [],
			},
			errors: [],
		};
		if (controllerType === "T") {
			const target =
				robotNumber === 1 ? `.CONDITION` : `.CONDITION${robotNumber}`;
			for (let i = 0; i < parsedControllerData.length; i += 1) {
				if (parsedControllerData[i].startsWith(target)) {
					while (parsedControllerData[i] != ".END") {
						if (
							parsedControllerData[i].startsWith("STEP1ENV_CALL_PRGNAME")
						) {
							const parsed = parsedControllerData[i]
								.split(" ")
								.filter(Boolean);
							data.data.program = parseInt(
								parsed[1].replace(`r${robotNumber}_pg`, "")
							);
						}
						if (parsedControllerData[i].startsWith("STEP1ENV_PRG_STEP")) {
							const parsed = parsedControllerData[i]
								.split(" ")
								.filter(Boolean);
							data.data.step = parseInt(parsed[1]);
						}
						i += 1;
					}
					return data;
				}
			}
		}
		data.errors.push(`Error: Unable to locate robot position data.`);
		return data;
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
					if (line.length > 0 && line[0].startsWith("N_OX")) {
						const output = { signal: -1, comment: "" };
						output.signal = parseInt(line[0].replace("N_OX", ""));
						output.comment = parsedControllerData[i].substring(
							parsedControllerData[i].indexOf('"') + 1,
							parsedControllerData[i].lastIndexOf('"')
						);
						comments.outputs.push(output);
					}
					if (line.length > 0 && line[0].startsWith("N_WX")) {
						const input = { signal: -1, comment: "" };
						input.signal = parseInt(line[0].replace("N_WX", ""));
						input.comment = parsedControllerData[i].substring(
							parsedControllerData[i].indexOf('"') + 1,
							parsedControllerData[i].lastIndexOf('"')
						);
						comments.inputs.push(input);
					}
					++i;
				}
				if (comments.inputs.length === 0) {
					errors.push(`Input or output arrays are empty`);
				}
				return { data: comments, errors: errors };
			}
		}
		errors.push(`Error: Unable to locate .SIG_NAME_LANG2`);
		return { data: comments, errors: errors };
	};

	/***********************************************************************
	 *	Parse controller NC table data
	 *
	 *	Expects a utf8 string array containing the contents of an as file and the robot number.
	 *	Returns a promise, object of structure:
	 * {data: [{tableIndex: number, axisData: number[], comment: string}], errors: string[]}
	 ************************************************************************/
	static getNCTableArray = async (
		parsedControllerData: string[],
		robotNumber: number
	): Promise<{ data: MHTableObjectAlias[]; errors: string[] }> => {
		const data: MHTableObjectAlias[] = [];
		const errors: string[] = [];
		const ncs = 64;
		const target = `.SYSDATA${robotNumber > 1 ? robotNumber : ""}`;
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				while (parsedControllerData[i] != ".END") {
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
									: errors.push(
											"Error: NC axis value not type number"
									  );
							}
							mh.axisData.length === 0
								? errors.push(
										`Error: Axis table array is empty: Index ${index}`
								  )
								: null;
							startIndex++;
							mh.comment =
								parsedControllerData[startIndex].split(/ (.+)/)[1];
							data.push(mh);
							++index;
						}
						return { data: data, errors: errors };
					}
					++i;
				}
			}
		}
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
						return { data: data, errors: errors };
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
						return { data: data, errors: errors };
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
							tool.spheres = tool.spheres.concat(page1, page2);
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
							data[index].spheres = data[index].spheres.concat(s1, s2);
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
	 *	Parse controller BCD
	 *
	 *	Expects a utf8 string array containing the contents of an as file and a robot number.
	 *	Returns a promise, object of structure:
	 * {data: BCDObjectAlias[], errors: string[]}
	 ************************************************************************/
	static getRobotBCDArray = async (
		parsedControllerData: string[],
		robotNumber: number
	): Promise<{
		data: BCDObjectAlias[];
		errors: string[];
	}> => {
		const data: BCDObjectAlias[] = [];
		const errors: string[] = [];
		const target = `TB_TYPE_PG1`;
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("TB_TYPE_PG")) {
						const line = parsedControllerData[i]
							.split(" ")
							.filter(Boolean);
						if (line.length > 16) {
							for (let index = 0; index < 5; index += 1) {
								const bcd: BCDObjectAlias = {
									bcd: 0,
									program: 0,
								};
								bcd.bcd = parseInt(line[1 + index * 9]);
								bcd.program = parseInt(
									line[1 + robotNumber + index * 9]
								);
								data.push(bcd);
							}
						}
					}
					++i;
				}
				return { data: data, errors: errors };
			}
		}
		errors.push(
			`Error: Unable to locate bcd information in ${target} for robot ${robotNumber}`
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
		let errors: string[] = [];
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
				// No comment on title line, look on first step
				if (program.comment === "" || program.comment === undefined) {
					const index = i + 1;
					const parsed = parsedControllerData[index].split(";");
					parsed.length > 1 ? (program.comment = parsed[1]) : null;
				}
				i += 1;
				// Parse program lines
				while (parsedControllerData[i] != ".END") {
					const parsed = parsedControllerData[i];
					const line = KawasakiParser.getProgramLineObject(parsed);
					if (line.errors) {
						errors = errors.concat(line.errors);
					}
					if (line.data) {
						program.lines.push(line.data);
					}
					i += 1;
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
	 *	Parse robot switch data
	 *
	 *	Expects a utf8 string array containing the contents of an as file and an integer for the robot number.
	 *	Returns a promise, object of structure:
	 * {data: SwitchAlias[], errors: string[]}
	 ************************************************************************/
	static getRobotSwitchArray = async (
		parsedControllerData: string[],
		robotNumber: number
	): Promise<{ data: SwitchAlias[]; errors: string[] }> => {
		const target = `.ROBOTDATA${robotNumber}`;
		const target2 = robotNumber === 1 ? `.SYSDATA` : `.SYSDATA${robotNumber}`;
		const data: SwitchAlias[] = [];
		const errors: string[] = [];
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target2)) {
				i += 1;
				// Look for switches
				while (parsedControllerData[i] != ".END") {
					if (
						parsedControllerData[i].startsWith("SWITCH") ||
						parsedControllerData[i].startsWith("DEFSIG_O TIP")
					) {
						const parsed = parsedControllerData[i]
							.split(" ")
							.filter(Boolean);
						const zSwitch: SwitchAlias = {
							switch: "",
							value: false,
						};
						if (parsed.length > 2) {
							zSwitch.switch = parsed[1];
							zSwitch.value = parsed[2] === "ON";
							data.push(zSwitch);
						}
					}
					i += 1;
				}
			}
			if (parsedControllerData[i].startsWith(target)) {
				i += 1;
				// Look for switches
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("ZSWITCH")) {
						const parsed = parsedControllerData[i]
							.split(" ")
							.filter(Boolean);
						const zSwitch: SwitchAlias = {
							switch: "",
							value: false,
						};
						if (parsed.length > 2) {
							zSwitch.switch = parsed[1];
							zSwitch.value = parsed[2] === "ON";
							data.push(zSwitch);
						}
					}
					i += 1;
				}
			}
		}
		if (data.length === 0) {
			errors.push(
				`Error: Unable to locate zswitch information in ${target}`
			);
		}
		return { data: data, errors: errors };
	};

	/***********************************************************************
	 *	Parse robot home data
	 *
	 *	Expects a utf8 string array containing the contents of an as file and an integer for the robot number.
	 *	Returns a promise, object of structure:
	 * {data: number[], errors: string[]}
	 ************************************************************************/
	static getRobotHomePositionArray = async (
		parsedControllerData: string[],
		robotNumber: number
	): Promise<{ data: number[]; errors: string[] }> => {
		const target = robotNumber === 1 ? `.SYSDATA` : `.SYSDATA${robotNumber}`;
		const data: number[] = [];
		const errors: string[] = [];
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				i += 1;
				// Look for switches
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("HOME 1")) {
						const parsed = parsedControllerData[i]
							.split(" ")
							.filter(Boolean);
						if (parsed.length > 2) {
							for (let index = 2; index < parsed.length; index += 1) {
								data.push(parseFloat(parsed[index]));
							}
						}
						return { data: data, errors: errors };
					}
					i += 1;
				}
			}
		}
		if (data.length === 0) {
			errors.push(`Error: Unable to locate home information in ${target}`);
		}
		return { data: data, errors: errors };
	};

	/***********************************************************************
	 *	Parse robot jump data
	 *
	 *	Expects a utf8 string array containing the contents of an as file and an integer for the robot number.
	 *	Returns a promise, object of structure:
	 * {data: number[], errors: string[]}
	 ************************************************************************/
	static getRobotJumpPositionArray = async (
		parsedControllerData: string[],
		robotNumber: number
	): Promise<{ data: number[]; errors: string[] }> => {
		const target = `.PROGRAM r${robotNumber}_pg0`;
		const data: number[] = [];
		const errors: string[] = [];
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				i += 1;
				// Look for switches
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].includes("JUMP")) {
						const parsed = parsedControllerData[i]
							.split(" ")
							.filter(Boolean);
						for (let index = 0; index < parsed.length; index += 1) {
							if (parsed[index].startsWith("#[")) {
								let joint = parsed[index].split(";")[0];
								joint = joint.replace("#[", "");
								joint = joint.replace("]", "");
								const joints = joint.split(",");
								for (
									let index2 = 0;
									index < joints.length;
									index2 += 1
								) {
									data.push(parseFloat(joints[index2]));
								}
								return { data: data, errors: errors };
							}
						}
					}
					i += 1;
				}
			}
		}
		if (data.length === 0) {
			errors.push(`Error: Unable to locate jump information in ${target}`);
		}
		return { data: data, errors: errors };
	};

	/***********************************************************************
	 *	Parse robot linear data
	 *
	 *	Expects a utf8 string array containing the contents of an as file,
	 * an integer for the robot number.
	 *	Returns a promise, object of structure:
	 * {data: boolean, errors: string[]}
	 ************************************************************************/
	static getRobotLinearBool = async (
		parsedControllerData: string[],
		robotNumber: number
	): Promise<{ data: boolean; errors: string[] }> => {
		let data = false;
		const errors: string[] = [];
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(`.ROBOTDATA${robotNumber}`)) {
				while (parsedControllerData[i] != ".END") {
					if (parsedControllerData[i].startsWith("OPTION03_01")) {
						const parsed = parsedControllerData[i]
							.split(" ")
							.filter(Boolean);
						if (parsed.length > 1) {
							data = parsed[1] === "1";
							return { data: data, errors: errors };
						}
					}
					i += 1;
				}
			}
		}
		errors.push(`Error: Unable to locate robot linear information`);
		return { data: data, errors: errors };
	};

	/***********************************************************************
	 *	Parse robot gun data
	 *
	 *	Expects a utf8 string array containing the contents of an as file,
	 * an integer for the robot number, and an int for gun number.
	 *	Returns a promise, object of structure:
	 * {data: SpotObjectAlias, errors: string[]}
	 ************************************************************************/
	static getRobotGunDataObject = async (
		parsedControllerData: string[],
		robotNumber: number,
		gunNumber: number,
		isLinear: boolean
	): Promise<{ data: SpotObjectAlias; errors: string[] }> => {
		const target = robotNumber === 1 ? `.AUXDATA` : `.AUXDATA${robotNumber}`;
		const data: SpotObjectAlias = {
			dresserUse: false,
			leakCheck: false,
			reweld: false,
			welderType: "",
			gunType: "",
			squeeze: 0,
			gunArea: 0,
			maxPressure: 0,
			turnsRatio: 0,
			tipMovableClearance: 0,
			tipFixedClearance: 0,
			tipMovableWearLimit: 0,
			tipFixedwearLimit: 0,
			linearUp: {
				enabled: false,
				values: [],
			},
			formerLinearUp: {
				enabled: false,
				values: [],
			},
		};
		const errors: string[] = [];
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				while (parsedControllerData[i] != ".END") {
					if (
						parsedControllerData[i].startsWith(`TW_GUN${gunNumber}_SPEC `)
					) {
						const parsed = parsedControllerData[i]
							.split(" ")
							.filter(Boolean);
						if (parsed.length > 9) {
							data.leakCheck = parsed[2] === "1";
							if (parsed[4] === "1") {
								data.gunType = "pincher";
							}
							if (parsed[4] === "2") {
								data.gunType = "stud";
							}
							data.squeeze = parseInt(parsed[6]);
							data.gunArea = parseInt(parsed[7]);
							data.turnsRatio = parseInt(parsed[8]);
							data.maxPressure = Math.round(parseInt(parsed[9]) * 9.8);
						}
					}
					if (
						parsedControllerData[i].startsWith(
							`SG_GUN_1[${gunNumber}]_T `
						)
					) {
						const parsed = parsedControllerData[i]
							.split(" ")
							.filter(Boolean);
						if (parsed.length > 10) {
							data.tipMovableClearance = parseFloat(parsed[1]) / 10;
							data.tipFixedClearance = parseFloat(parsed[2]) / 10;
							data.tipMovableWearLimit = parseFloat(parsed[3]) / 100;
							data.tipFixedwearLimit = parseFloat(parsed[4]) / 100;
						}
					}
					if (
						parsedControllerData[i].startsWith(`TW_GUN${gunNumber}_CUR `)
					) {
						const parsed = parsedControllerData[i]
							.split(" ")
							.filter(Boolean);
						if (parsed.length > 43) {
							data.linearUp.enabled = parsed[1] === "1";
							for (let index = 0; index < 10; index += 1) {
								const stepUp: StepupObjectAlias = {
									onePercentSetting: 0,
									onePercentValue: 0,
									twoPercentSetting: 0,
									twoPercentValue: 0,
								};
								const ops = parseInt(parsed[index + 4]);
								const tps = parseInt(parsed[index + 14]);
								stepUp.onePercentSetting =
									ops > 3200 ? ops - 65536 : ops;
								stepUp.twoPercentSetting =
									ops > 3200 ? ops - 65536 : tps;
								const offset = isLinear ? -1 : 0;
								if (isLinear && index === 0) {
									stepUp.onePercentValue = 0;
									stepUp.twoPercentValue = 0;
								} else {
									stepUp.onePercentValue = parseInt(
										parsed[24 + offset + index]
									);
									stepUp.twoPercentValue = parseInt(
										parsed[34 + offset + index]
									);
								}
								data.linearUp.values.push(stepUp);
							}
						}
					}
					if (
						parsedControllerData[i].startsWith(`TW_GUN${gunNumber}_CUR2 `)
					) {
						const parsed = parsedControllerData[i]
							.split(" ")
							.filter(Boolean);
						if (parsed.length > 43) {
							data.formerLinearUp.enabled = parsed[1] === "1";
							for (let index = 0; index < 10; index += 1) {
								const stepUp: StepupObjectAlias = {
									onePercentSetting: 0,
									onePercentValue: 0,
									twoPercentSetting: 0,
									twoPercentValue: 0,
								};
								const ops = parseInt(parsed[index + 4]);
								const tps = parseInt(parsed[index + 14]);
								stepUp.onePercentSetting =
									ops > 3200 ? ops - 65536 : ops;
								stepUp.twoPercentSetting =
									ops > 3200 ? ops - 65536 : tps;
								const offset = isLinear ? -1 : 0;
								if (isLinear && index === 0) {
									stepUp.onePercentValue = 0;
									stepUp.twoPercentValue = 0;
								} else {
									stepUp.onePercentValue = parseInt(
										parsed[24 + offset + index]
									);
									stepUp.twoPercentValue = parseInt(
										parsed[34 + offset + index]
									);
								}
								data.formerLinearUp.values.push(stepUp);
							}
						}
					}
					if (parsedControllerData[i].startsWith(`NEW_RWC`)) {
						const parsed = parsedControllerData[i]
							.split(" ")
							.filter(Boolean);
						if (parsed.length > 1) {
							if (parsed[1] === "0") {
								data.welderType = "Constant";
							}
							if (parsed[1] === "1") {
								data.welderType = "Adaptive";
							}
						}
					}
					++i;
				}
				return { data: data, errors: errors };
			}
		}
		errors.push(`Error: Unable to locate robot gun information in ${target}`);
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
		let errors: string[] = [];
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
				// No comment on title line, look on first step
				if (program.comment === "" || program.comment === undefined) {
					const index = i + 1;
					const parsed = parsedControllerData[index].split(";");
					parsed.length > 1 ? (program.comment = parsed[1]) : null;
				}
				i += 1;
				// Parse program lines
				while (parsedControllerData[i] != ".END") {
					const parsed = parsedControllerData[i];
					const line = KawasakiParser.getProgramLineObject(parsed);
					if (line.errors) {
						errors = errors.concat(line.errors);
					}
					if (line.data) {
						program.lines.push(line.data);
					}
					i += 1;
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
	 *	Parse program line
	 *
	 *	Expects a utf8 string containing the contents of a parsed program line.
	 *	Returns an object of structure:
	 * {data: ProgramLineObjectAlias, errors: string[]}
	 ************************************************************************/
	static getProgramLineObject(parsedLine: string): {
		data: ProgramLineObjectAlias;
		errors: string[];
	} {
		const errors: string[] = [];
		if (parsedLine.startsWith(";")) {
			const line: ProgramLineObjectAlias = {
				type: "comment",
				line: "",
				comment: "",
			};
			line.comment = parsedLine;
			return { data: line, errors };
		} else if (parsedLine.startsWith("FN")) {
			const line: ProgramLineObjectAlias = {
				type: "function",
				comment: "",
				function: 0,
				arguments: [],
			};
			const comment = parsedLine.split(";");
			comment.length > 1 ? (line.comment = comment[1]) : null;
			const func = parsedLine.split("[")[0];
			line.function = parseInt(func.slice(2));
			let args = parsedLine.split("[")[1];
			args = args.substring(0, args.length - 1);
			line.arguments = args.split(",").filter(Boolean);
			return { data: line, errors };
		} else if (
			parsedLine.startsWith("JOINT") ||
			parsedLine.startsWith("LINEAR") ||
			parsedLine.startsWith("CIR1") ||
			parsedLine.startsWith("CIR2")
		) {
			const line: ProgramLineObjectAlias = {
				type: "block",
				comment: "",
				interpolation: "",
				speed: 0,
				accuracy: 0,
				timer: 0,
				tool: 0,
				work: 0,
				group: 0,
				mh: 0,
				inputs: "",
				outputs: "",
				joints: [],
				operation: "",
				clampInstruction: {
					clampNumber: 0,
					clamp1: false,
					clamp2: false,
					instruction1: "",
					instruction2: "",
					gunNumber1: 0,
					gunNumber2: 0,
				},
				weld: {
					weldMode1: 0,
					weldType1: 0,
					weldMode2: 0,
					weldType2: 0,
					sealer: false,
					backbar: false,
					gunType: false,
					autoCurMod: 0,
					autoTipMod: 0,
					autoWeldMod: 0,
					mat1: 0,
					thick1: 0,
					mat2: 0,
					thick2: 0,
					mat3: 0,
					thick3: 0,
					mat4: 0,
					thick4: 0,
					tipForce: 0,
					weldTime1: 0,
					weldTime2: 0,
					current1: 0,
					current2: 0,
					coolTime: 0,
					squeezeTime: 0,
					holdTime: 0,
					pulsation: 0,
					level: 0,
				},
			};
			const comment = parsedLine.split(";");
			comment.length > 1 ? (line.comment = comment[1]) : null;
			const parsed2 = parsedLine.split(" ").filter(Boolean);
			line.interpolation = parsed2[0];
			if (parsed2[1].startsWith("SPEED")) {
				line.speed = parseInt(parsed2[1].replace("SPEED", ""));
			} else {
				line.speed = parseFloat(parsed2[1]);
			}
			for (let index = 0; index < parsed2.length; index += 1) {
				if (parsed2[index].startsWith("ACCU")) {
					line.accuracy = parseInt(parsed2[index].replace("ACCU", ""));
				}
				if (parsed2[index].startsWith("TIMER")) {
					line.timer = parseInt(parsed2[index].replace("TIMER", ""));
				}
				if (parsed2[index].startsWith("TOOL")) {
					line.tool = parseInt(parsed2[index].replace("TOOL", ""));
				}
				if (parsed2[index].startsWith("WORK")) {
					line.work = parseInt(parsed2[index].replace("WORK", ""));
				}
				if (parsed2[index].startsWith("GROUP")) {
					line.group = parseInt(parsed2[index].replace("GROUP", ""));
				}
				if (parsed2[index].startsWith("MATHN")) {
					line.mh = parseInt(parsed2[index].replace("MATHN", ""));
				}
				if (
					parsed2[index].startsWith("CLAMP") &&
					parsed2[index].replace("CLAMP", "") !== ""
				) {
					line.clampInstruction.clampNumber = parseInt(
						parsed2[index].replace("CLAMP", "")
					);
				}
				if (parsed2[index] === "END" || parsed2[index] === "JUMP") {
					line.operation = parsed2[index];
				}
				if (parsed2[index].startsWith("OX")) {
					line.outputs = parsed2[index].replace("OX=", "");
				}
				if (parsed2[index].startsWith("WX")) {
					line.inputs = parsed2[index].replace("WX=", "");
				}
				if (parsed2[index].startsWith("YO=")) {
					let parse = parsed2[index].replace("YO=", "");
					parse = parse.split("^H").join("");
					const values = parse.split(",").filter(Boolean);
					if (values.length > 6) {
						values.map((value, index) => {
							const val = this.getFilledHexString(value);
							if (index === 0) {
								// SBG
								const bin = KawasakiParser.getBinaryStringFromHex(
									val[0]
								);
								line.weld.backbar = bin[bin.length - 1] === "1";
								line.weld.sealer = bin[bin.length - 2] === "1";
								line.weld.gunType = bin[bin.length - 3] === "1";

								// Material 1
								line.weld.mat1 =
									KawasakiParser.getDecimalFromHex(val[1]) >> 1;

								// Thickness 1
								line.weld.thick1 =
									(KawasakiParser.getDecimalFromHex(val[2] + val[3]) +
										60) /
									100;

								// Material 2
								line.weld.mat2 =
									KawasakiParser.getDecimalFromHex(val[5]) >> 1;

								// Thickness 2
								line.weld.thick2 =
									(KawasakiParser.getDecimalFromHex(val[6] + val[7]) +
										60) /
									100;
							}
							if (index === 1) {
								// Material 3
								line.weld.mat3 =
									KawasakiParser.getDecimalFromHex(val[1]) >> 1;

								// Thickness 3
								line.weld.thick3 =
									(KawasakiParser.getDecimalFromHex(val[2] + val[3]) +
										60) /
									100;

								// Material 4
								line.weld.mat4 =
									KawasakiParser.getDecimalFromHex(val[5]) >> 1;

								// Thickness 4
								line.weld.thick4 =
									(KawasakiParser.getDecimalFromHex(val[6] + val[7]) +
										60) /
									100;
							}
							if (index === 2) {
								// Tip Force (Neutons)
								line.weld.tipForce =
									KawasakiParser.getDecimalFromHex(val[4] + val[5]) *
									98;
							}
							if (index === 3) {
								// Mods
								const bin = KawasakiParser.getBinaryStringFromHex(
									val[0]
								);
								line.weld.autoCurMod = parseInt(bin[bin.length - 2]);
								line.weld.autoWeldMod = parseInt(bin[bin.length - 3]);
								line.weld.autoTipMod = parseInt(bin[bin.length - 4]);

								// Pulsation
								line.weld.pulsation = KawasakiParser.getDecimalFromHex(
									val[1]
								);

								// Squeeze
								line.weld.squeezeTime =
									KawasakiParser.getDecimalFromHex(val[2] + val[3]);

								// Current 1
								line.weld.current1 =
									KawasakiParser.getDecimalFromHex(val[4] + val[5]) *
									100;

								// Weld time 1
								line.weld.weldTime1 = KawasakiParser.getDecimalFromHex(
									val[6] + val[7]
								);
							}
							if (index === 4) {
								// Current 2
								line.weld.current2 =
									KawasakiParser.getDecimalFromHex(val[0] + val[1]) *
									100;

								// Weld time 2
								line.weld.weldTime2 = KawasakiParser.getDecimalFromHex(
									val[2] + val[3]
								);

								// Hold time
								line.weld.holdTime = KawasakiParser.getDecimalFromHex(
									val[4] + val[5]
								);

								// Cool time
								line.weld.coolTime = KawasakiParser.getDecimalFromHex(
									val[6] + val[7]
								);
							}
						});
					}
				}
				if (parsed2[index].startsWith("#[")) {
					let joints = parsed2[index].split(";")[0];
					joints = joints.replace("#[", "");
					joints = joints.replace("]", "");
					line.joints = joints.split(",");
				}
				if (parsed2[index].startsWith("(ON")) {
					let s = parsed2[index].replace("(", "");
					s = s.replace(")", "");
					const parsed3 = s.split(",");
					if (parsed3.length > 3) {
						let ins = "";
						switch (parsed3[3]) {
							case "0":
								ins = "R";
								break;
							case "O":
								ins = "R";
								break;
							case "1":
								ins = "W";
								break;
							case "2":
								ins = "K";
								break;
							case "3":
								ins = "P";
								break;
							case "4":
								ins = "A";
								break;
							case "5":
								ins = "L";
								break;
							case "6":
								ins = "F";
								break;
							case "7":
								ins = "H";
								break;
							case "9":
								ins = "J";
								break;
							case "10":
								ins = "C";
								break;
							case "11":
								ins = "M";
								break;
							case "13":
								ins = "S";
								break;
							case "14":
								ins = "T";
								break;
							default:
								ins = "";
								break;
						}
						if (parsed2[index].endsWith("O)")) {
							line.clampInstruction.clamp2 = true;
							line.clampInstruction.gunNumber2 = parseInt(parsed3[2]);
							line.clampInstruction.instruction2 = ins;
						} else {
							line.clampInstruction.clamp1 = true;
							line.clampInstruction.gunNumber1 = parseInt(parsed3[2]);
							line.clampInstruction.instruction1 = ins;
						}
					}
				}
			}
			return { data: line, errors };
		} else {
			const line: ProgramLineObjectAlias = {
				type: "as",
				line: "",
				comment: "",
			};
			const comment = parsedLine.split(";");
			comment.length > 1 ? (line.comment = comment[1]) : null;
			line.line = comment[0];
			return { data: line, errors };
		}
	}

	/***********************************************************************
	 *	Fill leading 0 hex string
	 *
	 *	Expects a utf8 string containing a hex value.
	 *	Returns a string with the leading 0s:
	 * string
	 ************************************************************************/
	static getFilledHexString = (hexValue: string): string => {
		return ("00000000" + hexValue).substr(-8);
	};

	/***********************************************************************
	 *	Parse hex string
	 *
	 *	Expects a utf8 string containing a hex value.
	 *	Returns a string with the binary equivalent:
	 * string
	 ************************************************************************/
	static getBinaryStringFromHex = (hexValue: string): string => {
		return ("00000000" + parseInt(hexValue, 16).toString(2)).substr(-8);
	};

	/***********************************************************************
	 *	Convert hex string to decimal int
	 *
	 *	Expects a utf8 string containing a hex value.
	 *	Returns an int:
	 * int
	 ************************************************************************/
	static getDecimalFromHex = (hexValue: string): number => {
		return parseInt(hexValue, 16);
	};

	/***********************************************************************
	 *	Parse controller string data
	 *
	 *	Expects a utf8 string array containing the contents of an as file.
	 *	Returns a promise, object of structure:
	 * {data: StringVarObjectAlias[], errors: string[]}
	 ************************************************************************/
	static getControllerStringsArray = async (
		parsedControllerData: string[]
	): Promise<{ data: StringVarObjectAlias[]; errors: string[] }> => {
		const target = `.STRINGS`;
		const data: StringVarObjectAlias[] = [];
		const errors: string[] = [];
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				i += 1;
				while (parsedControllerData[i] != ".END") {
					const parsed = parsedControllerData[i].split("=");
					const stringO: StringVarObjectAlias = {
						name: "",
						values: [],
					};
					if (parsed.length > 0) {
						stringO.name = parsed[0].trim();
						stringO.values.push(
							parsedControllerData[i].substring(
								parsedControllerData[i].indexOf('"') + 1,
								parsedControllerData[i].lastIndexOf('"')
							)
						);
						data.push(stringO);
					} else {
						errors.push(`Error: Parsed line has no members in ${target}`);
					}
					i += 1;
				}
			}
		}
		return { data: data, errors: errors };
	};

	/***********************************************************************
	 *	Parse controller Real data
	 *
	 *	Expects a utf8 string array containing the contents of an as file.
	 *	Returns a promise, object of structure:
	 * {data: RealVarObjectAlias[], errors: string[]}
	 ************************************************************************/
	static getControllerRealsArray = async (
		parsedControllerData: string[]
	): Promise<{ data: RealVarObjectAlias[]; errors: string[] }> => {
		const target = `.REALS`;
		const data: RealVarObjectAlias[] = [];
		const errors: string[] = [];
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				i += 1;
				while (parsedControllerData[i] != ".END") {
					const parsed = parsedControllerData[i].split("=");
					const stringO: RealVarObjectAlias = {
						name: "",
						values: [],
					};
					if (parsed.length > 0) {
						stringO.name = parsed[0].trim();
						stringO.values.push(parseFloat(parsed[1]));
						data.push(stringO);
					} else {
						errors.push(`Error: Parsed line has no members in ${target}`);
					}
					i += 1;
				}
			}
		}
		return { data: data, errors: errors };
	};

	/***********************************************************************
	 *	Parse controller Joint data
	 *
	 *	Expects a utf8 string array containing the contents of an as file.
	 *	Returns a promise, object of structure:
	 * {data: JointVarObjectAlias[], errors: string[]}
	 ************************************************************************/
	static getControllerJointsArray = async (
		parsedControllerData: string[]
	): Promise<{ data: JointVarObjectAlias[]; errors: string[] }> => {
		const target = `.JOINTS`;
		const data: JointVarObjectAlias[] = [];
		const errors: string[] = [];
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				i += 1;
				while (parsedControllerData[i] != ".END") {
					const parsed = parsedControllerData[i].split(" ");
					const stringO: JointVarObjectAlias = {
						name: "",
						values: [],
					};
					if (parsed.length > 0) {
						stringO.name = parsed[0].trim();
						for (let index = 1; index < parsed.length; index += 1) {
							stringO.values.push(parseFloat(parsed[index]));
						}
						data.push(stringO);
					} else {
						errors.push(`Error: Parsed line has no members in ${target}`);
					}
					i += 1;
				}
			}
		}
		return { data: data, errors: errors };
	};

	/***********************************************************************
	 *	Parse controller Trans data
	 *
	 *	Expects a utf8 string array containing the contents of an as file.
	 *	Returns a promise, object of structure:
	 * {data: TransVarObjectAlias[], errors: string[]}
	 ************************************************************************/
	static getControllerTransArray = async (
		parsedControllerData: string[]
	): Promise<{ data: TransVarObjectAlias[]; errors: string[] }> => {
		const target = `.TRANS`;
		const data: TransVarObjectAlias[] = [];
		const errors: string[] = [];
		for (let i = 0; i < parsedControllerData.length; ++i) {
			if (parsedControllerData[i].startsWith(target)) {
				i += 1;
				while (parsedControllerData[i] != ".END") {
					const parsed = parsedControllerData[i].split(" ");
					const stringO: TransVarObjectAlias = {
						name: "",
						values: [],
					};
					if (parsed.length > 0) {
						stringO.name = parsed[0].trim();
						for (let index = 1; index < parsed.length; index += 1) {
							stringO.values.push(parseFloat(parsed[index]));
						}
						data.push(stringO);
					} else {
						errors.push(`Error: Parsed line has no members in ${target}`);
					}
					i += 1;
				}
			}
		}
		return { data: data, errors: errors };
	};
}
