export type ControllerObjectAlias = {
	controllerType: string;
	manufacturer: "Kawasaki";
	robots: RobotObjectAlias[];
	ioComments: IOCommentObjectAlias;
	commonPrograms: ProgramObjectAlias[];
	stringVars: StringVarObjectAlias[];
	realVars: RealVarObjectAlias[];
	jointVars: JointVarObjectAlias[];
	transVars: TransVarObjectAlias[];
};

export type RobotObjectAlias = {
	robotType: RobotTypeAlias;
	robotModel: string;
	bcds: BCDObjectAlias[];
	ncTable: MHTableObjectAlias[];
	tools: ToolObjectAlias[];
	installPosition: InstallPositionAlias;
	vsf: VSFObjectAlias;
	spot: SpotObjectAlias[];
	rac: RacObjectAlias[];
	programs: ProgramObjectAlias[];
};

export type RobotTypeAlias =
	| "Spot"
	| "NC"
	| "Spot-MH"
	| "Vision"
	| "Mig"
	| "Hem"
	| "Locator"
	| ""
	| "MH";

export type BCDObjectAlias = {
	bcd: number;
	program: number;
};

export type ToolObjectAlias = {
	tcp: {
		x: number;
		y: number;
		z: number;
		rx: number;
		ry: number;
		rz: number;
	};
	cog: {
		weight: number;
		x: number;
		y: number;
		z: number;
	};
};

export type InstallPositionAlias = {
	x: number;
	y: number;
	z: number;
	rx: number;
	ry: number;
	rz: number;
};

export type SoftLimitObjectAlias = {
	max: number;
	min: number;
	upper: number;
	lower: number;
};

export type VSFObjectAlias = {
	area: VSFZoneObjectAlias;
	parts: VSFZoneObjectAlias[];
	linkData: LinkObjectAlias[];
	toolSpheres: ToolSphereObjectAlias[];
	toolBoxes: ToolBoxObjectAlias[];
	softLimits: SoftLimitObjectAlias[];
};

export type ToolSphereObjectAlias = {
	index: number;
	spheres: SphereObjectAlias[];
};

export type ToolBoxObjectAlias = {
	rotation: number;
	x: number;
	y: number;
	z: number;
	depth: number;
	width: number;
	height: number;
	spheres: SphereObjectAlias[];
};

export type SphereObjectAlias = {
	x: number;
	y: number;
	z: number;
	radius: number;
};

export type LineObjectAlias = {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
};

export type VSFZoneObjectAlias = {
	enabled: boolean;
	upper: number;
	lower: number;
	lines: LineObjectAlias[];
};

export type LinkObjectAlias = {
	radius: number;
	joint: number;
	x1: number;
	y1: number;
	z1: number;
	x2: number;
	y2: number;
	z2: number;
};

export type SpotObjectAlias = {
	dresserUse: boolean;
	leakCheck: boolean;
	reweld: boolean;
	welderType: "Constant Current" | "Adaptive";
	gunType: "Pincher";
	squeeze: number;
	gunArea: number;
	maxPressure: number;
	turnsRatio: number;
	tipMovableClearance: number;
	tipFixedClearance: number;
	tipMovableWearLimit: number;
	tipFixedwearLimit: number;
	linearUp: {
		enabled: boolean;
		values: StepupObjectAlias[];
	};
	formerLinearUp: {
		enabled: boolean;
		values: StepupObjectAlias[];
	};
};

export type StepupObjectAlias = {
	onePercentSetting: number;
	onePercentValue: number;
	twoPercentSetting: number;
	twoPercentValue: number;
};

export type MHTableObjectAlias = {
	tableIndex: number;
	axisData: number[];
	comment: string;
};

export type RacObjectAlias = {
	materials: {
		materialIndex: number;
		used: boolean;
		thickness: number;
	}[];
	force1: number;
	force2: number;
	squeezeTime: number;
	interval: number;
	holdTime: number;
	preHeat: number;
	current: {
		currentIndex: number;
		value: number;
	}[];
	weldTime: {
		weldIndex: number;
		upslope: number;
		energized: number;
		downslope: number;
	}[];
};

export type ProgramObjectAlias = {
	name: string;
	comment: string;
	arguments: string[];
	lines: ProgramLineObjectAlias[];
};

export type ProgramLineObjectAlias =
	| {
			type: "block" | "function";
			comment: string;
			function: number;
			arguments: string[];
			interpolation: string;
			speed: number;
			accuracy: number;
			timer: number;
			tool: number;
			work: number;
			group: number;
			mh: number;
			inputs: string;
			outputs: string;
			joints: string[];
			operation: string;
			clamp: number;
	  }
	| {
			type: "comment" | "as";
			line: string;
			comment: string;
	  };

export type IOCommentObjectAlias = {
	inputs: {
		signal: number;
		comment: string;
	}[];
	outputs: {
		signal: number;
		comment: string;
	}[];
};

export type StringVarObjectAlias = {
	name: string;
	values: string[];
};

export type RealVarObjectAlias = {
	name: string;
	values: number[];
};

export type JointVarObjectAlias = {
	name: string;
	values: number[];
};

export type TransVarObjectAlias = {
	name: string;
	values: number[];
};
