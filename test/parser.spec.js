import { expect, assert } from "Chai";
import KawasakiParser from "../index.js";
import { describe } from "mocha";

describe("Kawasaki Parser", () => {
	let kp = new KawasakiParser();
	describe("General Robot", () => {
		it("Returns robot model", () => {
			return kp.parseRobotType(data).then(result => {
				if (result.robotModel != "BX200L") {
					throw new Error(
						`Robot model doesn't equal BX200L: ${result.robotModel}`
					);
				}
			});
		});
		it("Returns robot type", () => {
			return kp.parseRobotType(data).then(result => {
				if (result.robotType != 11) {
					throw new Error(
						`Robot type doesn't equal 11: ${result.robotType}`
					);
				}
			});
		});
		it("Returns number of robots in controller", () => {
			return kp.parseRobotNumber(data).then(result => {
				if (result != 6) {
					throw new Error(`Robot number doesn't equal 6: ${result}`);
				}
			});
		});
		it("Returns TCP information for robot 1", () => {
			return kp.parseRobotTCPCOG(data, 1).then(result => {
				if (!Array.isArray(result)) {
					throw new Error(`Result is not an array: ${result}`);
				}
				if (result[0].tcp.x != -389.3) {
					throw new Error(
						`Robot 1 tool 1 tcp x value mismatch: ${result}`
					);
				}
			});
		});
		it("Returns COG information for robot 2", () => {
			return kp.parseRobotTCPCOG(data, 2).then(result => {
				if (!Array.isArray(result)) {
					throw new Error(`Result is not an array: ${result}`);
				}
				if (result[0].cog.weight != 91) {
					throw new Error(
						`Robot 1 tool 1 tcp x value mismatch: ${result}`
					);
				}
			});
		});
		it("Returns Input Comments For Robots", () => {
			return kp.parseRobotComments(data).then(result => {
				if (!Array.isArray(result.inputs)) {
					throw new Error(
						`Result.inputs is not an array: ${result.inputs}`
					);
				}
				if (result.inputs[0].comment != "Test Input") {
					throw new Error(
						`Input[0] value mismatch: ${result.inputs[0].comment}`
					);
				}
			});
		});
		it("Returns Oupt Comments For Robots", () => {
			return kp.parseRobotComments(data).then(result => {
				if (!Array.isArray(result.outputs)) {
					throw new Error(
						`Result.inputs is not an array: ${result.outputs}`
					);
				}
				if (result.outputs[0].comment != "Test Output") {
					throw new Error(
						`Output[0] value mismatch: ${result.outputs[0].comment}`
					);
				}
			});
		});
	});
	describe("Spot Robot", () => {});
	describe("MH Robot", () => {
		it("Returns NC Locator Array", () => {
			return kp.parseNCTable(data).then(result => {
				if (!Array.isArray(result)) {
					throw new Error(`Result is not an array: ${result}`);
				}
				if (result.length < 1) {
					throw new Error(`Result is an empty array: ${result}`);
				}
			});
		});
		it("Returns NC Locator Comments", () => {
			return kp.parseNCTable(data).then(result => {
				if (result[1].comment != "TEST_CMN") {
					throw new Error(
						`Result[1].comment value doesn't match: ${result[1].comment}`
					);
				}
			});
		});
		it("Returns NC Locator Joint Values", () => {
			return kp.parseNCTable(data).then(result => {
				if (result[1].joints[0] != 8.81) {
					throw new Error(
						`Result[1].joints[1] value doesn't match: ${
							result[1].joints[0]
						}`
					);
				}
			});
		});
	});
	describe("Mig Robot", () => {});
});

const data = [
	";generic",
	"ZROBOT.TYPE    34  97  11 6831     -104596   BX200L-C011 ( 2017-03-21 09:06 )",
	"ZSYSTEM         6   5   1        -106",
	"MAT_TBL[1]        0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[1] ",
	"MAT_TBL[2]        8.810     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[2] TEST_CMN",
	"MAT_TBL[3]        0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[3] ",
	"MAT_TBL[4]        0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[4] ",
	"MAT_TBL[5]        0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[5] ",
	"MAT_TBL[6]        0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[6] ",
	"MAT_TBL[7]        0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[7] ",
	"MAT_TBL[8]        0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[8] ",
	"MAT_TBL[9]        0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[9] ",
	"MAT_TBL[10]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[10] ",
	"MAT_TBL[11]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[11] ",
	"MAT_TBL[12]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[12] ",
	"MAT_TBL[13]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[13] ",
	"MAT_TBL[14]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[14] ",
	"MAT_TBL[15]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[15] ",
	"MAT_TBL[16]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[16] ",
	"MAT_TBL[17]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[17] ",
	"MAT_TBL[18]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[18] ",
	"MAT_TBL[19]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[19] ",
	"MAT_TBL[20]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[20] ",
	"MAT_TBL[21]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[21] ",
	"MAT_TBL[22]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[22] ",
	"MAT_TBL[23]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[23] ",
	"MAT_TBL[24]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[24] ",
	"MAT_TBL[25]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[25] ",
	"MAT_TBL[26]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[26] ",
	"MAT_TBL[27]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[27] ",
	"MAT_TBL[28]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[28] ",
	"MAT_TBL[29]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[29] ",
	"MAT_TBL[30]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[30] ",
	"MAT_TBL[31]       8.810     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[31] Home",
	"MAT_TBL[32]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[32] Zero",
	"MAT_TBL[33]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[33] ",
	"MAT_TBL[34]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[34] ",
	"MAT_TBL[35]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[35] ",
	"MAT_TBL[36]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[36] ",
	"MAT_TBL[37]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[37] ",
	"MAT_TBL[38]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[38] ",
	"MAT_TBL[39]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[39] ",
	"MAT_TBL[40]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[40] ",
	"MAT_TBL[41]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[41] ",
	"MAT_TBL[42]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[42] ",
	"MAT_TBL[43]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[43] ",
	"MAT_TBL[44]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[44] ",
	"MAT_TBL[45]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[45] ",
	"MAT_TBL[46]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[46]",
	"MAT_TBL[47]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[47] ",
	"MAT_TBL[48]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[48] ",
	"MAT_TBL[49]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[49] ",
	"MAT_TBL[50]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[50] ",
	"MAT_TBL[51]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[51] ",
	"MAT_TBL[52]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[52] ",
	"MAT_TBL[53]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[53] ",
	"MAT_TBL[54]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[54] ",
	"MAT_TBL[55]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[55] ",
	"MAT_TBL[56]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[56] ",
	"MAT_TBL[57]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[57] ",
	"MAT_TBL[58]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[58] ",
	"MAT_TBL[59]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[59] ",
	"MAT_TBL[60]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[60] ",
	"MAT_TBL[61]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[61] ",
	"MAT_TBL[62]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[62] ",
	"MAT_TBL[63]       0.000     0.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[63] ",
	"MAT_TBL[64]       69.000     99.000     0.000     0.000     0.000",
	"MAT_TBL_CMT[64] Last NC",
	".AUXDATA",
	"TOOL1          -389.300   116.800   400.000   180.000   180.000     0.000",
	"DFF1             91.000  -101.800  -153.700    99.000",
	"TOOL2           251.600   350.700   117.100   180.000    90.000     0.000",
	"DFF2             91.000  -101.700  -153.700    98.900",
	"TOOL3          -389.300   116.700   400.000  -180.000   180.000     0.000",
	"DFF3            105.100   -58.400  -128.600    91.300",
	"TOOL4           251.600   350.700   117.100   180.000    90.000     0.000",
	"DFF4            105.100   -58.300  -128.500    91.300",
	"TOOL5             0.000     0.000     0.000     0.000     0.000     0.000",
	"DFF5            300.000     0.000     0.000     0.000",
	"TOOL6             0.000     0.000     0.000     0.000     0.000     0.000",
	"DFF6            300.000     0.000     0.000     0.000",
	"TOOL7             0.000     0.000     0.000     0.000     0.000     0.000",
	"DFF7            300.000     0.000     0.000     0.000",
	"TOOL8             0.000     0.000     0.000     0.000     0.000     0.000",
	"DFF8            300.000     0.000     0.000     0.000",
	"TOOL9             0.000     0.000     0.000     0.000     0.000     0.000",
	"DFF9            300.000     0.000     0.000     0.000",
	".END",
	".AUXDATA2",
	"TOOL1          -389.300   116.800   400.000   180.000   180.000     0.000",
	"DFF1             91.000  -101.800  -153.700    99.000",
	"TOOL2           251.600   350.700   117.100   180.000    90.000     0.000",
	"DFF2             91.000  -101.700  -153.700    98.900",
	"TOOL3          -389.300   116.700   400.000  -180.000   180.000     0.000",
	"DFF3            105.100   -58.400  -128.600    91.300",
	"TOOL4           251.600   350.700   117.100   180.000    90.000     0.000",
	"DFF4            105.100   -58.300  -128.500    91.300",
	"TOOL5             0.000     0.000     0.000     0.000     0.000     0.000",
	"DFF5            300.000     0.000     0.000     0.000",
	"TOOL6             0.000     0.000     0.000     0.000     0.000     0.000",
	"DFF6            300.000     0.000     0.000     0.000",
	"TOOL7             0.000     0.000     0.000     0.000     0.000     0.000",
	"DFF7            300.000     0.000     0.000     0.000",
	"TOOL8             0.000     0.000     0.000     0.000     0.000     0.000",
	"DFF8            300.000     0.000     0.000     0.000",
	"TOOL9             0.000     0.000     0.000     0.000     0.000     0.000",
	"DFF9            300.000     0.000     0.000     0.000",
	".END",
	".SIG_NAME_LANG2",
	'N_OX1    "Test Output"',
	'N_OX2    "O2"',
	'N_OX3    "O3"',
	'N_OX4    "O4"',
	'N_OX5    "O5"',
	'N_OX6    "O6"',
	'N_OX7    "O7"',
	'N_OX8    "O8"',
	'N_OX9    "O9"',
	'N_OX10   "O10"',
	'N_OX11   "O11"',
	'N_OX12   "O12"',
	'N_OX13   "O13"',
	'N_OX14   "O14"',
	'N_OX15   "O15"',
	'N_OX16   "O16"',
	'N_OX17   "O17"',
	'N_OX18   "O18"',
	'N_OX19   "O19"',
	'N_OX20   "O20"',
	'N_OX21   "O21"',
	'N_OX22   "O22"',
	'N_OX23   "O23"',
	'N_OX24   "O24"',
	'N_OX25   "O25"',
	'N_OX26   "O26"',
	'N_OX27   "O27"',
	'N_OX28   "O28"',
	'N_OX29   "O29"',
	'N_OX30   "O30"',
	'N_OX31   "O31"',
	'N_OX32   "O32"',
	'N_OX33   "O33"',
	'N_OX34   "O34"',
	'N_OX35   "O35"',
	'N_OX36   "O36"',
	'N_OX37   "O37"',
	'N_OX38   "O38"',
	'N_OX39   "O39"',
	'N_OX40   "O40"',
	'N_OX41   "O41"',
	'N_OX42   "O42"',
	'N_OX43   "O43"',
	'N_OX44   "O44"',
	'N_OX45   "O45"',
	'N_OX46   "O46"',
	'N_OX47   "O47"',
	'N_OX48   "O48"',
	'N_OX49   "O49 CLAMP"',
	'N_OX50   "O50 UNCLAMP "',
	'N_OX51   "O51"',
	'N_OX52   "O52"',
	'N_OX53   "O53"',
	'N_OX54   "O54"',
	'N_OX55   "O55"',
	'N_OX56   "O56"',
	'N_OX57   "O57"',
	'N_OX58   "O58"',
	'N_OX59   "O59"',
	'N_OX60   "O60"',
	'N_OX61   "O61"',
	'N_OX62   "O62"',
	'N_OX63   "O63 WAITING POSITION(FLNET)"',
	'N_OX64   "O64 OPERATION COMPLETE(FLNET)"',
	'N_OX65   "O65 CAR TYPE COLLATION POSITION"',
	'N_OX66   "O66 CAR TYPE 1"',
	'N_OX67   "O67 CAR TYPE 2"',
	'N_OX68   "O68 CAR TYPE 4"',
	'N_OX69   "O69 CAR TYPE 8"',
	'N_OX70   "O70 NO INTERFERENCE TO CART"',
	'N_OX71   "O71 NO INTERFERENCE TO SET JIG"',
	'N_OX72   "O72 PICKUP COMPLETE IP STAND"',
	'N_OX73   "O73 SET COMPLETE TO SET JIG"',
	'N_OX74   "O74 PICK UP CMPLT CART"',
	'N_OX75   "O75 "',
	'N_OX76   "O76"',
	'N_OX77   "O77 "',
	'N_OX78   "O78"',
	'N_OX79   "O79 TRANSFER CUTOFF"',
	'N_OX80   "O80 ENTERING OK FROM ANOTHER STA."',
	'N_OX81   "O81 JIG INTERLOCK17"',
	'N_OX82   "O82 JIG INTERLOCK18"',
	'N_OX83   "O83 JIG INTERLOCK19"',
	'N_OX84   "O84 JIG INTERLOCK20"',
	'N_OX85   "O85 JIG INTERLOCK21"',
	'N_OX86   "O86 SHIFT ADV ORDER"',
	'N_OX87   "O87 JIG INTERLOCK23"',
	'N_OX88   "O88 JIG INTERLOCK24"',
	'N_OX89   "O89 JIG INTERLOCK25"',
	'N_OX90   "O90 JIG INTERLOCK26"',
	'N_OX91   "O91"',
	'N_OX92   "O92"',
	'N_OX93   "O93"',
	'N_OX94   "O94"',
	'N_OX95   "O95"',
	'N_OX96   "O96"',
	'N_OX577   "ERROR"',
	'N_OX578   "JUMP-START"',
	'N_OX579   "RPS-START"',
	'N_OX580   "ROBOT HOME POSITION"',
	'N_OX581   "CHECK MODE/PROGRAM END"',
	'N_OX582   "WAIT WX-SIGNAL"',
	'N_OX583   "GUN SEPARATE PERMISSION"',
	'N_OX584   "ROBOT USER FAULT"',
	'N_OX585   "ROBOT ALARM"',
	'N_OX586   " "',
	'N_OX587   "VSF APPROACH DETECTION"',
	'N_OX588   "tool select 1"',
	'N_OX589   "tool select 2"',
	'N_OX590   "tool select 4"',
	'N_OX591   "tool select 8"',
	'N_OX592   "ROBOT EFFECTIVE"',
	'N_OX593   "VISION COLLATION COMPLETION"',
	'N_OX594   "VISION RECOGNITION FAULT"',
	'N_OX595   "VISION COMMUNICATION FAULT"',
	'N_OX596   "CAMERA NUMBER BIT1"',
	'N_OX597   "CAMERA NUMBER BIT2"',
	'N_OX598   "CAMERA NUMBER BIT3"',
	'N_OX599   "UNUSED CAMERA BIT1"',
	'N_OX600   "UNUSED CAMERA BIT2"',
	'N_OX601   "UNUSED CAMERA BIT3"',
	'N_OX602   "CUT CABLE CHECKING WELD POINT COUNT-UP"',
	'N_OX603   "STEP-UP COMPLETE 1"',
	'N_OX604   "STEP-UP COMPLETE 2"',
	'N_OX605   "STEP-UP COMPLETE 3"',
	'N_OX606   "RWC:1"',
	'N_OX607   "RWC:2"',
	'N_OX608   "RWC:4"',
	'N_OX769   "TEACH MODE"',
	'N_OX770   "NORMAL MODE"',
	'N_OX771   "RPS MODE"',
	'N_OX772   "CYCLE START ON"',
	'N_OX773   "MOTOR POWER ON"',
	'N_OX774   "MASTER ON"',
	'N_OX775   "POWER ON"',
	'N_OX776   " "',
	'N_OX777   "RGSO"',
	'N_OX778   "ENB KEY(PB)"',
	'N_OX779   "OPERATION INHIBIT/PERMIT(SS)"',
	'N_OX780   " "',
	'N_OX781   " "',
	'N_OX782   " "',
	'N_OX783   " "',
	'N_OX784   " "',
	'N_OX785   "AUTO(SS)"',
	'N_OX786   "MANUAL(SS)"',
	'N_OX787   "TEACH MODE(SS)"',
	'N_OX788   "START-UP(PB)"',
	'N_OX789   "EXTERNAL EMERGENCY STOP INPUT"',
	'N_OX790   "SAFETY UNIT MASTER ON"',
	'N_OX791   "TEACHING PLUG ON"',
	'N_OX792   "EMERGENCY STOPPED"',
	'N_OX793   "ERROR RESET"',
	'N_OX794   " "',
	'N_OX795   " "',
	'N_OX796   " "',
	'N_OX797   "ROBOT SELECT 1"',
	'N_OX798   "ROBOT SELECT 2"',
	'N_OX799   "ROBOT SELECT 4"',
	'N_OX800   "ROBOT SELECT 8"',
	'N_WX1    "Test Input"',
	'N_WX2    "I2"',
	'N_WX3    "I3"',
	'N_WX4    "I4"',
	'N_WX5    "I5"',
	'N_WX6    "I6"',
	'N_WX7    "I7"',
	'N_WX8    "I8"',
	'N_WX9    "I9"',
	'N_WX10   "I10"',
	'N_WX11   "I11"',
	'N_WX12   "I12"',
	'N_WX13   "I13"',
	'N_WX14   "I14"',
	'N_WX15   "I15"',
	'N_WX16   "I16"',
	'N_WX17   "I17"',
	'N_WX18   "I18"',
	'N_WX19   "I19"',
	'N_WX20   "I20"',
	'N_WX21   "I21"',
	'N_WX22   "I22"',
	'N_WX23   "I23"',
	'N_WX24   "I24"',
	'N_WX25   "I25"',
	'N_WX26   "I26"',
	'N_WX27   "I27"',
	'N_WX28   "I28"',
	'N_WX29   "I29"',
	'N_WX30   "I30"',
	'N_WX31   "I31"',
	'N_WX32   "I32"',
	'N_WX33   "I33"',
	'N_WX34   "I34 MATEHAN CUT OFF"',
	'N_WX35   "I35"',
	'N_WX36   "I36 MATEHAN PARTS CONFIRM 1"',
	'N_WX37   "I37"',
	'N_WX38   "I38"',
	'N_WX39   "I39"',
	'N_WX40   "I40 NO WORK IN MATE-HAND"',
	'N_WX41   "I41"',
	'N_WX42   "I42"',
	'N_WX43   "I43"',
	'N_WX44   "I44"',
	'N_WX45   "I45"',
	'N_WX46   "I46"',
	'N_WX47   "I47"',
	'N_WX48   "I48"',
	'N_WX49   "I49 CLAMP1 END"',
	'N_WX50   "I50 UNCLAMP1 END"',
	'N_WX51   "I51 CLAMP2 END"',
	'N_WX52   "I52 UNCLAMP2 END"',
	'N_WX53   "I53"',
	'N_WX54   "I54"',
	'N_WX55   "I55"',
	'N_WX56   "I56"',
	'N_WX57   "I57"',
	'N_WX58   "I58"',
	'N_WX59   "I59"',
	'N_WX60   "I60"',
	'N_WX61   "I61"',
	'N_WX62   "I62"',
	'N_WX63   "I63"',
	'N_WX64   "I64 1ST START(FLNET)"',
	'N_WX65   "I65 CAR TYPE COLLATION OK"',
	'N_WX66   "I66"',
	'N_WX67   "I67"',
	'N_WX68   "I68"',
	'N_WX69   "I69"',
	'N_WX70   "I70 ENTERING OK CART"',
	'N_WX71   "I71 ENTERING OK SET JIG"',
	'N_WX72   "I72 PICKUP ENTER IP STAND"',
	'N_WX73   "I73 WORK CONFIRM FROM SET JIG"',
	'N_WX74   "I74 IP#1_WORK_CONFIRM"',
	'N_WX75   "I75 IP#2 WORK_CONFIRM"',
	'N_WX76   "I76 IP#3 WORK CONFIRM"',
	'N_WX77   "I77 IP#4 WORK CONFIRM"',
	'N_WX78   "I78 IP#5 WORK CONFIRM "',
	'N_WX79   "I79 MATE-HAN CUTOFF"',
	'N_WX80   "I80 PICKUP COMPLETE IP"',
	'N_WX81   "I81 IP#1_SET_OK"',
	'N_WX82   "I82 IP#2_SET_OK"',
	'N_WX83   "I83 IP#3_SET_OK"',
	'N_WX84   "I84 IP#4_SET_OK"',
	'N_WX85   "I85 IP#5_SET_OK"',
	'N_WX86   "I86 SHIFT ADVD"',
	'N_WX87   "I87 JIG INTERLOCK23"',
	'N_WX88   "I88 JIG INTERLOCK24"',
	'N_WX89   "I89 JIG INTERLOCK25"',
	'N_WX90   "I90 JIG INTERLOCK26"',
	'N_WX91   "I91 IP#1 PICKUP OK"',
	'N_WX92   "I92 IP#2 PICKUP OK"',
	'N_WX93   "I93 IP#3 PICKUP OK"',
	'N_WX94   "I94 IP#4 PICKUP OK"',
	'N_WX95   "I95 IP#5 PICKUP OK"',
	'N_WX96   "I96 JIG INTERLOCK32"',
	'N_WX577   "ERROR RESET(ROBOT)"',
	'N_WX578   "TIP FORMING MACHINE CHANGE CONDITION"',
	'N_WX579   "EXTERNAL HOLD RELEASE"',
	'N_WX580   "WAIT"',
	'N_WX581   "RETURN TO HOME POSITION"',
	'N_WX582   "2ND START"',
	'N_WX583   "PROGRAM RESET"',
	'N_WX584   "GUN NO PRESS"',
	'N_WX585   "RPS 1"',
	'N_WX586   "RPS 2"',
	'N_WX587   "RPS 4"',
	'N_WX588   "RPS 8"',
	'N_WX589   "RPS 16"',
	'N_WX590   "RPS 32"',
	'N_WX591   "RPS 64"',
	'N_WX592   "RPS ON"',
	'N_WX593   "CAMERA CUT OFF1"',
	'N_WX594   "CAMERA CUT OFF2"',
	'N_WX595   "CAMERA CUT OFF3"',
	'N_WX596   "CUT CABLE CHECKING COMPLETE"',
	'N_WX597   "LEAK CHECKING"',
	'N_WX598   "STEP-UP RESET NO.1"',
	'N_WX599   "WELDING COMPLETED FAULT"',
	'N_WX600   "GUN BRAKE RELEASE"',
	'N_WX601   "RWC:1"',
	'N_WX602   "RWC:2"',
	'N_WX603   "RWC:4"',
	'N_WX604   "GUN CONTACT DETECTION"',
	'N_WX605   "GUN SELECT 1"',
	'N_WX606   "GUN SELECT 2"',
	'N_WX607   "GUN SELECT 4"',
	'N_WX608   "GUN SELECT 8"',
	'N_WX769   "EXTERNAL CYCLE START"',
	'N_WX770   "MANUAL CLAMP MODE(PROCESS)"',
	'N_WX771   "DEVICE NORMAL"',
	'N_WX772   " "',
	'N_WX773   " "',
	'N_WX774   " "',
	'N_WX775   "JT1 AXIS SEPARATION CONFIRM"',
	'N_WX776   "JT2 AXIS SEPARATION CONFIRM"',
	'N_WX777   "JT3 AXIS SEPARATION CONFIRM"',
	'N_WX778   "JT4 AXIS SEPARATION CONFIRM"',
	'N_WX779   "JT5 AXIS SEPARATION CONFIRM"',
	'N_WX780   "JT6 AXIS SEPARATION CONFIRM"',
	'N_WX781   "BRAKE CONTROL PANEL.  ENABLE"',
	'N_WX782   " "',
	'N_WX783   " "',
	'N_WX784   " "',
	'N_WX785   "I/F PANEL PAGE 1 DISPLAY"',
	'N_WX786   "I/F PANEL PAGE 2 DISPLAY"',
	'N_WX787   "I/F PANEL PAGE 4 DISPLAY"',
	'N_WX788   "I/F PANEL PAGE 8 DISPLAY"',
	'N_WX789   "I/F PANEL PAGE 16 DISPLAY"',
	'N_WX790   "I/F PANEL PAGE 32 DISPLAY"',
	'N_WX791   " "',
	'N_WX792   " "',
	'N_WX793   "BODY SEQUENCE NO. BCD100"',
	'N_WX794   "BODY SEQUENCE NO. BCD200"',
	'N_WX795   "BODY SEQUENCE NO. BCD400"',
	'N_WX796   "BODY SEQUENCE NO. BCD800"',
	'N_WX797   "BODY SEQUENCE NO. BCD(UNUSED)"',
	'N_WX798   "BODY SEQUENCE NO. BCD(UNUSED)"',
	'N_WX799   "BODY SEQUENCE NO. BCD(UNUSED)"',
	'N_WX800   "BODY SEQUENCE NO. BCD(UNUSED)"',
	".END",
	".PROGRAM r1_pg0(); Program Zero",
	".END"
];
