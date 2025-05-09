import dayjs from 'dayjs'

/**
 * 验证邮件格式
 * @param rule
 * @param value
 */
export function verifyEmail(rule, value) {
  return new Promise((resolve, reject) => {
    if (rule.required || value) {
      const EMAIL_REG = /^[A-Za-z0-9]+([_.][A-Za-z0-9]+)*@([A-Za-z0-9-]+\.)+[A-Za-z]{2,6}$/

      if (!EMAIL_REG.test(value)) {
        reject('邮箱地址有误')
      }
    }

    resolve()
  })
}

/**
 * 验证身份证号码格式
 * @param rule
 * @param value
 */
export async function verifyIDNumber(rule, value) {
  return new Promise((resolve, reject) => {
    if (rule.required || value) {
      const ID_REG_18 = /^([1-6][1-9]|50)\d{4}(18|19|20)\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
      const ID_REG_15 = /^([1-6][1-9]|50)\d{4}\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}$/

      // 校验身份证：
      if (!ID_REG_18.test(value) && !ID_REG_15.test(value)) {
        reject('身份证号码格式有误')
      }
    }

    resolve()
  })
}

/**
 * 验证手机号格式（宽松）
 * @param rule
 * @param value
 */
export async function verifyMobileNumber(rule, value) {
  return new Promise((resolve, reject) => {
    if (rule.required || value) {
      const MOBILE_NUMBER_REG = /^1[3-9]\d{9}$/

      if (!MOBILE_NUMBER_REG.test(value)) {
        reject('手机号码格式有误')
      }
    }

    resolve()
  })
}

/**
 * 验证固定电话号码格式
 * @param rule
 * @param value
 */
export async function verifyLandlineNumber(rule, value) {
  return new Promise((resolve, reject) => {
    if (rule.required || value) {
      const LANDLINE_NUMBER_REG = /^(0\d{2,3}-?)?[1-9]\d{6,7}$/

      if (!LANDLINE_NUMBER_REG.test(value)) {
        reject('电话号码格式有误')
      }
    }

    resolve()
  })
}

/**
 * 同时验证手机号码和固定电话号码格式
 * @param rule
 * @param value
 */
export async function verifyPhoneNumber(rule, value) {
  return new Promise((resolve, reject) => {
    if (rule.required || value) {
      const MOBILE_NUMBER_REG = /^1[3-9]\d{9}$/
      const LANDLINE_NUMBER_REG = /^(0\d{2,3}-?)?[1-9]\d{6,7}$/

      if (!MOBILE_NUMBER_REG.test(value) && !LANDLINE_NUMBER_REG.test(value)) {
        reject('电话号码格式有误')
      }
    }

    resolve()
  })
}

/**
 * 验证给定日期范围是否与目标日期范围存在交叉
 * @param {() => [dayjs, dayjs][]} getDateRange - 目标日期范围
 * @param {unitOfTime.Base | unitOfTime._date} [unit] - 如果要将粒度限制为毫秒以外的单位，请将单位作为第三个参数传递。
 *  详见：https://momentjs.cn/docs/#/query/is-between/
 * @param {(value: any) => [dayjs, dayjs]} [formatValue]  - 格式化时间控件值的函数。
 * 请确保`value`的格式为`[dayjs, dayjs]`：第一个`dayjs`为要比对的开始时间，第二个`dayjs`为要比对的结束时间。
 * @return {(function(*, *, *): void)|*}
 */
export const verifyIsDateRangeBetween = (getDateRange, unit = 'second', formatValue) => (rule, value, callback) => {
  value = formatValue?.(value) ?? value

  if (rule.required || value?.length) {
    for (const range of getDateRange()) {
      if (
        !dayjs(value[1])
          .endOf(unit)
          .isBefore(/** @type dayjs */range[0].startOf(unit)) &&
        !dayjs(value[0])
          .startOf(unit)
          .isAfter(/** @type dayjs */range[1].endOf(unit))
      ) {
        rule.message = rule.message.replace(
          '{date}',
          dayjs(value[0]).format('YYYY-MM-DD') + ' 至 ' + dayjs(value[1]).format('YYYY-MM-DD') + ' '
        )

        callback(new Error(rule.message))
      }
    }
  }

  callback()
}

/**
 * 验证给定日期是否介于目标日期范围之间
 * @param range {[dayjs, dayjs][]} - 目标日期范围
 * @param [unit] {string} - 如果要将粒度限制为毫秒以外的单位，请将单位作为第三个参数传递。详见：https://momentjs.cn/docs/#/query/is-between/
 * @param [inclusivity] {string} - 日期包容性，默认“()”。详见 https://momentjs.cn/docs/#/query/is-between/
 * @return {(function(*, *, *): void)|*}
 */
export const verifyIsDateBetween = (range, unit = 'second', inclusivity = '()') => (rule, value, callback) => {
  if (rule.required || value) {
    for (const r of range) {
      if (
        dayjs(value).isBetween(
          r[0].startOf(unit),
          r[1].endOf(unit),
          unit,
          inclusivity
        )
      ) {
        callback(new Error(rule.message.replace('{date}', dayjs(value).format('YYYY-MM-DD')) + ' '))
      }
    }
  }

  callback()
}
