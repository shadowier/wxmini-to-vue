/*
 * @Author: bucai
 * @Date: 2021-02-04 10:40:39
 * @LastEditors: bucai
 * @LastEditTime: 2021-02-04 16:07:27
 * @Description:
 */
const fs = require('fs')
const path = require('path')

/**
 * 遍历目录并返回目录列表
 * @param {string} entry 开始的目录
 * @returns {Array<string>}
 */
const traverseDir = (entry) => {
  const dirList = [entry]
  const list = fs.readdirSync(entry)
  list.forEach(name => {
    const _path = path.join(entry, name)
    const stat = fs.statSync(_path)
    if (stat.isDirectory()) {
      dirList.push(...traverseDir(_path))
    }
  });
  return dirList;
};

exports.traverseDir = traverseDir;

/**
 * 读取微信组件
 * @param {string} dir 入口目录
 */
const readWxComponents = (dir) => {
  const stat = fs.statSync(dir)
  if (!stat.isDirectory()) throw new Error("该路径错误或不存在")

  const fileList = fs.readdirSync(dir);

  const componentNameList = fileList
    .filter(item => /\.wxml$/.test(item))
    .map(item => item.replace('.wxml', ''));

  return componentNameList.map(name => {
    // 检测 wxml
    // 检测 wxss
    // 检测 wxjs
    const [wxml, wxss, wxjs] = ['wxml', 'wxss', 'js'].map(type => {
      const filePath = path.join(dir, name + '.' + type);
      const stat = fs.statSync(filePath)
      if (!stat.isFile()) return null;
      const code = fs.readFileSync(filePath).toString('utf-8')
      return code
    });
    return {
      wxml,
      wxss,
      wxjs,
      name
    };
  }).filter(({ wxml }) => wxml);
};
exports.readWxComponents = readWxComponents;

function mkdirSync (dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}
exports.mkdirSync = mkdirSync;
