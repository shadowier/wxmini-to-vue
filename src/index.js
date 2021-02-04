/*
 * @Author: bucai
 * @Date: 2021-02-04 10:34:52
 * @LastEditors: bucai
 * @LastEditTime: 2021-02-04 16:19:30
 * @Description:
 */
const fs = require('fs')
const path = require('path')
const beautify = require('js-beautify')
const { readWxComponents, traverseDir, mkdirSync } = require("./utils/index");
const defaultConfig = require('./config/default');
const transform = require('./lib')
module.exports = class {
  /**
   *
   * @param {defaultConfig} options 配置
   */
  constructor(options = defaultConfig) {
    this.options = options;
  }

  /**
   * 转换
   * @param {string} entry 入口
   * @param {string} output 出口
   */
  transform (entry, output) {
    const list = this._getDirList(path.resolve(entry))
    list.forEach(dir => {
      const components = readWxComponents(dir)
      components.forEach(({ wxml, wxjs, wxss, name }) => {
        const outputTemplate = transform.wxml(wxml || '');
        const outputJs = transform.wxjs(wxjs || '');
        const outputCss = transform.wxss(wxss || '');
        // TODO: 额外加一层避免多层情况，后续再改动
        const html = beautify.html(`<div>${outputTemplate}</div>`);
        const js = beautify.js(outputJs);
        const css = beautify.css(outputCss);
        const code = this._combination(html, js, css);
        const baseUrl = path.join(output, dir.replace(entry, ''))
        mkdirSync(baseUrl);
        const _path = path.join(baseUrl, name + '.vue');
        this._toFile(_path, code);
      });
    });
  }

  /**
   * 写入文件
   * @param {string} path
   * @param {string} str
   */
  _toFile (path, str) {
    fs.writeFileSync(path, str);
  }

  /**
   * 组装
   * @param {string} template
   * @param {string} js
   * @param {string} css
   */
  _combination (template, js, css) {
    const code = `<template>\n${template}\n</template>\n<script>\n${js}\n</script>\n<style lang="scss" scoped>\n${css}\n</style>\n`;
    return code;
  }

  /**
   * 获取目录列表
   * @param {string} entry 入口
   * @returns {Array<string>}
   */
  _getDirList (entry) {
    return traverseDir(entry)
      .filter(item => {
        return !(new RegExp(this.options.exclude.join('|')).test(item));
      });
  }
}