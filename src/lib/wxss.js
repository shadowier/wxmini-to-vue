// @ts-nocheck
/*
 * @Author: bucai
 * @Date: 2021-02-04 10:40:28
 * @LastEditors: bucai
 * @LastEditTime: 2021-02-04 18:24:14
 * @Description:
 */

const cssTree = require('css-tree')
const defaultConfig = require('../config/default');

module.exports = (code, options = defaultConfig) => {
  options.elementMap = options.elementMap || defaultConfig.elementMap;

  /**
   * 对引入的css进行一个解析
   * @param {cssTree.CssNode} node
   */
  const transformImport = (node) => {

    if (node.type !== 'Atrule' && node.name != 'import') return;

    let url = node.prelude.children.first()
    if (url.type === 'Url') {
      url = url.value.value;
    } else {
      url = url.value;
    }

    // TODO: 这里暂时不重要 懒得写
    // console.log('import url: ', url);
  }

  /**
   * 对单位进行一个处理
   * @param {cssTree.CssNode} node
   */
  const transformUnit = (node) => {
    if (node.type !== 'Dimension') return;
    // TODO: 后面要改成按配置 （单位比例）
    if (/(r|u)px/.test(node.unit)) {
      node.value = node.value / 2;
      node.unit = 'px';
    }
  }

  /**
   * 对元素选择器处理
   * @param {cssTree.CssNode} node
   */
  const transformElement = (node) => {
    if (node.type !== 'TypeSelector') return;
    node.name = options.elementMap[node.name] || node.name;
  }

  /**
   * 转换统一入口
   * @param {cssTree.CssNode} node
   */
  const transform = (node) => {
    transformImport(node)
    transformUnit(node);
    transformElement(node);
  }

  const ast = cssTree.parse(code);


  cssTree.walk(ast, (node) => {
    transform(node)
  });

  const output = cssTree.generate(ast, {
    pretty: true
  });

  return output;
}
