'use strict';

const { src, dest, parallel } = require('gulp');
const replace = require('gulp-replace');
const rename = require("gulp-rename");
const insert = require('gulp-insert');

const document = `
var document = {
   createTextNode: function() {},
   createElement: function() {
      return {
        hasChildNodes: function() {},
        hasAttributes: function() {},
        setAttribute: function() {},
        appendChild: function() {}
      }
   }
}
`;


const _browserRename = function(path) {
  path.basename += "_browser";
}

function blockly() {
  return src('blockly/blockly_compressed.js')
    .pipe(replace(/goog\.global\s*=\s*this;/, 'goog.global=global;'))
    .pipe(insert.wrap(`
      var DOMParser = require("xmldom").DOMParser; 
      var XMLSerializer = require("xmldom").XMLSerializer; 
      ${document}
      module.exports = (function(){`,
          //....ORIGINAL CODE....
          `Blockly.goog=goog;return Blockly;
      })()`))
    .pipe(dest('lib'));
}

function blockly_browser() {
  return src('blockly/blockly_compressed.js')
    .pipe(replace(/goog\.global\s*=\s*this;/, 'goog.global=window;'))
    .pipe(insert.wrap(`
      module.exports = (function(){`,
      //....ORIGINAL CODE....
      `Blockly.goog=goog;return Blockly;
      })()`))
    .pipe(rename(_browserRename))
    .pipe(dest('lib'));
}

function blocks() {
  return src('blockly/blocks_compressed.js')
    .pipe(insert.wrap(`
      module.exports = function(Blockly){
        var goog = Blockly.goog;
        ${document}
        Blockly.Blocks={};`,
      //....ORIGINAL CODE....
      `return Blockly.Blocks;
      }`))
    .pipe(dest('lib'));
}

function blocks_browser() {
  return src('blockly/blocks_compressed.js')
    .pipe(insert.wrap(`
      module.exports = function(Blockly){
        var goog = Blockly.goog;
        Blockly.Blocks={};`,
      //....ORIGINAL CODE....
      `return Blockly.Blocks;
      }`))
    .pipe(rename(_browserRename))
    .pipe(dest('lib'));
}

function js() {
  return src('blockly/javascript_compressed.js')
    .pipe(insert.wrap('module.exports = function(Blockly){', 'return Blockly.JavaScript;}'))
    .pipe(dest('lib'));
}

function dart() {
  return src('blockly/dart_compressed.js')
    .pipe(insert.wrap('module.exports = function(Blockly){', 'return Blockly.Dart;}'))
    .pipe(replace(/window\./g, ''))
    .pipe(dest('lib'));
}

function python() {
  return src('blockly/python_compressed.js')
    .pipe(insert.wrap('module.exports = function(Blockly){', 'return Blockly.Python;}'))
    .pipe(dest('lib'));
}

function php() {
  return src('blockly/php_compressed.js')
    .pipe(insert.wrap('module.exports = function(Blockly){', 'return Blockly.PHP;}'))
    .pipe(dest('lib'));
}

function lua() {
  return src('blockly/lua_compressed.js')
    .pipe(insert.wrap('module.exports = function(Blockly){', 'return Blockly.Lua;}'))
    .pipe(dest('lib'));
}

function en() {
  return src('blockly/msg/js/en.js')
    .pipe(replace(/goog\.[^\n]+/g, ''))
    .pipe(insert.wrap('var Blockly = {}; Blockly.Msg={};  module.exports = function(){ ', 'return Blockly.Msg;}'))
    .pipe(dest('lib/i18n/'));
}

const build = parallel(
  blocks,
  blocks_browser,
  blockly,
  blockly_browser,
  en,
  js,
  php,
  dart,
  python,
  lua
);

exports.blockly = blockly;
exports.blockly_browser = blockly_browser;
exports.blocks = blocks;
exports.blocks_browser = blocks_browser;
exports.en = en;
exports.js = js;
exports.php = php;
exports.dart = dart;
exports.python = python;
exports.lua = lua;
exports.build = build;
exports.default = build; // 设置默认任务



