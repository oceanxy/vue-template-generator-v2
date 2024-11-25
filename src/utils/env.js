import { getFirstLetterOfEachWordOfAppName } from '@/utils/utilityFunction'
import configs from '@/configs'

const appName = getFirstLetterOfEachWordOfAppName()

/**
 * 获取环境变量
 * 为了适配全局配置文件中的 prodEnvVar 配置，该方法会自动根据配置返回正确的环境变量。
 * @global
 * @param {string} [envName=BASE_ENV] 环境变量名，默认
 * @return {string}
 */
export function getEnvVar(envName = 'BASE_ENV') {
  if (process.env.NODE_ENV === 'production' && configs.prodEnvVar?.configurable) {
    return localStorage.getItem(`${appName}--${envName}`)
  } else {
    return process.env[envName]
  }
}
