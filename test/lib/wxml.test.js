/*
 * @Author: bucai
 * @Date: 2021-02-04 17:24:25
 * @LastEditors: bucai
 * @LastEditTime: 2021-02-04 18:21:23
 * @Description:
 */
const wxml = require('../../src/lib/wxml')

describe('lib/wxml', () => {

  test('检测转换', () => {

    const code = wxml('<view><text>111</text></view>')
    expect(typeof code).toBe('string')
    expect( /div/.test(code)).toBe(true)
    expect( /span/.test(code)).toBe(true)

  });

});