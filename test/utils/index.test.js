/*
 * @Author: bucai
 * @Date: 2021-02-04 16:23:18
 * @LastEditors: bucai
 * @LastEditTime: 2021-02-04 17:08:34
 * @Description:
 */
const { statSync } = require('fs');
const { resolve } = require('path');
const utils = require('../../src/utils')

describe('utils/index.js', () => {

  const mockPath = resolve(__dirname, '../mock');
  const outputPath = resolve(__dirname, '../output');

  test('检测 traverseDir', () => {

    const list = utils.traverseDir(mockPath)
    const containPath = resolve(mockPath, 'agreement')

    expect(list.length).toBeGreaterThan(1)
    expect(list).toContain(containPath)

  });

  test('检测 readWxComponents', () => {
    const list = utils.readWxComponents(resolve(mockPath, 'branch'))

    const oneComponent = list.find(item => item.name === 'branch');

    expect(list.length).toBe(1)
    expect(oneComponent).not.toBeUndefined()
    expect(oneComponent.name).toBe('branch')
    expect(oneComponent.wxml).not.toBeUndefined()
  });

  test('检测mkdirSync', () => {
    const _path = resolve(outputPath, './test/test/111');
    utils.mkdirSync(_path);

    expect(() => {
      statSync(_path)
    }).not.toThrowError()

    expect(statSync(_path).isDirectory()).toBe(true)
  });

});