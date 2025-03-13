module.exports = {
  // 前端端口地址
  port: '8081',
  // 是否自动在浏览器中打开系统
  open: false,
  // 接口代理
  proxy: [
    {
      context: ['/example'],
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false
    }
  ]
}
