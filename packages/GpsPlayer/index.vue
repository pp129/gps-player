<template>
<div :id="containerId"
     ref="container"
     class="container"
     :class="[flex?'flex flex-'+flex:'',relative||draggable?'relative':'']"
     :style="[{'width':containerWidth,'height':containerHeight},containerPosition]">
  <!-- 拖拽 -->
  <div v-if="draggable" ref="drag" class="drag" @mousedown="onmousedown($event)" @mouseup="onmouseup">
    <slot name="drag">&#9769;</slot>
  </div>
  <!-- 关闭 -->
  <div v-if="closeable" class="close" @click="close">
    <slot name="close">&times;</slot>
  </div>
  <!-- 加入隐藏对讲播放器 -->
  <audio style='width:0;height:0' autoplay :id="talkbackId"></audio>
  <slot></slot>
</div>
</template>

<script>
import axios from 'axios'
import Cookies from 'js-cookie'
import { JSEncrypt } from 'jsencrypt'
import { nanoid } from 'nanoid'
import qs from 'qs'

export default {
  name: 'GpsPlayer',
  provide () {
    return {
      GpsPlayer: this
    }
  },
  props: {
    // 父容器id
    containerId: {
      type: String,
      default () {
        return `container-${nanoid()}`
      }
    },
    width: {
      type: [String, Number],
      default () {
        return '360px'
      }
    },
    height: {
      type: [String, Number],
      default () {
        return '202.5px'
      }
    },
    top: {
      type: [String, Number]
    },
    left: {
      type: [String, Number]
    },
    right: {
      type: [String, Number]
    },
    bottom: {
      type: [String, Number]
    },
    // 布局
    layout: {
      type: Number,
      default: 1,
      validator (value) {
        return [1, 4, 9, 16].includes(value)
      }
    },
    // 是否显示工具栏
    tool: {
      type: Boolean,
      default: false
    },
    // 后台路径
    server: {
      type: String,
      required: true
    },
    // 用户名
    userName: {
      type: String,
      required: true
    },
    // 密码
    password: {
      type: String,
      required: true
    },
    selectOnClick: {
      type: Boolean,
      default: false
    },
    flex: {
      type: [String, Boolean],
      default: false
    },
    relative: {
      type: Boolean,
      default: false
    },
    // 拖拽
    draggable: {
      type: Boolean,
      default: false
    },
    // 关闭
    closeable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    containerWidth () {
      return typeof this.width === 'string' ? this.width : this.width.toString() + 'px'
    },
    containerHeight () {
      return typeof this.height === 'string' ? this.height : this.height.toString() + 'px'
    },
    videoCount () {
      return this.$slots.default.length
    },
    containerPosition () {
      const left = this.left ? { left: typeof this.left === 'string' ? this.left : this.left.toString() + 'px' } : {}
      const right = this.right ? { right: typeof this.right === 'string' ? this.right : this.right.toString() + 'px' } : {}
      const top = this.top ? { top: typeof this.top === 'string' ? this.top : this.top.toString() + 'px' } : {}
      const bottom = this.bottom ? { bottom: typeof this.bottom === 'string' ? this.bottom : this.bottom.toString() + 'px' } : {}
      return { ...left, ...right, ...top, ...bottom }
    }
  },
  watch: {
  },
  data () {
    return {
      token: '',
      talkbackId: `talkback${this.containerId}`,
      load: false,
      container: null,
      fullDivIndex: null,
      fullScreenIndex: null,
      publicKey: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCxesfHzXbRZ/QCYFr9uhj+OhYuvw7qJC5o6MCexJoNrxu6a9aLXvz9OMXIQMpvcbGua1E1MXcTiaHTRTphaSOYhtVNdef5EaTy/LHcovzNF05xTLI9/32239hMykJTWtp0z/IeZOBT6lVN30WQBvOfP7CnTyVHZ9jtPqW0OAQSPwIDAQAB',
      flvPlayerArr: [],
      deviceArr: [],
      progressArr: [],
      infoWebsocketArr: [],
      unplayIdArray: [],
      downloadMap: new Map(),
      downloadWebsocketMap: new Map(),
      mediaRecorderArray: [],
      playSpeedArray: [],
      pauseArray: [],
      selectedIndex: 0,
      screenNameArray: [],
      currentTalkBackIndex: null,
      activeId: '',
      activeIndex: null,
      isSelected: false
    }
  },
  methods: {
    init () {
      this.container = document.getElementById(this.containerId)
      // 设置外部容器底色
      this.container.style.cssText = this.container.style.cssText + ';background-color:black;box-sizing:'
      // 添加窗口改变大小方法
      this.containerWidth = getComputedStyle(this.container, null).width
      this.containerHeight = getComputedStyle(this.container, null).height
    },
    getCode (password) {
      // new一个对象
      const encrypt = new JSEncrypt()
      // 设置公钥
      encrypt.setPublicKey(this.publicKey)
      return encrypt.encrypt(password)
    },
    setServer () {
      axios.defaults.baseURL = this.server + '/api'
      // 修改请求头
      axios.interceptors.request.use(request => {
        const userToken = Cookies.get('playerUserToken')
        if (userToken) {
          const encrypt = new JSEncrypt()
          // 设置公钥
          encrypt.setPublicKey(this.publicKey)
          const token = userToken.split('.')
          const token1 = encrypt.encrypt(token[0])
          const token2 = encrypt.encrypt(token[1])
          const token3 = encrypt.encrypt(token[2])
          request.headers.UserToken1 = token1
          request.headers.UserToken2 = token2
          request.headers.UserToken3 = token3
        }
        return request
      }, error => {
        return Promise.reject(error)
      })
    },
    login () {
      const params = {
        userName: this.userName,
        password: this.getCode(this.password)
      }
      return axios.post('/login', qs.stringify(params)).then(res => {
        return Promise.resolve(res)
      }).catch(err => {
        return Promise.reject(err)
      })
    },
    setActive (value, isSelected) {
      if (this.selectOnClick) {
        console.log('active value', value)
        this.activeIndex = this.$slots.default.findIndex(x => x.elm.id === 'videoContainer-' + value)
        console.log('active index', this.activeIndex)
        this.isSelected = isSelected
        this.$emit('onSelect', this.activeIndex, value, isSelected)
      }
    },
    resetContainer () {
      this.$slots.default.forEach(video => {
        console.log(video.elm)
        video.elm.__vue__.showVideo = !video.elm.__vue__.showVideo
      })
    },
    /**
     * 监听鼠标移动事件
     * @param evt
     */
    onmousedown (evt) {
      // event的兼容性
      const ev = evt || event

      // 获取鼠标按下的坐标
      const x1 = ev.clientX
      const y1 = ev.clientY

      // 获取元素的left，top值
      const l = this.$refs.container.offsetLeft
      const t = this.$refs.container.offsetTop

      // 给可视区域添加鼠标的移动事件
      document.onmousemove = (eve) => {
        // event的兼容性
        const evn = eve || event

        // 获取鼠标移动时的坐标
        const x2 = evn.clientX
        const y2 = evn.clientY

        // 计算出鼠标的移动距离
        const x = x2 - x1
        const y = y2 - y1

        // 移动的数值与元素的left，top相加，得出元素的移动的距离
        const lt = y + t
        const ls = x + l

        // 更改元素的left，top值
        this.$refs.container.style.top = lt + 'px'
        this.$refs.container.style.left = ls + 'px'
      }
    },
    onmouseup () {
      document.onmousemove = null
    },
    keydown (e) {
      const eve = e || event
      const key = eve.keyCode
      console.log(key)
      let action = ''
      if (this.isSelected) {
        console.log(this.$slots.default[this.activeIndex])
        switch (key) {
          case 37:
            action = 'ptzleft'
            break
          case 38:
            action = 'ptzup'
            break
          case 39:
            action = 'ptzright'
            break
          case 40:
            action = 'ptzdown'
            break
        }
        if (action) {
          this.$slots.default[this.activeIndex].elm.__vue__.ptzController(action)
        }
      }
    },
    keyup () {
      if (this.isSelected) {
        this.$slots.default[this.activeIndex].elm.__vue__.ptzController('ptzstop')
      }
    },
    close () {
      this.$emit('onClose')
    },
    getHisResourceList (params) {
      return axios.post('/getHisResourceList', qs.stringify(params)).then(res => {
        console.log(res)
        const data = res.data
        if (data.flag) {
          return Promise.resolve(data.entity)
        }
      }).catch(err => {
        return Promise.reject(err)
      })
    }
  },
  created () {
    this.setServer()
    // console.log(this.$slots)
    this.login().then(res => {
      this.load = true
      if (res.data.flag) {
        Cookies.set('playerUserToken', res.data.entity, 1)
        this.token = res.data.entity
      } else {
        // for (let i = 0; i <= this.layout; i++) {
        //   this.setMsg(i, res.data.message)
        // }
        this.$slots.default.forEach(node => {
          node.child.setMsg(res.data.message)
        })
      }
    }).catch(() => {
      this.load = false
      // for (let i = 0; i <= this.layout; i++) {
      //   this.setMsg(i, '登录失败，请重新登录')
      // }
      this.$slots.default.forEach(node => {
        node.child.setMsg('登录失败，请重新登录')
      })
    })
  },
  mounted () {
    window.addEventListener('keydown', this.keydown)
    window.addEventListener('keyup', this.keyup)
  },
  destroyed () {
    window.removeEventListener('keydown', this.keydown)
    window.removeEventListener('keyup', this.keyup)
  }
}
</script>

<style lang="scss" scoped>
.flex{
  display: flex;
  display: -webkit-flex;
  flex-direction: row;
  flex-wrap: wrap;
  &-space-around{
    justify-content: space-around;
  }
  &-space-between{
    justify-content: space-between;
  }
}
.relative{
  position: absolute;
}
.drag{
  position:absolute;
  top: -20px;
  left: 0;
  cursor:move;
}
.close{
  position:absolute;
  top: -20px;
  right: 0;
  cursor:pointer;
}
</style>
