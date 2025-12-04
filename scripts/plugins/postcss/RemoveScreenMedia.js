const postcss = require('postcss')

module.exports = postcss.plugin('remove-screen-media', (options = {}) => {
  return (root, result) => {
    const {
      removeAllScreen = true,      // 是否移除所有screen
      keepRules = [],              // 保留的特定规则
      removeOnly = false,          // 仅移除不提取
      logRemoved = true            // 日志记录
    } = options

    let removedCount = 0

    root.walkAtRules('media', (atRule) => {
      const mediaParams = atRule.params.toLowerCase()

      // 检查是否为screen查询
      const isScreenQuery = mediaParams.includes('screen')
      const isOnlyScreen = mediaParams.includes('only screen')

      // 判断是否应该移除
      let shouldRemove = false

      if (removeAllScreen) {
        // 移除所有包含screen的查询
        shouldRemove = isScreenQuery
      } else {
        // 仅移除纯screen或only screen
        shouldRemove = mediaParams === 'screen' || mediaParams === 'only screen'
      }

      // 检查是否在保留列表中
      const shouldKeep = keepRules.some(rule =>
        mediaParams.includes(rule.toLowerCase())
      )

      if (shouldRemove && !shouldKeep) {
        if (removeOnly) {
          // 仅移除@media规则，但保留内部样式（移到外部）
          atRule.nodes.forEach(node => {
            atRule.parent.insertBefore(atRule, node.clone())
          })
        }

        atRule.remove()
        removedCount++

        if (logRemoved) {
          console.log(`🗑️  Removed: @media ${mediaParams}`)
        }
      }
    })

    if (logRemoved && removedCount > 0) {
      console.log(`📊 总计移除 ${removedCount} 个screen媒体查询`)
    }
  }
})
