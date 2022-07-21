const path = require('path')
module.exports = {
  // 修改默认的入口
  pages: {
    index: {
      entry: 'examples/main.js',
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  publicPath: './',
  css: { extract: false },
  productionSourceMap: false,
  devServer: {
    hotOnly: true,
    open: true,
    proxy: {
      '/sppt': {
        target: 'http://172.16.34.29:6088/sppt', // gps
        // target: 'http://35.231.35.131:8000/sppt', // nd spw
        changeOrigin: true,
        pathRewrite: {
          '^/sppt': '/'
        }
      },
      '/ws': {
        target: 'ws://35.231.35.131:8000/sppt', // nd spw
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/ws': '/'
        }
      }
    }
  },
  chainWebpack: config => {
    // vue默认@指向src目录，这里要修正为examples，另外新增一个~指向packages
    config.resolve.alias
      .set('@', path.resolve('examples'))
      .set('~', path.resolve('packages'))
    // lib目录是组件库最终打包好存放的地方，不需要eslint检查
    // examples/docs是存放md文档的地方，也不需要eslint检查
    config.module
      .rule('eslint')
      .exclude.add(path.resolve('lib'))
      .end()
      .exclude.add(path.resolve('examples/docs'))
      .end()
    // packages和examples目录需要加入编译
    config.module
      .rule('js')
      .include.add(/packages/)
      .end()
      .include.add(/examples/)
      .end()
      .use('babel')
      .loader('babel-loader')
      .tap(options => {
        // 修改它的选项...
        return options
      })
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif)$/i)
      .use('url-loader')
      .loader('url-loader')
      .tap(options => Object.assign(options, { limit: 1024 * 100, esModule: false })) // 配置线上图片转base64。
      .end()
  }
}
