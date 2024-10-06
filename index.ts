import 'react-native-polyfill-globals/auto';

const { polyfillGlobal } = require("react-native/Libraries/Utilities/PolyfillFunctions");

const { TransformStream } = require('web-streams-polyfill/ponyfill/es6');
const { TextEncoderStream, TextDecoderStream } = require("@stardazed/streams-text-encoding");

polyfillGlobal('TransformStream', () => TransformStream);
polyfillGlobal("TextEncoderStream", () => TextEncoderStream);
polyfillGlobal("TextDecoderStream", () => TextDecoderStream);

import 'expo-router/entry'