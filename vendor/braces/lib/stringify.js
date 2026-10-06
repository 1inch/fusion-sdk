'use strict';

const utils = require('./utils');
const { MAX_DEPTH } = require('./constants');

module.exports = (ast, options = {}) => {
  const stringify = (node, parent = {}, depth = 0) => {
    if (depth > MAX_DEPTH) {
      throw new RangeError(`brace nesting exceeds maximum depth of ${MAX_DEPTH}`);
    }
    const invalidBlock = options.escapeInvalid && utils.isInvalidBrace(parent);
    const invalidNode = node.invalid === true && options.escapeInvalid === true;
    let output = '';

    if (node.value) {
      if ((invalidBlock || invalidNode) && utils.isOpenOrClose(node)) {
        return '\\' + node.value;
      }
      return node.value;
    }

    if (node.value) {
      return node.value;
    }

    if (node.nodes) {
      for (const child of node.nodes) {
        output += stringify(child, node, depth + 1);
      }
    }
    return output;
  };

  return stringify(ast);
};

