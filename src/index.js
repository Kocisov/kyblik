import prettier from 'prettier';
import ast from './ast';

const parser = require('./parser').parser;
parser.yy = ast;

export default function kyblik(code) {
  return prettier.format(parser.parse(code), {
    parser: 'babylon',
    printWidth: 80,
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5',
    useTabs: false
  });
}
