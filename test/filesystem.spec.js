import { expect, assert } from "Chai";
import KawasakiParser from "../index.js";
import { describe } from "mocha";

describe("File system IO", () => {
	describe("Existing Test File", () => {
		let kp = new KawasakiParser();
		it("Reads the file async", () => {
			return kp.readFile("./test/Samples/generic.as");
		});
		it("Returns raw file data", () => {
			return kp.readFile("./test/Samples/generic.as").then(
				result => {
					if (typeof result === "string") {
						return;
					} else {
						throw new Error("File data not typeof string");
					}
				},
				error => {
					throw error;
				}
			);
		});
		it("Returns parsed rawData", () => {
			return kp.readFile("./test/Samples/generic.as").then(
				rawData => {
					return kp.parseRawData(rawData).then(
						result => {
							if (Array.isArray(result)) {
								if (result.length != 5) {
									throw new Error(
										"Returned data does not have 5 lines"
									);
								}
								if (result[0] != ";generic") {
									throw new Error(
										"Returned data[0] doesn not equal ';generic'"
									);
								}
							} else {
								throw new Error(
									"Returned data is not an array of lines"
								);
							}
						},
						err => {
							throw err;
						}
					);
				},
				error => {
					throw error;
				}
			);
		});
		it("Returns nothing if file empty", () => {
			return kp.readFile("./test/Samples/empty.as").then(result => {
				if (result != "") {
					throw Error;
				}
			});
		});
	});
	describe("Non-existing Backup", () => {
		it("Not reads the file async", () => {
			let kp = new KawasakiParser();
			return kp
				.readFile("./test/Samples/noexist.test")
				.then(
					() => Promise.reject(new Error("Expected method to reject.")),
					error => assert.instanceOf(error, Error)
				);
		});
	});
});
