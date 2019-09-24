# kawasaki-as-parser

[![Build Status](https://travis-ci.org/rassweiler/kawasaki-as-parser.svg?branch=Dev)](https://travis-ci.org/rassweiler/kawasaki-as-parser)

Node module for parsing kawasaki as backup files.

## Install

### NPM

`npm install @rassweiler/kawasaki-as-parser`

Yarn

`yarn add @rassweiler/kawasaki-as-parser`

### Usage

The module's functions can be called independently:

```javascript
import KawasakiParser as kp from '@rassweiler/kawasaki-as-parser'

kp.parseRobotType(arrayOfStrings,robotNumber).then(result =>{},error =>{});
```

Or the init function can be called and will return an object containing all of the robot information:

```javascript
import KawasakiParser as kp from '@rassweiler/kawasaki-as-parser'

kp.init(rawStringData).then(result =>{},error =>{});
```

### Deprecaded

The parser originally used fs to get the raw data from files, however it was decided that the parser should not rely on node's fs. The `readFile(filePath)` function will be removed in the next major update. Instead the parser expects raw utf8 string data to be supplied.
