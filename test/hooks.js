'use strict'
import fs from "fs";
import path from 'path';
import KawasakiParser from "../lib";

export let aswRaw;
export let asw;
export let sixSpotRaw;
export let sixSpot;

before("Global Before", async () => {
	aswRaw = fs.readFileSync(path.resolve(__dirname,'./Samples/1R_ASW_F.as'),{encoding:'utf8'});
	sixSpotRaw = fs.readFileSync(path.resolve(__dirname,'./Samples/6R_Spot_S.as'),{encoding:'utf8'});
	let data = await KawasakiParser.getRobotDataStringArray(aswRaw);
	asw = data.data;
	data = await KawasakiParser.getRobotDataStringArray(sixSpotRaw);
	sixSpot = data.data;
});
