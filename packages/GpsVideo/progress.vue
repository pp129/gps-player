<template>
  <div :id="'progress'+videoId" class="progressHis" ref="progress">
    <div class="processBox" ref="processBox" @click.stop="onBoxClick" @mousemove="onmouseover" @mouseout="onmouseout">
      <div class="processBg" ref="processBg"></div>
      <div class="processCircle" ref="processCircle" @touchstart="onTouchstart"></div>
      <div class="processNow" ref="processNow"></div>
    </div>
    <span
      v-if="showTargetPoint&&duration>0"
      class="progressStepPop"
      style="position:absolute;top: -20px;" :style="{'left':targetPointLeft}">{{formatSeconds(targetPoint)}}</span>
  </div>
</template>

<script>
import qs from 'qs'
import axios from 'axios'

export default {
  name: 'v-progress',
  inject: ['GpsPlayer'],
  props: {
    videoId: {
      type: String,
      required: true
    },
    // 总时长
    duration: {
      type: Number,
      default: 0
    },
    // 倍速
    rate: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      targetPoint: 0,
      targetPointLeft: '10px',
      showTargetPoint: false,
      seekTime: 0,
      currentTime: 0, // 当前时间
      currentWidth: 0, // 当前播放条的宽度
      timeTimer: null, // 定时器
      radiusLeft: false,
      videoTime: 0// 初始化播放器播放的时间
    }
  },
  watch: {
    rate: {
      handler (newValue, oldValue) {
        if (newValue) {
          this.pause()
          this.start()
        }
      }
    }
  },
  destroyed () {
    clearInterval(this.timeTimer)
    this.timeTimer = null
  },
  methods: {
    onTouchstart (e) {
      const disX = e.changedTouches[0].clientX - this.$refs.processCircle.offsetLeft
      document.addEventListener('touchmove', (evt) => {
        let oLeft = evt.changedTouches[0].clientX - disX
        if (oLeft < 0) {
          oLeft = 0
        } else if (oLeft > this.$refs.processBox.offsetWidth - this.$refs.processCircle.offsetWidth) {
          oLeft = this.$refs.processBox.offsetWidth - this.$refs.processCircle.offsetWidth
        } else {
          this.$refs.processCircle.style.left = oLeft + 'px'
          this.$refs.processNow.style.width = oLeft + 'px'
        }
      })
      document.addEventListener('touchend', (e) => {
        document.touchmove = null
        document.touchend = null
      })
      return false
    },
    onmouseover (evt) {
      const disX = evt.layerX
      this.showTargetPoint = true
      this.targetPointLeft = evt.offsetX + 'px'
      const processWidth = this.$refs.progress.clientWidth
      // const time = this.duration * disX / processWidth
      this.targetPoint = this.duration * disX / processWidth
    },
    onmouseout () {
      this.showTargetPoint = false
    },
    onBoxClick (e) {
      const disX = e.offsetX
      // 跳转到播放的位置
      this.seek(disX)
      return false
    },
    /**
     *
     * 拖动或点击时跳转到指定位置播放
     * @param {*} width  点击或拖动的宽度
     */
    async seek (width) {
      // const video = this.$parent.$refs.videoElement
      const playing = this.timeTimer
      if (playing) {
        this.pause()
      }
      // 计算出当前的宽度
      const processWidth = this.$refs.progress.clientWidth
      console.log(processWidth)
      // 拖动位置换算成时间
      const time = this.duration * width / processWidth
      // 记录跳转的时间差
      this.seekTime = time - this.currentTime + this.seekTime
      // 设置当前位置
      this.currentWidth = time / this.duration * 100
      // const paramArr = this.$parent.deviceId.split('_')
      // 国标
      const params = {
        deviceId: this.$parent.deviceId,
        uuid: this.$parent.historyUUID,
        time: parseInt(time),
        userName: this.GpsPlayer.userName
      }
      // 先暂停
      this.$parent.pause()
      // 切换进度条位置
      this._updatePosition(time)
      const res = await axios.post('/seek', qs.stringify(params))
      const data = res.data
      if (data.flag) {
        // 调用成功
        if (playing) {
          // this.start()
        }
      } else {
        // 调用失败，把进度条位置回滚
        this._updatePosition(this.currentTime)
      }
      // // 跳转到缓存的最新位置，防止暂停一直在收码流
      // video.currentTime = video.buffered.end(video.buffered.length - 1)
      // console.log(video.currentTime)
      // // 调用之后再播放
      // this.$parent.play()
      // return data
      this.$emit('onSeek')
    },
    /**
     *
     * 跳帧时进行跳转到指定时间播放
     * @param {*} time 秒
     */
    seekFrame (time) {
      this.currentTime = parseInt(time)
      // this.nowTime.innerHTML = this._formatSeconds(time);
      // 设置播放的位置
      this.currentWidth = time / this.time * 100
      this.$refs.processCircle.style.left = this.currentWidth + '%'
      this.$refs.processNow.style.width = this.currentWidth + '%'
    },
    start () {
      const video = this.$parent.$refs.videoElement
      // const paramArr = this.$parent.deviceId.split('_')
      if (!this.rate || this.rate === 0 || this.rate === 1) {
        // 正常倍速
        this.timeTimer = setInterval(() => {
          if (this.currentTime >= this.duration) {
            this.stop()
          } else {
            // 从播放器中获取时间
            const currentTime = parseInt(video.currentTime)
            // console.log(currentTime)
            // 时间往前播放时
            if (currentTime !== this.currentTime) {
              this.currentTime = currentTime + this.seekTime
              // todo 改变时间显示
              // this.nowTime.innerHTML = this._formatSeconds(this.currentTime)
              // 获取当前时间进度条的位置获取当前时间进度条的位置
              this.currentWidth = this.currentTime / this.duration * 100
              // 改版进度条位置
              // console.log(this.$refs.processCircle.style)
              // console.log(this.currentWidth)
              this.$refs.processCircle.style.left = this.currentWidth + '%'
              this.$refs.processNow.style.width = this.currentWidth + '%'
              this.$emit('onPlaying', this.currentTime)
            }
          }
        }, 500)
      } else {
        // 有设置倍速
        this.timeTimer = setInterval(() => {
          if (this.currentTime >= this.duration) {
            this.stop()
          } else {
            const videoTime = video.currentTime
            if (videoTime !== this.videoTime) {
              // 计算播放时间
              const runTime = videoTime - this.videoTime
              // 从播放器中获取时间
              this.currentTime = this.currentTime + runTime
              // 设置播放器时间
              this.videoTime = videoTime
              // todo 改变时间显示
              // this.nowTime.innerHTML = this._formatSeconds(parseInt(this.currentTime))
              // 获取当前时间进度条的位置获取当前时间进度条的位置
              this.currentWidth = this.currentTime / this.duration * 100
              // 改版进度条位置
              this.$refs.processCircle.style.left = this.currentWidth + '%'
              this.$refs.processNow.style.width = this.currentWidth + '%'
              this.$emit('onPlaying', this.currentTime)
            }
          }
        }, 500)
      }
    },
    /**
     * 暂停
     */
    pause () {
      // clearInterval(this.moveTimer);
      clearInterval(this.timeTimer)
      // this.moveTimer = null;
      this.timeTimer = null
    }, /**
     * 停止
     */
    stop () {
      this.pause()
      // 当前播放条的宽度
      this.currentWidth = 0
      // 当前播放的时间(秒)
      this.currentTime = 0
      // this.nowTime.innerHTML = ''
      // this.timeSplit.innerHTML = ''
      // this.surplusTime.innerHTML = ''
      this.$refs.processCircle.style.left = 0 + 'px'
      this.$refs.processNow.style.width = 0 + 'px'
      return Promise.resolve()
    },
    /**
     * 清空进度条
     */
    clear () {
      // clearInterval(this.moveTimer);
      clearInterval(this.timeTimer)
    },
    /**
     * 把秒格式化成 00:00:00时间格式
     * @param {*} time
     */
    formatSeconds (time) {
      let result = parseInt(time)
      const h = Math.floor(result / 3600) < 10 ? '0' + Math.floor(result / 3600) : Math.floor(result / 3600)
      const m = Math.floor((result / 60 % 60)) < 10 ? '0' + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60))
      const s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60))
      result = `${h}:${m}:${s}`
      return result
    },
    /**
     * 更新界面位置与样式
     * @param {*} time 拖动的秒数
     */
    _updatePosition (time) {
      // 设置播放的位置
      this.$refs.processCircle.style.left = this.currentWidth + '%'
      this.$refs.processNow.style.width = this.currentWidth + '%'
      // todo 设置当前播放时间
      // this.nowTime.innerHTML = this._formatSeconds(time)
      this.currentTime = parseInt(time)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
