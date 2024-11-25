import '@/assets/styles/app.scss'
import { App, Button, ConfigProvider, Empty, StyleProvider } from 'ant-design-vue'
// import { defineComponent } from 'vue'
//
// export default defineComponent({
//   setup() {
//     console.log(12333)
//   },
//   render() {
//     return (
//       <ConfigProvider
//         // componentSize={'large'}
//         renderEmpty={() => Empty.PRESENTED_IMAGE_SIMPLE}
//         wave={{ disabled: false }}
//       >
//         <p>新框架</p>
//         <Button>123</Button>
//       </ConfigProvider>
//     )
//   }
// })

export default (props, content) => {
  return (
    <ConfigProvider
      // componentSize={'large'}
      renderEmpty={() => Empty.PRESENTED_IMAGE_SIMPLE}
      wave={{ disabled: false }}
    >
      <StyleProvider hash-priority="high">
        <App>
          <p>欢迎使用框架 v2.0</p>
          <Button>好的！</Button>
        </App>
      </StyleProvider>
    </ConfigProvider>
  )
}
