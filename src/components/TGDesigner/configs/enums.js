/**
 * 服务端保存状态。1 未保存 2 正在保存 3 已保存
 * @readonly
 * @typedef {Object.<string, number>} SAVE_STATUS
 * @enum {number}
 */
export const SAVE_STATUS = {
  UNSAVED: 1,
  SAVING: 2,
  SAVED: 3
}

/**
 * 门户-外部登录标志
 * @type {{NO_LOGIN_REQUIRED: number, LOGIN_REQUIRED: number, DISPLAY_AFTER_LOGIN: number}}
 */
export const PORTAL_LOGIN_TYPE = {
  NO_LOGIN_REQUIRED: 0,
  LOGIN_REQUIRED: 1,
  DISPLAY_AFTER_LOGIN: 2
}
