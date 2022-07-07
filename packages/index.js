import Vue from 'vue'
import GpsPlayer from '~/GpsPlayer'
import GpsVideo from '~/GpsVideo'
Vue.component(GpsPlayer.name, GpsPlayer)
Vue.component(GpsVideo.name, GpsVideo)
const components = [GpsPlayer, GpsVideo]
const install = function (Vue) {
  if (install.installed) return
  components.map(component => {
    Vue.use(component)
  })
}
//  全局引用可自动安装
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}
export default {
  install,
  GpsPlayer,
  GpsVideo
}
export {
  GpsPlayer,
  GpsVideo
}
