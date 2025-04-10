import { message } from 'ant-design-vue'
/**
 * 连字符转小驼峰
 * @example `my-profile` => `myProfile` 或者 `my_profile` => `myProfile`
 * @param {string} name - 目标字符
 * @returns {string}
 */
export function toLowerCamelCase(name) {
  return name.replace(/[-_](\w)/g, (all, letter) => letter.toUpperCase())
}

/**
 * 驼峰转连字符
 * @example `myProfile` => `my-profile`
 * @param {string} field - 目标字段
 * @returns {string}
 */
export function toLowerCase(field) {
  return field.replace(/([A-Z])/g, '-$1').toLowerCase()
}

/**
 * 图片转base64
 * @param {File | Blob} file - Blob 文件或者 File 文件
 * @returns {Promise<string>}
 */
export function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

/**
 * 首字母大写
 * @param {string} str - 目标单词
 * @returns {string}
 */
export function firstLetterToUppercase(str) {
  return str.replace(/^\S/, s => s.toUpperCase())
}

/**
 * 首字母小写
 * @param {string} str - 目标单词
 * @returns {string}
 */
export function firstLetterToLowercase(str) {
  return str.replace(/^\S/, s => s.toLowerCase())
}

/**
 * 下载文件
 * @param blobOrUrl {Blob | string} - Blob 对象或者 文件路径
 * @param [fileName] {string} - 文件名称
 */
export function downloadFile(blobOrUrl, fileName) {
  if (blobOrUrl instanceof Blob && window.navigator.msSaveBlob) {
    window.navigator.msSaveBlob(blobOrUrl, fileName)
  } else {
    const urlObj = blobOrUrl instanceof Blob ? URL.createObjectURL(blobOrUrl) : blobOrUrl
    const tmp = document.createElement('a')
    const body = document.querySelector('body')

    tmp.style.display = 'none'
    tmp.download = fileName
    tmp.href = urlObj
    tmp.target = '_blank'
    body.appendChild(tmp)

    tmp.click() // 模拟点击实现下载
    body.removeChild(tmp)

    setTimeout(function () {
      // 延时释放
      URL.revokeObjectURL(urlObj)
    }, 1000)
  }
}

export async function batchDownloadFile(files) {
  const batchSize = 10
  const delay = 1000
  const result = []

  const downloadBatch = async (batch) => {
    const promiseList = batch.map(file => {
      return new Promise((resolve, reject) => {
        try {
          if (typeof file === 'object') {
            downloadFile(file.url, file.name)
          } else {
            downloadFile(file)
          }
          resolve(null)
        } catch {
          reject('下载错误')
        }
      })
    })

    const batchResult = await Promise.allSettled(promiseList)

    batchResult.forEach((item, index) => {
      result.push({
        isSuccess: item.status === 'fulfilled',
        name: batch[index].name,
        url: batch[index].url
      })
    })
  }

  const delayPromise = (ms) => new Promise((resolve) => { setTimeout(resolve, ms) })

  // 这里使用递归去执行分批下载
  const processBatches = async (remainingFiles) => {
    if (remainingFiles.length === 0) {
      return
    }

    const batch = remainingFiles.slice(0, batchSize)
    const remaining = remainingFiles.slice(batchSize)

    await downloadBatch(batch)
    await delayPromise(delay)
    await processBatches(remaining)
  }

  await processBatches(files)

  return result
}

/**
 * 获取应用名称每个单词的首字母组成的字符串
 * @example 'create-a-new-projects' => 'canp'
 * @param {string} [appName=process.env.TG_APP_NAME] - 默认当前项目名：process.env.TG_APP_NAME（src/apps 下的文件夹名）
 * @returns {string}
 */
export function getFirstLetterOfEachWordOfAppName(appName = process.env.TG_APP_NAME) {
  return (appName)
    .split('-')
    .map(i => i[0])
    .join('')
}

/**
 * 生成 UUID
 * @param {number} [len=16] - 长度。默认16个字符
 * @param {number} [radix=16] - 基数。默认16，即16进制数
 * @returns {string}
 */
export function getUUID(len = 16, radix = 16) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  const uuid = []
  let i

  radix = radix || chars.length

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]
  } else {
    // rfc4122, version 4 form
    let r

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4'

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16
        uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r]
      }
    }
  }

  return uuid.join('')
}

/**
 * 删除 route.path 最后的 “/”（如果有）
 * @param {string} path - 需要处理的 path
 * @return {string}
 */
export function replacePath(path) {
  return path.replace(/([a-zA-Z0-9\-/]+)(\/)$/g, '$1')
}

/**
 * 睡眠函数
 * @param {number} [time=200] - 睡眠时间，默认200毫秒
 * @return {Promise<unknown>}
 */
export function sleep(time = 200) {
  return new Promise(resolve => setTimeout(resolve, time))
}

/**
 * 在一个对象中，用字符串形式的 key 来取值
 * @example `object['a.b.c']`解析为`object[a][b][c]`或者`object.a.b.c`
 * @param {string} stringKey - key
 * @param {Object} obj - 取值对象
 * @return {*}
 */
export function getValueFromStringKey(stringKey, obj) {
  if (stringKey.includes('.')) {
    return stringKey.split('.').reduce((prev, cur) => prev[cur], obj)
  } else {
    return obj[stringKey]
  }
}

export function setValueToStringKey(stringKey, value, obj) {
  if (stringKey.includes('.')) {
    const keys = stringKey.split('.')
    const lastKey = keys.pop()
    keys.reduce((prev, cur) => prev[cur], obj)[lastKey] = value
  } else {
    obj[stringKey] = value
  }
}

/**
 * 将枚举对象转换为对应的数组。
 * @param enumeration {Object} - 枚举对象，键为值，值为标签。
 * @param [options={}] {Object} - 配置选项。
 * @config [showEmptyOption] {boolean} - 在枚举数组中新增一个值为空字符串的选项。
 * @config [emptyOptionLabel] {boolean} - 值为空字符串的选项对应的文本，默认“全部”。
 * @config [convertValueToNumber] {boolean} - 是否将返回值中的`value`字段转换成`Number`类型。
 * 注意，如果值为空字符串时，该值将不会转换，直接原样输出。
 * @returns {{label: *, value: *}[]} - 包含标签和值的对象数组。
 * @throws {Error} 如果 enumeration 不是一个有效的对象。
 */
export function getArrayFromEnum(enumeration, options = {}) {
  if (typeof enumeration !== 'object' || enumeration === null) {
    throw new Error('The enumeration parameter must be a valid object.')
  }

  // 解构赋值并提供默认值
  const {
    showEmptyOption = false,
    convertValueToNumber = false,
    emptyOptionLabel = '全部'
  } = options

  // 获取枚举对象的键值对，并确保顺序一致
  const array = Object.keys(enumeration).map(key => ({
    label: enumeration[key],
    value: convertValueToNumber && key !== '' ? +key : key
  }))

  // 处理包含“全部”选项的情况
  if (showEmptyOption) {
    array.unshift({ label: emptyOptionLabel, value: '' })
  }

  return array
}

/**
 * 文本复制
 * @param {string} text - 需要复制的文本
 */

export const copyText = async (text) => {
  if (!navigator.clipboard) {
    const input = document.createElement("input");
    input.setAttribute("value", text);
    document.body.appendChild(input);
    input.select();

    try {
      if (document.execCommand("copy")) {
        message.success('复制成功。');
      } else {
        message.error('复制失败。');
      }
    } catch (err) {
      console.error("复制失败:", err);
      message.error('复制失败。');
    } finally {
      document.body.removeChild(input);
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    message.success('复制成功。');
  } catch (err) {
    console.error("复制失败:", err);
    message.error('复制失败。');
  }
};

