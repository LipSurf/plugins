var fs = require('fs');
var esprima = require('esprima');
var _ = require('lodash');

const content = fs.readFileSync('chrome-extension/js/background-amd.js', 'utf8');
var output = [];
var replacements = [];
let entries = [];
let nodeNum = 0;
let isAliasing = -1;
let aliasMap = {};
let definedAliases = ['_'];

function friendlyModuleName(moduleName) {
    return moduleName.replace('-', '_');
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
                console.log(output[output.length - 1]);
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
        for (let block of node.arguments[2].body.body.slice(2)) {
            if (block.type === 'ExpressionStatement'
                && _.get(block, 'expression.type') === 'AssignmentExpression'
                && _.get(block, 'expression.left.object.name') === 'exports'
            ) {
                replacements.push(block.expression.left.object.range);
            }
            let modifiedContent = String.prototype.slice.apply(content, block.range);
            replacements.sort((a, b) => { return b[1] - a[1] }).forEach(n => {
                modifiedContent = modifiedContent.slice(0, n[0] - block.range[0]) + define + modifiedContent.slice(n[1] - block.range[0]);
            });
            replacements = [];
            output.push(modifiedContent);
        }
    }
});

fs.writeFileSync('chrome-extension/js/background.js', output.join('\n'));
console.log(`Success.`);