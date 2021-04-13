# kawasaki-as-parser

<div align="center">

[![Build Status][github-actions-status]][github-actions-url]
[![Github Tag][github-tag-image]][github-tag-url]
[![StackOverflow][stackoverflow-img]][stackoverflow-url]
[![GitHub license][liscense-tag]][liscense-url]
[![npm version][npm-version-tag]][npm-version]

Node module for parsing kawasaki as backup files.

</div>

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
-  [ ] Parse Robot Programs
-  [x] Parse Controller Programs
-  [ ] Parse Robot BCD Info
-  [ ] Parse AS reals
-  [ ] Parse AS trans
-  [ ] Parse AS joints
-  [ ] Parse AS trans
-  [ ] Parse AS strings
-  [ ] Parse Spot Weld Info
-  [ ] Parse MIG Weld Info

[github-actions-status]: https://github.com/rassweiler/kawasaki-as-parser/workflows/Test/badge.svg
[github-actions-url]: https://github.com/rassweiler/kawasaki-as-parser/actions
[github-tag-image]: https://img.shields.io/github/v/tag/rassweiler/kawasaki-as-parser?label=version
[github-tag-url]: https://github.com/rassweiler/kawasaki-as-parser/releases/latest
[stackoverflow-img]: https://img.shields.io/badge/stackoverflow-robot__project__utility-blue.svg
[stackoverflow-url]: https://stackoverflow.com/questions/tagged/kawasaki-as-parser
[liscense-url]: https://github.com/rassweiler/kawasaki-as-parser/blob/master/LICENSE
[liscense-tag]: https://img.shields.io/badge/license-MIT-blue.svg
[npm-version-tag]: https://img.shields.io/npm/v/@rassweiler/kawasaki-as-parser.svg?style=flat
[npm-version]: https://www.npmjs.com/package/@rassweiler/kawasaki-as-parser
