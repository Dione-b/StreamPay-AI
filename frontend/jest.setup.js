// Polyfill global fetch para ambiente de testes JSDOM
require('whatwg-fetch');

// Polyfill TextEncoder/TextDecoder para ambiente Node
const { TextEncoder, TextDecoder } = require('util');
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
