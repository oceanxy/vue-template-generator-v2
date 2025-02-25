import { createApp, h } from 'vue'

const cache = {}

export async function dynamicCompMount(Component, props) {
  if (!cache[Component.name]) {
    cache[Component.name] = Component

    return new Promise(resolve => {
      const container = document.createElement('div')
      const targetDom = document.querySelector('#tg-global-modals') || document.body
      targetDom.appendChild(container)

      const app = createApp({
        render: () => h(Component, {
          ...props,
          onDestroy: () => {
            app.unmount()
            cache[Component.name] = null
          }
        })
      })

      app.mount(container)

      resolve(app)
    })
  }

  return cache[Component.name]
}
