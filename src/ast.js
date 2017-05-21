import langFunctions from './functions';

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

export default {
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
