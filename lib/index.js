'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var prettier = _interopDefault(require('prettier'));

var langFunctions = [
  {
    name: 'isNumber',
    use: false,
    fn: `function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n)
    }\n`
  },
  {
    name: 'random',
    use: false,
    fn: `function random(start, end) {
      return Math.floor(Math.random() * (start - end + 1) + end);
    }\n`
  },
  {
    name: 'fl',
    use: false,
    fn: `function fl(obj) {
      var b = obj.first, l = obj.second, c = obj.content
      if (b === l) {
        return c
      }
      return false
    }`
  },
  {
    // https://www.npmjs.com/package/debounce
    name: 'debounce',
    use: false,
    fn: `function debounce(func, wait, immediate) {
      var timeout, args, context, timestamp, result;
      if (null == wait) wait = 100;

      function later() {
        var last = Date.now() - timestamp;

        if (last < wait && last >= 0) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) {
            result = func.apply(context, args);
            context = args = null;
          }
        }
      }

      var debounced = function() {
        context = this;
        args = arguments;
        timestamp = Date.now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
          result = func.apply(context, args);
          context = args = null;
        }

        return result;
      };

      debounced.clear = function() {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
      };

      return debounced;
    }\n`
  }
];

const functionCallers = [];
const fis = [];
const outs = [];
const variables = [];

function callFunction(n, c) {
  const match = functionCallers.find(x => x.num === n);
  if (match) {
    if (c) {
      return `${match.fn}(${c})`;
    }
    return `${match.fn}()`;
  }
  return ``;
}

function createFunction({ name, content, index, callable }) {
  let _input = ``, _content = ``;
  const matchInput = fis.filter(x => x.index === index);
  const matchOutput = outs.filter(x => x.index === index);

  if (matchInput) {
    let len = matchInput.length;

    matchInput.map((x, ic) => {
      if (len === ic) {
        _input += `${x.name}`;
      } else {
        _input += `${x.name}, `;
      }
      _content += `if (typeof ${x.name} !== '${x.type}') {
        return console.log('Error: ${x.name} is not ${x.type}!');
      }\n`;
    });
  }

  _content += content;

  const _mo = matchOutput[0];
  if (_mo && _mo.value.length > 1) {
    _content += `return ${_mo.value};`;
  }

  if (callable) {
    functionCallers.push({
      num: callable,
      fn: name
    });
  }

  return `function ${name}(${_input}) {
    ${_content}
  }`;
}

function createFunctionInput(name, type, index) {
  fis.push({
    name,
    type,
    index
  });
  return ``;
}

function createFunctionOutput(value, index) {
  outs.push({
    value,
    index
  });
  return ``;
}

function createIf(block, content, _else) {
  let _block = `if (${block}) {
    ${content}
  }`;

  if (_else) {
    _block += ` else {
      ${_else}
    }`;
  }

  return _block;
}

function createProgram(content) {
  return `(function() {
    'use strict';
    ${printVariables()}

    ${printLangFunctions()}

    ${content}
  })()`;
}

function createVariable(name, value) {
  variables.push(name);
  return `${name} = ${value}`;
}

function _debounce(fn, num) {
  const match = langFunctions.find(x => x.name === 'debounce');
  if (match) {
    match.use = true;
  }
  return `debounce(${fn}, ${num})`;
}

function _isNumber(num) {
  const match = langFunctions.find(x => x.name === 'isNumber');
  if (match) {
    match.use = true;
  }
  return `isNumber(${num})`;
}

function jsBlock(block) {
  return `${block.slice(1, -1)}`;
}

function log(value) {
  return `console.log(${value})`;
}

function random(start, end) {
  const match = langFunctions.find(x => x.name === 'random');
  if (match) {
    match.use = true;
  }
  return `random(${start}, ${end})`;
}

function printLangFunctions() {
  let _langFunctions = ``;

  langFunctions.forEach(fn => {
    if (fn.use) {
      _langFunctions += `${fn.fn}\n`;
    }
  });
  return `${_langFunctions}`;
}

function printVariables() {
  const u = new Set(variables);
  return `var ${Array.from(u)}`;
}

var ast = {
  callFunction,
  createFunction,
  createFunctionInput,
  createFunctionOutput,
  createIf,
  createProgram,
  createVariable,
  debounce: _debounce,
  isNumber: _isNumber,
  jsBlock,
  log,
  random
};

const parser = require('./parser').parser;
parser.yy = ast;

function kyblik(code) {
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

module.exports = kyblik;
