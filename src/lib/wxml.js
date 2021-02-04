/*
 * @Author: bucai
 * @Date: 2021-02-04 10:40:19
 * @LastEditors: bucai
 * @LastEditTime: 2021-02-04 14:57:29
 * @Description:
 */


const htmlparser2 = require("htmlparser2");
const domSerializer = require('dom-serializer').default;
const FAKE_ROOT = Symbol.for('fake-root');
const defaultConfig = require('../config/default');


/**
 *
 * @param {*} code
 * @param {*} options
 */
module.exports = (code, options = defaultConfig) => {
  options.elementMap = options.elementMap || defaultConfig.elementMap;

  /**
   *
   * @param {string} doc
   */
  const parser = (doc) => {
    const handler = new htmlparser2.DomHandler();
    const parser = new htmlparser2.Parser(handler, {
      xmlMode: false,
      lowerCaseAttributeNames: false,
      recognizeSelfClosing: true,
      lowerCaseTags: false
    });
    parser.end(doc);

    return {
      type: 'tag',
      name: FAKE_ROOT,
      attribs: {},
      children: Array.isArray(handler.dom) ? handler.dom : [handler.dom]
    }
  }


  /**
   * 标签转换
   * @param {*} node
   */
  const transformTag = (node) => {
    if (node.type !== 'tag') return;
    const tag = node.name
    node.name = options.elementMap[tag] || tag
    return node;
  }
  /**
   * 属性转换
   * @param {*} node
   */
  const transformAttr = (node) => {
    if (node.type !== 'tag') return;
    const attribs = node.attribs;
    const newAttribs = {};
    if (!attribs || !Object.keys(attribs).length) return

    for (const key in attribs) {
      if (!Object.hasOwnProperty.call(attribs, key)) {
        continue;
      }
      const value = String(attribs[key]);
      let newKey = key
        .replace(/^wx:/g, 'v-')
        .replace(/^v-/g, ':')
        .replace(/^:if/g, 'v-if')
        .replace(/^:for/g, 'v-for')
        .replace(/^(bind):?/g, '@')
        .replace(/^catch:?(.*?)$/g, '@$1.capture')
        .replace(/tap$/g, 'click');

      let isV = false;

      const len = value.split(/\{\{(.*?)\}\}/).filter(item => item.trim()).length

      let newValue = value.replace(/\{\{(.*?)\}\}/g, (full, match) => {
        isV = true;
        if (len === 1) {
          return `${match}`
        } else {
          return `' + (${match}) + '`
        }
      });
      if (isV) {
        if (!/^(:|v-)/.test(newKey)) {
          newKey = ':' + newKey
        }
      }

      if (isV && len > 1) {
        newValue = `'${newValue}'`
      }

      newAttribs[newKey] = newValue
    }

    // 对 for 循环的一个操作
    // TODO: 后面还是放在 transformTree 中处理比较好
    const isForNode = Object.keys(newAttribs).find(key => key === 'v-for')

    if (isForNode) {
      const forValue = newAttribs['v-for'];
      const forKeyName = newAttribs[':key'];
      const forItemName = newAttribs['v-for-item'] || 'item';

      delete newAttribs['v-for-item'];
      const forKey = [forItemName]
      if (forKeyName === 'index') {
        forKey.unshift(forKeyName);
      } else {
        newAttribs[':key'] = [forItemName, forKeyName].join('.')
      }

      newAttribs['v-for'] = `(${forKey.join(',')}) in (${forValue})`;
      // template key 问题
      if (node.name === 'template') {
        const key = newAttribs[':key'];
        delete newAttribs[':key'];
        // TODO: 暂时不处理 子孙是 template 元素问题
        node.children.map(node => {
          if (node.type === 'tag') {
            node.attribs[':key'] = key;
          }
        })
      }
    }
    node.attribs = newAttribs
    return node;
  }
  /**
   * 内容转换
   * @param {*} node
   */
  const transformContent = (node) => {

  }

  const transformTree = (tree) => {

    if (!tree) return tree

    if (Array.isArray(tree)) {
      return tree.map(node => {
        return transformTree(node)
      })
    }
    tree.children = transformTree(tree.children);

    if (tree.tag === FAKE_ROOT) {
      return tree;
    }

    // 分开处理
    // TODO: tag 转换
    transformTag(tree)
    // TODO: attr 转换
    transformAttr(tree)
    // TODO: 内容
    transformContent(tree)

    return tree;
  }


  const treeNode = parser(code);

  const tree = transformTree(treeNode)

  const output = domSerializer(tree.children, {})

  return output;
}