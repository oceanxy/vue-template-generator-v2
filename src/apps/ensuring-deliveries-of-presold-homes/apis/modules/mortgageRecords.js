import qs from 'qs'

export default {
  /**
   * 获取抵押记录分页集合
   * @param [request]
   * @param data
   * @returns {*}
   */
  getMortgageRecords(request, data) {
    return request({
      url: '/estate/hypothecateRecord/getHypothecateRecordPageList',
      method: 'post',
      data: qs.stringify(data)
    })
  },
  /**
   * 新增抵押记录
   * @param request
   * @param data
   * @returns {*}
   */
  addMortgageRecords(request, data) {
    return request({
      url: '/estate/hypothecateRecord/add',
      method: 'post',
      data
    })
  },
  /**
   * 修改抵押记录
   * @param request
   * @param data
   * @returns {*}
   */
  updateMortgageRecords(request, data) {
    return request({
      url: '/estate/hypothecateRecord/update',
      method: 'post',
      data
    })
  },
  /**
   * 删除抵押记录
   * @param request
   * @param data
   * @returns {*}
   */
  deleteMortgageRecords(request, data) {
    return request({
      url: '/estate/hypothecateRecord/delete',
      method: 'post',
      data: qs.stringify(data, { arrayFormat: 'comma' })
    })
  },
  /**
   * 导出抵押记录数据
   * @param request
   * @param params
   * @returns {*}
   */
  exportMortgageRecords(request, params) {
    return request({
      url: '/estate/hypothecateRecord/exportExcel',
      method: 'get',
      params,
      responseType: 'blob'
    })
  },
  /**
   * 修改抵押记录状态
   * @param request
   * @param data
   * @returns {*}
   */
  updateMortgageRecordsStatus(request, data) {
    return request({
      url: '/estate/hypothecateRecord/updateStatus',
      method: 'post',
      data: qs.stringify(data)
    })
  },
  /**
   * 解除签约
   * @param request
   * @param data
   * @returns {*}
   */
  hypothecateRecordPurchase(request, data) {
    return request({
      url: '/estate/hypothecateRecord/purchase',
      method: 'post',
      data: qs.stringify(data)
    })
  },

  /**
   * 上传导入文件
   * @param [request]
   * @param formData
   * @returns {*}
   */

  hypothecateRecordImportFile(request, formData) {
    return request({
      url: '/estate/hypothecateRecord/importFile',
      method: 'post',
      data: formData
    })
  },

  /**
   * 导入成功数据
   * @param [request]
   * @param data
   * @returns {*}
   */
  hypothecateRecordImportSuccessData(request, data) {
    return request({
      url: '/estate/hypothecateRecord/importSuccessData',
      method: 'post',
      data
    })
  },

  /**
   * 下载失败数据
   * @param request
   * @param params
   * @returns {*}
   */
  hypothecateRecordDownFailExcel(request, params) {
    return request({
      url: '/estate/hypothecateRecord/downFailExcel',
      method: 'get',
      params,
      responseType: 'blob'
    })
  },

  /**
   * 获取导入模板
   * @param request
   * @param data
   * @returns {*}
   */
  hypothecateRecordGetTemplateUrl(request, data) {
    return request({
      url: '/estate/hypothecateRecord/getTemplateUrl',
      method: 'post',
      data
    })
  }
}
