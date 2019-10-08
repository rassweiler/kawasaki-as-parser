# kawasaki-as-parser

[![Build Status](https://travis-ci.org/rassweiler/kawasaki-as-parser.svg?branch=master)](https://travis-ci.org/rassweiler/kawasaki-as-parser)

Node module for parsing kawasaki as backup files.

## Install

### NPM

`npm install @rassweiler/kawasaki-as-parser`

Yarn

`yarn add @rassweiler/kawasaki-as-parser`

### Usage

```javascript
import KawasakiParser from "@rassweiler/kawasaki-as-parser";
```

The module's functions can be called independently:

```javascript
let info = await KawasakiParser.getRobotInformationObject(
	utf8StringArray,
	robotNumber
);
```

Or the `getControllerObject()` function can be called and will return an object containing all of the robot information:

```javascript
let controller = await KawasakiParser.getControllerObject(utf8StringFromAsFile);
```

## Milestones

-  [x] Parse comments
-  [ ] Parse Robot Block Programs
-  [ ] Parse Robot AS Programs
-  [ ] Parse Robot BCD Info
-  [ ] Parse AS reals
-  [ ] Parse AS trans
-  [ ] Parse AS joints
-  [ ] Parse AS trans
-  [ ] Parse AS strings
-  [ ] Parse Spot Weld Info
-  [ ] Parse MIG Weld Info
