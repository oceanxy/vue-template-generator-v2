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
