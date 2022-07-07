import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import ningde from '@/views/ningde.vue'
import history from '@/views/history.vue'

Vue.use(VueRouter)

// 捕获push replace中的错误
// 当然在replace中的错误也是可以相同的进行捕获
const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace
// push
VueRouter.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}
// replace
VueRouter.prototype.replace = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalReplace.call(this, location, onResolve, onReject)
  return originalReplace.call(this, location).catch(err => err)
}

export const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '实时视频'
    }
  },
  {
    path: '/ningde',
    name: 'ningde',
    component: ningde,
    meta: {
      title: '云台操作'
    }
  },
  {
    path: '/history',
    name: 'history',
    component: history,
    meta: {
      title: '历史视频'
    }
  }
]

const router = new VueRouter({
  routes
})

export default router
