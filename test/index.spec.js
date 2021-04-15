import fs from "fs";
import { expect } from "chai";
import KawasakiParser from "../lib/index";
import { data } from "./Samples/data.js";

describe('The getRobotDataStringArray function', () =>{
	it('Should return an object with data and errors if passed an empty string', async ()=> {
		const data = await KawasakiParser.getRobotDataStringArray("");
		expect(data).to.be.a('object');
		expect(data).to.have.property('data');
		expect(data).to.have.property('errors');
	});

	it('Should contain errors if passed an empty string', async ()=> {
		const data = await KawasakiParser.getRobotDataStringArray("");
		expect(data.errors).to.be.a('array');
		expect(data.errors).to.not.have.lengthOf(0);
	});
});

describe('The getControllerObject function', () =>{
	it('Should return an object if passed an empty string', async ()=> {
		const controllerObject = await KawasakiParser.getControllerObject("");
		expect(controllerObject).to.be.a('object');
	});

	it('Should have an empty controllerType if passed an empty string', async ()=> {
		const controllerObject = await KawasakiParser.getControllerObject("");
		expect(controllerObject.controllerType).to.be.equal('');
	});

	it('Should have Kawasaki as a manufacturer if passed an empty string', async ()=> {
		const controllerObject = await KawasakiParser.getControllerObject("");
		expect(controllerObject.manufacturer).to.be.equal('Kawasaki');
	});

	it('Should contain no robots if passed an empty string', async ()=> {
		const controllerObject = await KawasakiParser.getControllerObject("");
		expect(controllerObject.robots).to.be.a('array');
		expect(controllerObject.robots).to.be.eql([]);
	});

	it('Should contain no common programs if passed an empty string', async ()=> {
		const controllerObject = await KawasakiParser.getControllerObject("");
		expect(controllerObject.commonPrograms).to.be.a('array');
		expect(controllerObject.commonPrograms).to.be.eql([]);
	});

	it('Should contain no IO comments if passed an empty string', async ()=> {
		const controllerObject = await KawasakiParser.getControllerObject("");
		expect(controllerObject.ioComments).to.be.a('object');
		expect(controllerObject.ioComments).to.be.eql({inputs:[], outputs: []});
	});

	it('Should contain errors if passed an empty string', async ()=> {
		const controllerObject = await KawasakiParser.getControllerObject("");
		expect(controllerObject.errors).to.be.a('array');
		expect(controllerObject.errors).to.not.have.lengthOf(0);
	});
});
/*
describe("Kawasaki Parser", () => {
	describe("General Robot", () => {
		it("Returns robot 1 model", () => {
			return KawasakiParser.getRobotInformationObject(data, 1).then(
				result => {
					if (result.robotModel != "BX200L") {
						throw new Error(
							`Robot model doesn't equal BX200L: ${result.robotModel}`
						);
					}
				}
			);
		});
		it("Returns robot 1 type", () => {
			return KawasakiParser.getRobotInformationObject(data, 1).then(
				result => {
					if (result.robotType != 11) {
						throw new Error(
							`Robot type doesn't equal 11: ${result.robotType}`
						);
					}
				}
			);
		});
		it("Returns number of robots in controller", () => {
			return KawasakiParser.getNumberOfRobotsInController(data).then(
				result => {
					if (result != 6) {
						throw new Error(`Robot number doesn't equal 6: ${result}`);
					}
				}
			);
		});
		it("Returns TCP information for robot 1", () => {
			return KawasakiParser.getRobotTCPCOGArray(data, 1).then(result => {
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
			return KawasakiParser.getRobotTCPCOGArray(data, 2).then(result => {
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
			return KawasakiParser.getRobotIOCommentsObject(data).then(result => {
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
		it("Returns Ouput Comments For Robots", () => {
			return KawasakiParser.getRobotIOCommentsObject(data).then(result => {
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
		it("Returns Install Position For Robot 1", () => {
			return KawasakiParser.getRobotInstallPositionObject(data, 1).then(
				result => {
					if (result.x != 100.5) {
						throw new Error(`Result.x value mismatch: ${result.x}`);
					}
					if (result.rx != 0) {
						throw new Error(`Result.rx value mismatch: ${result.rx}`);
					}
				}
			);
		});
		it("Returns Limit Data For Robot 1", () => {
			return KawasakiParser.getRobotJointLimitArray(data, 1).then(result => {
				if (result[0].max != 200) {
					throw new Error(`Result.x value mismatch: ${result.x}`);
				}
				if (result[0].upper != 180) {
					throw new Error(`Result.rx value mismatch: ${result.rx}`);
				}
			});
		});
		it("Returns VSF Link Data For Robot 1", () => {
			return KawasakiParser.getRobotVSFLinkArray(data, 1).then(result => {
				if (result.length === 0) {
					throw new Error(`link data result is empty`);
				}
				if (result[0].radius != 200) {
					throw new Error(
						`Result[0].radius value mismatch: ${result[0].radius}`
					);
				}
			});
		});
		it("Returns VSF Area Data For Robot 1", () => {
			return KawasakiParser.getRobotVSFAreaObject(data, 1).then(result => {
				if (result.area.lines.length != 8) {
					throw new Error(
						`result.area.lines.length value mismatch: ${result.area.lines.length}`
					);
				}
				if (result.area.lines[0].x1 != -1150) {
					throw new Error(
						`result.area.lines[0].x1 value mismatch: ${result.area.lines[0].x1}`
					);
				}
				if (result.parts.length != 8) {
					throw new Error(
						`result.parts.length value mismatch: ${result.parts.length}`
					);
				}
				if (result.parts[0].lines[0].x1 != 200) {
					throw new Error(
						`result.parts[0].lines[0].x1 value mismatch: ${result.parts[0].lines[0].x1}`
					);
				}
			});
		});
		it("Returns VSF Tool Sphere Data For Robot 1", () => {
			return KawasakiParser.getRobotVSFToolSphereArray(data, 1).then(
				result => {
					if (result.length != 9) {
						throw new Error(
							`result.length value mismatch: ${result.length}`
						);
					}
					if (result[0].spheres[0].radius != 210) {
						throw new Error(
							`result[0].spheres[0].radius value mismatch: ${result[0].spheres[0].radius}`
						);
					}
				}
			);
		});
		it("Returns VSF Tool Box Data For Robot 1", () => {
			return KawasakiParser.getRobotVSFToolBoxArray(data, 1).then(result => {
				if (result.length != 9) {
					throw new Error(
						`result.length value mismatch: ${result.length}`
					);
				}
				if (result[0].x != 20) {
					throw new Error(`result[0].x value mismatch: ${result[0].x}`);
				}
				if (result[0].spheres.length != 2) {
					throw new Error(
						`result[0].spheres.length value mismatch: ${result[0].spheres.length}`
					);
				}
			});
		});
		it("Returns Controller Object", () => {
			return fs.promises
				.readFile("./test/Samples/generic.as", "utf8")
				.then(rawData => {
					return KawasakiParser.getControllerObject(rawData).then(
						result => {
							if (result === null) {
								throw new Error(`result is null: ${result}`);
							}
							if (typeof result != "object") {
								throw new Error(`result is not an object: ${result}`);
							}
						}
					);
				});
		});
		it("Returns generic programs", () => {
			return KawasakiParser.getControllerProgramsArray(data).then(result => {
				if (result.length < 1) {
					throw new Error(
						`result.length value mismatch: ${result.length}`
					);
				}
			});
		});
	});
	describe("Spot Robot", () => {
		it("Returns robot 1 programs", () => {
			return KawasakiParser.getRobotProgramsArray(data, 1).then(result => {
				if (result.length < 1) {
					throw new Error(
						`result.length value mismatch: ${result.length}`
					);
				}
			});
		});
	});
	describe("MH Robot", () => {
		it("Returns NC Locator Array", () => {
			return KawasakiParser.getNCTableArray(data).then(result => {
				if (!Array.isArray(result)) {
					throw new Error(`Result is not an array: ${result}`);
				}
				if (result.length < 1) {
					throw new Error(`Result is an empty array: ${result}`);
				}
			});
		});
		it("Returns NC Locator Comments", () => {
			return KawasakiParser.getNCTableArray(data).then(result => {
				if (result[1].comment != "TEST_CMN") {
					throw new Error(
						`Result[1].comment value doesn't match: ${result[1].comment}`
					);
				}
			});
		});
		it("Returns NC Locator Joint Values", () => {
			return KawasakiParser.getNCTableArray(data).then(result => {
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
*/
