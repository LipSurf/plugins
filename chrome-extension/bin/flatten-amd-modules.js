//  ./flatten-amd-modules.js [input file path] [output file path]
var fs = require('fs');
var esprima = require('esprima');
var _ = require('lodash');

let inputPath = process.argv[2];
let outputPath = process.argv[3];
const content = fs.readFileSync(inputPath, 'utf8');
var output = [];
var replacements = [];
let entries = [];
let nodeNum = 0;
let isAliasing = -1;
let aliasMap = {};
let definedAliases = ['_'];
let nextReplacement = null;


function friendlyModuleName(moduleName) {
    return moduleName.replace(/-/g, '_').replace(/\//g, '_');
}
// global module names must be unique across whole codebase
//
// Define:
//  * amd modules as {}
//  * "define"d module aliases with a friendly global module name
// Remove:
//  * amd define(..., ..., function() { ... })
// Replace:
//  * exports.[value] -> module.[value]
//  * hyphens in module names with underscore
//
esprima.parseScript(content, {
    range: true
}, function(node, meta) {
    nodeNum += 1;

    if (node.type === 'MemberExpression'
        && _.get(node, 'object.name') === 'exports'
        && _.get(node, 'property.type') === 'Identifier'
    ) {
        replacements.push(node.object.range);
    }

    // take the top level define's aliases and when the aliases come
    // up as identifiers, replace them
    if (!~isAliasing
        && node.type === 'ArrayExpression'
        && _.get(node, 'elements.0.value') === 'require'
        && _.get(node, 'elements.1.value') === 'exports'
    ) {
        isAliasing = nodeNum;
        aliasArr = _.reverse(node.elements.slice(2, node.elements.length));
    } else if (~isAliasing
        && nodeNum > isAliasing + 2
    ) {
        if (node.type === 'Identifier') {
            let alias = aliasArr.pop();
            if (!~definedAliases.indexOf(node.name)) {
                output.push(`let ${node.name} = ${friendlyModuleName(alias.value)};`);
                definedAliases.push(node.name);
                // console.log(output[output.length - 1]);
            }
        } else {
            isAliasing = -1;
        }
    } else if (node.type === 'CallExpression'
        && _.get(node, 'callee.type') === 'Identifier'
        && _.get(node, 'callee.name') === 'define'
    ) {
        // assuming first 2 blocks are always "use strict" and Object.defineProperty
        let define = friendlyModuleName(node.arguments[0].value);
        output.push(`let ${define} = {};`);
        replacements.reverse();
        nextReplacement = replacements.pop();
        for (let block of node.arguments[2].body.body.slice(2)) {
            let modifiedContent = String.prototype.slice.apply(content, block.range);
            let offset = 0;
            for (;nextReplacement && nextReplacement[0] >= block.range[0] && nextReplacement[1] <= block.range[1];
                    nextReplacement = replacements.pop()) {
                modifiedContent = modifiedContent.slice(0, nextReplacement[0] - block.range[0] + offset) + define + modifiedContent.slice(nextReplacement[1] - block.range[0] + offset)
                offset += define.length - (nextReplacement[1] - nextReplacement[0]);
            }
            output.push(modifiedContent);
        }
    }
});

fs.writeFileSync(outputPath, output.join('\n'));
console.log(`Successfully transformed ${inputPath} into ${outputPath}.`);
