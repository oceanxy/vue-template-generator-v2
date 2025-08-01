import { createApp, h } from 'vue'
import { toLowerCase } from '@/utils/utilityFunction'

const appCache = {}

export async function dynamicCompMount(Component, props) {
  const id = toLowerCase(Component.name)
  const targetDom = document.querySelector('#tg-global-modals') || document.body
  const isExistDom = !!Array.prototype.some.call(targetDom.children, child => child.id === id)

  if (isExistDom) return

  appCache[id]?.unmount()

  return new Promise(resolve => {
    const container = document.createElement('div')
    container.id = id
    targetDom.appendChild(container)

    const app = createApp({
      render: () => h(Component, props)
    })

    appCache[id] = app
    app.mount(container)

    resolve()
  })
}
