/*
 * @Author: bucai
 * @Date: 2021-02-04 17:24:29
 * @LastEditors: bucai
 * @LastEditTime: 2021-02-04 18:25:06
 * @Description:
 */
const wxss = require('../../src/lib/wxss')

describe('lib/wxss', () => {

  test('检测转换', () => {

    const code = wxss('view.t text image{ font-size: 12rpx; }')

    expect(typeof code).toBe('string')
    expect(/div/.test(code)).toBe(true)
    expect(/span/.test(code)).toBe(true)
    expect(/img/.test(code)).toBe(true)
    expect(/6px/.test(code)).toBe(true)

  });

});