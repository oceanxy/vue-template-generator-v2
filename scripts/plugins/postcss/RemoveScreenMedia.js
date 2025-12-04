/**
 * 移除媒体查询
 * @param options
 * @return {{postcssPlugin: string, Once(*, {result: *}): void}}
 */
module.exports = (options = {}) => {
  const {
    removeAllScreen = true,
    keepRules = [],
    removeOnly = false,
    logRemoved = true
  } = options

  return {
    postcssPlugin: 'remove-screen-media',
    Once(root, { result }) {
      let removedCount = 0
      const filePath = result.opts.from ? ` (${result.opts.from})` : ''

      root.walkAtRules('media', (atRule) => {
        const mediaParams = atRule.params.toLowerCase()
        const isScreenQuery = mediaParams.includes('screen')
        const isOnlyScreen = mediaParams.includes('only screen')

        let shouldRemove = false

        if (removeAllScreen) {
          shouldRemove = isScreenQuery
        } else {
          shouldRemove = mediaParams === 'screen' || mediaParams === 'only screen'
        }

        const shouldKeep = keepRules.some(rule =>
          mediaParams.includes(rule.toLowerCase())
        )

        if (shouldRemove && !shouldKeep) {
          if (removeOnly) {
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
        console.log(`📊  该文件已移除 ${removedCount} 个媒体查询${filePath}`)
      }
    }
  }
}

module.exports.postcss = true
