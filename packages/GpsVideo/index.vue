<template>
  <div :id="'videoContainer-'+videoId" ref="videoContainer" v-show="showVideo"
       class="videoContainer"
       :class="[isSelected?'videoContainerSelected':'',relative?'position':'']"
       :style="{'width':videoWidth,'height':videoHeight,'left':position.left,'right':position.right,'top':position.top,'bottom':position.bottom}"
       @click="setActive"
       @dblclick="onVideoDblClick"
       @mousedown="onmousedown($event)"
       @mouseup="onmouseup($event)"
       @mousewheel="onmousewheel"
       @mouseenter="onmouseenter"
       @mouseleave="onmouseleave">
    <div v-if="showLoading" class='loading' :id="'loading'+videoId"></div>
    <div ref="videoDiv" :id="'videoDiv'+videoId" class="videoDiv">
      <!-- 标题 -->
      <div v-if="showTitle" ref="videoTitle" class='videoTitle' :id="'videoTitle'+videoId">{{videoTitle}}</div>
      <!-- 工具栏 -->
      <div :id="'videoToolBar'+videoId" class="videoToolBar" v-show="showToolBar">
        <!-- 进度条 历史视频播放时显示 -->
        <v-progress v-if="showProgress" ref="onprogress" :video-id="videoId" :duration="duration" :rate="rate" @onPlaying="onPlayHistory" @onSeek="onSeek"></v-progress>
<!--        <div v-if="showProgress" :id="'progress'+videoId" class="progressHis">
          &lt;!&ndash; 进度悬浮提示 &ndash;&gt;
          <span
            v-if="showTargetPoint&&duration>0"
            class="progressStepPop"
            style="position:absolute;top: -20px;" :style="{'left':targetPointLeft}">{{formatSeconds(targetPoint)}}</span>
          &lt;!&ndash; 进度条主体 &ndash;&gt;
          <input
            ref="processRange"
            class="progress"
            type="range"
            v-model="progressPoint"
            :max="duration"
            min="0"
            step="1"
            @change="changeProcess($event)"
            @mousemove="onmousemove($event)"
            @mouseleave="showTargetPoint = false"
            style="width: 100%;margin-bottom:3px;"
            :style="progressFillStyle">
        </div>-->
        <!-- 播放/暂停 按钮 -->
        <div v-if="toolPlay" class="toolBtn" :id="toolsMap.play.id" :class="toolsMap.play.active?'play':'pause'" :title="toolsMap.play.active?'播放':'暂停'" @click="playEvent"></div>
        <!-- 停止按钮 -->
        <div v-if="toolStop" class="toolBtn stop" :id="toolsMap.stop.id" :title="'停止'" @click.prevent="stop()"></div>
        <!-- 静音/声音开启 按钮 -->
        <div v-if="toolMuted" class="toolBtn" :id="toolsMap.muted.id" :class="toolsMap.muted.active?'muted':'unmuted'" :title="toolsMap.muted.active?'声音':'静音'" @click="mutedEvent"></div>
        <!-- 通话/结束通话 按钮 -->
        <div v-if="toolTalk" class="toolBtn" :id="toolsMap.talk.id" :class="toolsMap.talk.active?'startTalk':'stopTalk'" :title="toolsMap.talk.active?'开始对讲':'结束对讲'" @click="talkEvent"></div>
        <!-- 云台 按钮 -->
        <div v-if="ptzControl&&toolControl&&!showProgress" class="toolBtn control" :id="toolsMap.control.id" :title="toolsMap.control.active?'开启云台操作':'关闭云台操作'" @click.prevent.stop="controlEvent">{{toolsMap.control.active?'开启云台':'关闭云台'}}</div>
        <!-- 时间进度 历史视频播放时显示 -->
        <div v-if="showProgress" :id="'progressTime'+videoId" class="progressTime">
          <div :id="'timeBox'+videoId" class="timeBox">
            <div :id="'nowTime'+videoId" class="nowTime">{{nowTime}}</div>
            <div :id="'timeSplit'+videoId" class="timeSplit">/</div>
            <div :id="'surplusTime'+videoId" class="surplusTime">{{surplusTime}}</div>
          </div>
        </div>
        <!-- 历史视频倍速 -->
        <div v-if="showProgress" :id="'progressRate'+videoId" class="progressRate">
          <div @click="setOperation(1)" class="toolBtn fastBackward"></div>
          <select v-if="showRate" @change="setRate" v-model="rate" class="rateSelection">
            <option v-for="(item,index) in rateList[operation]" :key="index" :value="item.value">{{ item.name }}</option>
          </select>
          <div @click="setOperation(0)" class="toolBtn fastForward"></div>
        </div>
        <!-- 画面拉伸/标准 按钮 -->
        <div v-if="toolTiling" class="toolBtn" :id="toolsMap.tiling.id" :class="toolsMap.tiling.active?'tiling':'untiling'" :title="toolsMap.tiling.active?'拉伸':'标准'" @click="tilingEvent">{{toolsMap.tiling.active?'拉伸':'标准'}}</div>
        <!-- 截图 按钮 -->
        <div v-if="toolSnapshot" class="toolBtn snapshot" :id="toolsMap.snapshot.id" title="截屏" @click="snapshot"></div>
        <!-- 全屏/取消全屏 按钮 -->
        <div v-if="toolFullScreen" class="toolBtn" :id="toolsMap.fullScreen.id" :class="toolsMap.fullScreen.active?'fullScreen':'narrowScreen'" :title="toolsMap.fullScreen.active?'全屏':'缩屏'" @click="fullScreenEvent"></div>
        <!-- 录制/取消录制 按钮 -->
        <div v-if="toolRecord" class="toolBtn" :id="toolsMap.record.id" :class="toolsMap.record.active?'startRecord':'stopRecord'" :title="toolsMap.record.active?'开始录制':'结束录制'" @click="recordEvent"></div>
        <!-- 滤镜 按钮 -->
        <div v-if="toolSetting" class="toolBtn" :id="toolsMap.setting.id" :class="toolsMap.setting.active?'openSetting':'closeSetting'" :title="toolsMap.setting.active?'开启滤镜':'关闭滤镜'" @click="settingEvent"></div>
      </div>
      <!-- 消息 -->
      <div :id="'msgDiv'+videoId" class="msgDiv"></div>
      <!-- 滤镜设置弹框 -->
      <div v-if="showSetting" :id="'settingDiv'+videoId" class="settingDiv">
        <div class="settingTitleDiv"></div>
        <!-- 关闭滤镜弹框按钮 -->
        <div class="settingCloseDiv" :id="'settingCloseDiv'+videoId" ref="settingCloseDiv" @click="closeSetting"></div>
        <!-- 调整亮度滑块 -->
        <div class="filterDiv" style="margin-top: 30px;">
          <div class="filterLable">亮&nbsp;&nbsp;&nbsp;&nbsp;度</div>
          <input style="width: 62%;cursor: pointer;" type="range" v-model="brightnessVal" min="0" max="200" @change="setBrightnessVal">
          <div class="filterVal">{{ brightnessVal }}</div>
        </div>
        <!-- 调整色度滑块 -->
        <div class="filterDiv">
          <div class="filterLable">色&nbsp;&nbsp;&nbsp;&nbsp;度</div>
          <input style="width: 62%;cursor: pointer;" type="range" v-model="grayscaleVal" min="0" max="100" @change="setGrayscaleVal">
          <div class="filterVal">{{ grayscaleVal }}</div>
        </div>
        <!-- 调整对比度滑块 -->
        <div class="filterDiv">
          <div class="filterLable">对比度</div>
          <input style="width: 62%;cursor: pointer;" type="range" v-model="contrastVal" min="0" max="200" @change="setContrastVal">
          <div class="filterVal">{{ contrastVal }}</div>
        </div>
        <!-- 调整饱和度滑块 -->
        <div class="filterDiv">
          <div class="filterLable">饱和度</div>
          <input style="width: 62%;cursor: pointer;" type="range" v-model="saturateVal" min="0" max="200" @change="setSaturateVal">
          <div class="filterVal">{{ saturateVal }}</div>
        </div>
      </div>
      <!-- 视频元素 -->
      <video ref="videoElement" :style="objectFitStyle" width="100%" height="100%" class="videoElement" :id="'videoElement'+videoId" muted autoplay :poster="poster"></video>
    </div>
  </div>
</template>

<script>
import { nanoid } from 'nanoid'
import axios from 'axios'
import qs from 'qs'
import flvJs from 'flv.js'
import getBlobDuration from 'get-blob-duration'
import ysFixWebmDuration from 'fix-webm-duration'
import vProgress from '~/GpsVideo/progress'
import poster from '~/images/poster.png'
// import dayjs from 'dayjs'

export default {
  name: 'GpsVideo',
  inject: ['GpsPlayer'],
  components: { vProgress },
  props: {
    videoId: {
      type: String,
      default () {
        return `video-${nanoid()}`
      }
    },
    deviceId: {
      type: [String, Number]
    },
    fileId: {
      type: [String, Number]
    },
    tools: {
      type: Array,
      default () {
        return ['play', 'stop', 'muted', 'talk', 'tiling', 'snapshot', 'fullScreen', 'record', 'setting', 'control']
      }
    },
    videoTitle: {
      type: String
    },
    screenName: {
      type: String
    },
    // 封面
    poster: {
      type: String,
      default () {
        return poster
      }
    },
    // 播放状态
    state: {
      type: [String, Object],
      validator (value) {
        console.log(value)
        // 播放、暂停、停止
        return ['play', 'pause', 'stop', '', null, undefined].includes(value)
      }
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    width: {
      type: [String, Number]
    },
    height: {
      type: [String, Number]
    },
    position: {
      type: Object,
      default () {
        return {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        }
      }
    },
    objectFit: {
      type: String,
      default: 'fill',
      validator (value) {
        return ['contain', 'fill', 'cover', 'none', 'scale-down', 'inherit', 'initial', 'revert', 'unset'].includes(value)
      }
    },
    ptzControl: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      VideoUrl: '',
      showVideo: true,
      unPlayTimer: null,
      flvPlayer: null,
      paused: false,
      playSpeed: '',
      device: null, // = this.deviceId + '_' + this.fileId
      mediaRecorder: null,
      audioContext: null,
      audioWebsocket: null,
      audioStream: null,
      currentTalkBackIndex: null,
      infoWebsocket: null,
      showLoading: false,
      isSelected: false,
      toolsMap: {
        play: { btn: 'play', id: `playBtn${this.videoId}`, class: 'toolBtn play', title: '播放', active: true },
        // pause: { id: `pauseBtn${this.videoId}`, class: 'toolBtn pause', title: '暂停' },
        stop: { btn: 'stop', id: `stopBtn${this.videoId}`, class: 'toolBtn stop', title: '停止' },
        muted: { btn: 'muted', id: `mutedBtn${this.videoId}`, class: 'toolBtn muted', title: '声音', active: true },
        // unmuted: { id: `unmutedBtn${this.videoId}`, class: 'toolBtn unmuted', title: '静音' },
        talk: { btn: 'talk', id: `startTalkBtn${this.videoId}`, class: 'toolBtn startTalk', title: '开始对讲', active: true },
        control: { btn: 'control', id: `startControlBtn${this.videoId}`, class: 'toolBtn startControl', title: '开启云台操作', active: true },
        // stopTalk: { id: `stopTalkBtn${this.videoId}`, class: 'toolBtn stopTalk', title: '结束对讲' },
        progressTime: { btn: 'progressTime', id: `progressTime${this.videoId}`, class: 'progressTime', title: '' },
        tiling: { btn: 'tiling', id: `tilingBtn${this.videoId}`, class: 'toolBtn tiling', title: '拉伸', text: '拉伸', active: true },
        // untiling: { id: `untilingBtn${this.videoId}`, class: 'toolBtn untiling', title: '标准' },
        snapshot: { btn: 'snapshot', id: `snapshotBtn${this.videoId}`, class: 'toolBtn snapshot', title: '截屏' },
        fullScreen: { btn: 'fullScreen', id: `fullScreenBtn${this.videoId}`, class: 'toolBtn fullScreen', title: '全屏', active: true },
        // narrowScreen: { id: `narrowScreenBtn${this.videoId}`, class: 'toolBtn narrowScreen', title: '缩屏' },
        record: { btn: 'record', id: `startRecordBtn${this.videoId}`, class: 'toolBtn startRecord', title: '开始录制', active: true },
        // stopRecord: { id: `stopRecordBtn${this.videoId}`, class: 'toolBtn stopRecord', title: '结束录制' },
        setting: { btn: 'setting', id: `openSettingBtn${this.videoId}`, class: 'toolBtn openSetting', title: '开启滤镜', active: true }
        // closeSetting: { id: `closeSettingBtn${this.videoId}`, class: 'toolBtn closeSetting', title: '关闭滤镜' }
      },
      showSetting: false,
      nowTime: '00:00:00',
      surplusTime: '00:00:00',
      showToolBar: false,
      showProgress: false,
      showTitle: false,
      videoScreenName: this.screenName,
      mousemove: {
        x: 0,
        y: 0,
        timing: 0
      },
      videoTitleValue: this.videoTitle,
      brightnessVal: 100,
      grayscaleVal: 0,
      contrastVal: 100,
      saturateVal: 100,
      fileIdPlay: '',
      deviceIdPlay: '',
      historyUUID: '',
      progress: false,
      progressPoint: 0,
      showTargetPoint: false,
      targetPoint: 0,
      targetPointLeft: '10px',
      duration: 0,
      progressTimer: null,
      seekTime: 0,
      rate: 1,
      rateList: {
        0: [
          { name: '1/16X', value: 0.0625 },
          { name: '1/8X', value: 0.125 },
          { name: '1/4X', value: 0.25 },
          { name: '1/2X', value: 0.5 },
          { name: '1X', value: 1 },
          { name: '2X', value: 2 },
          { name: '4X', value: 4 },
          { name: '8X', value: 8 },
          { name: '16X', value: 16 }
        ],
        1: [
          { name: '1/16X', value: -0.0625 },
          { name: '1/8X', value: -0.125 },
          { name: '1/4X', value: -0.25 },
          { name: '1/2X', value: -0.5 },
          { name: '1X', value: -1 },
          { name: '2X', value: -2 },
          { name: '4X', value: -4 },
          { name: '8X', value: -8 },
          { name: '16X', value: -16 }
        ]
      },
      rateIndex: 4,
      currentTime: 0,
      showRate: false,
      operation: 0// 0快进/慢放 1倒退 (2暂停 3播放 插件内部调用)
    }
  },
  computed: {
    videoWidth () {
      return this.width || this.GpsPlayer.containerWidth
    },
    videoHeight () {
      return this.height || this.GpsPlayer.containerHeight
    },
    relative () {
      return this.GpsPlayer.relative
    },
    toolPlay () {
      return this.tools.includes('play')
    },
    toolMuted () {
      return this.tools.includes('muted')
    },
    toolStop () {
      return this.tools.includes('stop')
    },
    toolTalk () {
      return this.tools.includes('talk')
    },
    toolControl () {
      return this.tools.includes('control')
    },
    toolTiling () {
      return this.tools.includes('tiling')
    },
    toolSnapshot () {
      return this.tools.includes('snapshot')
    },
    toolFullScreen () {
      return this.tools.includes('fullScreen')
    },
    toolRecord () {
      return this.tools.includes('record')
    },
    toolSetting () {
      return this.tools.includes('setting')
    },
    objectFitStyle () {
      return {
        objectFit: this.objectFit
      }
    },
    progressFillStyle () {
      return { background: '-webkit-linear-gradient(top, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)) 0% 0% / ' + this.progressPoint * 100 / this.duration + '% 100% no-repeat' }
    }
  },
  watch: {
    deviceId: {
      handler (newValue, oldValue) {
        console.log('newValue', newValue)
        console.log('oldValue', oldValue)
        if (newValue) {
          this.bindDevice()
        }
      }
    }
  },
  methods: {
    /**
     * 设置提示信息
     *  @param {*} msg 设置的消息内容
     */
    setMsg (msg) {
      document.getElementById('msgDiv' + this.videoId).innerHTML = msg
    },
    getMsg () {
      return document.getElementById('msgDiv' + this.videoId).innerHTML
    },
    /**
     * 清空提示信息deo视频序号，0~15 下标从0开始
     */
    clearMsg () {
      document.getElementById('msgDiv' + this.videoId).innerHTML = ''
    },
    bindDevice (lastFrameUrl) {
      if (!this.deviceId) {
        return false
      }
      console.log('bind device')
      if (this.fileId) {
        this.fileIdPlay = this.fileId.replace(' - ', '_').replace(/\s+/g, '')
        this.device = this.deviceId + '_' + this.fileId
      }
      this.setMsg('正在请求设备,请等待...')
      const videoElement = document.getElementById('videoElement' + this.videoId)
      // 防止dom未创建进行播放
      if (!videoElement) {
        return
      }
      // 通过后台获取url--请求发布RTMP成功后，返回自动匹配ip端口
      const params = {
        deviceId: this.deviceId,
        fileId: this.fileIdPlay,
        userName: this.GpsPlayer.userName
      }
      console.log(params)
      // debugger
      // return false
      // eslint-disable-next-line no-unreachable
      axios.post('/getVideoUrl', qs.stringify(params)).then(response => {
        const data = response.data
        if (data.flag) {
          this.historyUUID = data.entity.uuid
          this.duration = data.entity.time
          this.surplusTime = this.formatSeconds(data.entity.time)
          // 考虑历史的播放情况  uuid需要存储
          this.VideoUrl = data.entity.url
          console.log(this.GpsPlayer.token, this.GpsPlayer.userName)
          this.createPlayer(videoElement)
          if (lastFrameUrl === undefined || lastFrameUrl === null || lastFrameUrl === '') {
            this.$refs.videoElement.poster = ''
          } else {
            this.$refs.videoElement.poster = lastFrameUrl
          }
        }
      })
    },
    createPlayer () {
      if (this.flvPlayer) {
        // 若已经绑定播放设备 先停止，释放资源
        this.stop()
      }
      this.flvPlayer = flvJs.createPlayer({
        type: 'flv',
        url: this.VideoUrl + '&token=' + this.GpsPlayer.token + '&userName=' + this.GpsPlayer.userName
      }, {
        // enableWorker: true,
        enableStashBuffer: false
        // stashInitialSize: 128,
      })
      console.log('flvPlayer------', this.flvPlayer)
      this.flvPlayer.on('statistics_info', (res) => {
        // console.log('statistics_info current time', this.$refs.videoElement.currentTime)
        // console.log('statistics_info end time', this.$refs.videoElement.endTime)
        // console.log('statistics_info res', res)
        // if (this.fileId) {
        //   const currentTime = this.$refs.videoElement.currentTime
        //   this.nowTime = this.formatSeconds(currentTime)
        //   this.progressPoint = currentTime
        //   this.$refs.processRange.style.background = '-webkit-linear-gradient(top, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)) 0% 0% / ' + this.progressPoint * 100 / this.duration + '% 100% no-repeat'
        // }
        // 暂停状态停止展示
        if (this.paused === true) {
          return
        }
        let msg = this.getMsg()
        // 已经画面出图的情况才进行播放速度展示
        if (this.$refs.videoElement.currentTime > 0) {
          // 缓存播放速度信息
          this.playSpeed = res.speed.toFixed(2) + "KB/S <span style='color:#00FFA8'>↓</span>"
          // 当前没有展示上传信息，则直接把播放速度展示
          if (msg.indexOf('↑') === -1 && res.speed > 0) {
            msg = res.speed.toFixed(2) + "KB/S <span style='color:#00FFA8'>↓</span>"
            this.setMsg("<div class='speedDiv'>" + msg + '</div>')
          }
        }
      })
      // 载入视频时修改为缓冲中的封面图,先设置为空，过度效果
      const player = document.getElementById('videoElement' + this.videoId)
      setTimeout(() => { this.showLoading = true }, 100)
      // 保存设备id
      if (this.fileId) {
        this.deviceIdPlay = this.deviceId + '_' + this.historyUUID
        // todo createProgress
        this.showProgress = true
        // this.startProgress()
      } else {
        // 出现错误重新绑定设备拉取数据
        player.onerror = (e) => {
          const video = document.getElementById('videoElement' + this.videoId)
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
          const lastFrameUrl = canvas.toDataURL('image/png')
          // player.poster = strDataURL;
          this.setMsg('播放出错了，正在重新获取...')
          // video解绑事件，再次绑定设备时会再次绑定事件
          player.onprogress = undefined
          player.onerror = undefined
          this.stop(lastFrameUrl)
          // 绑定设备
          setTimeout(() => { this.bindDevice(lastFrameUrl) }, 200)
        }
      }
      // this.device = this.deviceId
      this.flvPlayer.attachMediaElement(this.$refs.videoElement)
      this.flvPlayer.load()
      setTimeout(() => {
        this.play()
      }, 100)
    },
    startProgress () {
      const video = this.$refs.videoElement
      if (!this.rate || this.rate === 1 || this.rate === 0) {
        this.progressTimer = setInterval(() => {
          if (this.currentTime >= this.duration) {
            this.clearProgressTimer()
          } else {
            // 从播放器中获取时间
            const currentTime = parseInt(video.currentTime)
            // 时间往前播放时
            if (currentTime !== this.currentTime) {
              this.progressPoint = currentTime + this.seekTime
              // 改变时间显示
              this.nowTime = this.formatSeconds(this.progressPoint)
            }
          }
          // console.log(video.currentTime)
          // this.progressPoint = parseInt(video.currentTime)
          // this.nowTime = this.formatSeconds(this.progressPoint)
        }, 1000/* 时间1秒更新一次 */)
      }
    },
    formatSeconds (time) {
      let result = parseInt(time)
      const h = Math.floor(result / 3600) < 10 ? '0' + Math.floor(result / 3600) : Math.floor(result / 3600)
      const m = Math.floor((result / 60 % 60)) < 10 ? '0' + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60))
      const s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60))
      result = `${h}:${m}:${s}`
      return result
    },
    playEvent () {
      if (this.toolsMap.play.active) {
        this.play()
      } else {
        this.pause()
      }
    },
    play () {
      console.log('on play')
      const video = this.$refs.videoElement
      this.showTitle = true
      // 播放之前清除上次播放的超时机制
      clearTimeout(this.unPlayTimer)
      // 播放超时判断
      let stopId
      this.unPlayTimer = setTimeout(() => {
        // 30秒后仍然没有播放出视频
        if (video.currentTime <= 0) {
          // 并且没有被手动停止
          if (this.flvPlayer) {
            this.setMsg('请求播放超时')
            stopId = setTimeout(() => {
              this.stop()
            }, 2000)
          }
        }
      }, 30000)
      const result = this.flvPlayer.play()
      const _this = this
      // 播放成功才进行按钮状态修改
      result.then(() => {
        this.paused = false
        // video.style.cssText = ''
        // 已经播放出来画面，清理定时任务和提示信息
        clearTimeout(this.unPlayTimer)
        clearTimeout(stopId)

        this.clearMsg()
        // 修改播放按钮状态
        this.toolsMap.play.active = false

        video.onprogress = function () {
          // _this.progressPoint = _this.$refs.videoElement.currentTime
          // _this.nowTime = _this.formatSeconds(_this.progressPoint)
          const len = this.buffered.length
          // console.log(len)
          if (len !== 0) {
            const buftime = this.buffered.end(len - 1) - this.currentTime
            if (buftime >= 10) {
              // 超过10秒进行跳帧
              this.currentTime = this.buffered.end(len - 1)
              if (_this.showProgress) {
                // 存在进度条，进行进度条跳帧
                _this.$refs.onprogress.seekFrame(this.currentTime)
              }
            }
          }
        }

        if (this.showProgress) {
          console.log('show progress')
          this.$refs.onprogress.start()
        }

        // 开始录屏
        this.resumeRecord()
        console.log('on load')
        this.showLoading = false
      }).catch(function (error) {
        console.log(error)
      })
    },
    /**
     * 停止视频
     */
    stop (lastFrameUrl) {
      // 调用暂停
      this.pause()
      // 调用静音
      this.muted()
      if (this.flvPlayer) {
        this.flvPlayer.unload()
        if (lastFrameUrl === undefined || lastFrameUrl === null || lastFrameUrl === '') {
          this.flvPlayer.detachMediaElement()
          this.flvPlayer.destroy()
        }
        this.flvPlayer = null
      }
      // 清除标题
      this.clearTitle()
      // 停止录屏
      this.stopRecord()
      // 关闭对讲
      if (this.currentTalkBackIndex !== null && this.currentTalkBackIndex !== '' && this.currentTalkBackIndex !== undefined) {
        this.stopTalk()
      }
      // 清除设备记录
      this.deviceIdPlay = null
      console.log('lastFrameUrl', lastFrameUrl)
      if (lastFrameUrl === undefined || lastFrameUrl === null || lastFrameUrl === '') {
        const video = this.$refs.videoElement
        if (video) {
          video.style.cssText = `object-fit: ${this.objectFit}`
          video.poster = this.poster
        }
      }
      if (this.showProgress) {
        this.$refs.onprogress.stop().then(() => {
          this.showProgress = false
        })
      }
      // 清除录屏截图前缀名称
      this.clearScreenName()
      this.$emit('update:device-id', '')
      this.$emit('onStop')
    },
    /**
     * 暂停视频
     */
    pause () {
      // 隐藏加载框
      this.showLoading = false
      if (this.flvPlayer) {
        this.flvPlayer.pause()
        this.paused = true
      }
      if (this.showProgress) {
        // todo 存在进度条，进行进度条暂停
        this.$refs.onprogress.pause()
        this.showRate = false
        // 历史视频需要通知后台暂停，否则倍速播放会出现问题
        // this.playbackControl(index, 2)
      }
      const video = document.getElementById('videoElement' + this.videoId)
      if (video) {
        video.onprogress = undefined
      }
      // 修改播放按钮状态
      this.toolsMap.play.active = true
      // 停止 media websocket
      if (this.infoWebsocket !== null && this.infoWebsocket !== undefined) {
        this.infoWebsocket.close()
      }
      this.clearMsg()
      // 暂停录屏
      this.pauseRecord()
    },
    recordEvent () {
      if (this.toolsMap.record.active) {
        this.startRecord()
      } else {
        this.stopRecord()
      }
    },
    /**
     * 暂停录屏
     */
    pauseRecord () {
      if (this.mediaRecorder) {
        this.mediaRecorder.pause()
        // toggle record btn
        this.toolsMap.record.active = true
      }
    },
    /**
     * 恢复录屏
     */
    resumeRecord () {
      if (this.mediaRecorder) {
        this.mediaRecorder.resume()
        this.toolsMap.record.active = false
      }
    },
    /**
     * 开始录屏
     */
    startRecord () {
      if (!this.mediaRecorder) {
        const video = document.getElementById('videoElement' + this.videoId)
        this.mediaRecorder = new MediaRecorder(video.captureStream()
          // , {
          //   audioBitsPerSecond: 128000, // 音频码率
          //   videoBitsPerSecond: 100000, // 视频码率
          //   mimeType: 'video/webm;codecs=h264' // 编码格式
          //   // mimeType: 'video/mp4; codecs="avc1.42E01E,mp4a.40.2"' // 编码格式
          //   // mimeType: 'video/x-flv' // 编码格式
          // }
        )
        const paramArr = this.deviceIdPlay.split('_')
        this.mediaRecorder.ondataavailable = function (e) {
          // 下载视频
          const blob = new Blob([e.data], { type: e.data.type })
          getBlobDuration(blob).then((duration) => {
            // getBlobDuration工具计算时间长度单位为秒，ysFixWebmDuration为毫秒需要转换
            ysFixWebmDuration(blob, duration * 1000, (fixedBlob) => {
              const a = document.createElement('a')
              a.href = URL.createObjectURL(fixedBlob)
              const preName = this.videoScreenName === null ? paramArr[0] : this.videoScreenName
              a.download = preName + '_' + Date.parse(new Date()) + '.webm'
              a.click()
            })
          })
        }
        // 开始采集
        this.mediaRecorder.start()
        // toggle record btn
        this.toolsMap.record.active = false
      } else {
        // 视频暂停状态，再次点击录制
      }
    },
    /**
     * 结束录屏
     */
    stopRecord () {
      if (this.mediaRecorder) {
        this.mediaRecorder.stop()
        // toggle record btn
        this.toolsMap.record.active = true
        this.mediaRecorder = null
      }
    },
    /**
     * 初始化对讲音频流websocket
     */
    getTalkbackWebsocket () {
      const ws = new WebSocket(this.server.replace(/http/g, 'ws') + '/wsAudio')
      ws.onopen = function () { }
      ws.onmessage = function (evt) { }
      ws.onclose = function () { }
      return ws
    },
    controlEvent () {
      this.toolsMap.control.active = !this.toolsMap.control.active
      this.ptzController('ptzstop')
    },
    talkEvent () {
      if (this.toolsMap.talk.active) {
        this.beginTalk()
      } else {
        this.stopTalk()
      }
      // this.toolsMap.talk.active = !this.toolsMap.talk.active
    },
    /**
     * 开启对讲
     */
    async beginTalk () {
      if (this.audioStream != null) {
        // 获取音轨
        const tracks = this.audioStream.getAudioTracks()
        if (tracks[0].enabled) {
          return { flag: false, message: '正在进行对讲', code: -304 }
        }
      }
      const paramArr = this.deviceIdPlay.split('_')
      const params = {
        deviceId: paramArr[0],
        // logicalChannelNumber: paramArr[1],
        userName: this.GpsPlayer.userName
      }
      const res = await axios.post('/startTalkBack', qs.stringify(params))
      const data = res.data
      if (data.flag) {
        const result = await this.openMike(paramArr[0])
        if (!result.flag) {
          // 如果调用麦克风失败，直接返回
          return result
        }
        // 记录当前对讲窗口
        // this.currentTalkBackIndex = index
        // 音频跟随视频一起，直接打开音量
        this.unmuted()
      }
      return data
    },
    /**
     * 打开麦克风,获取实时音频流发送到后台
     */
    async openMike (deviceId) {
      if (navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          const context = new (window.AudioContext || window.webkitAudioContext)()
          const ws = this.getTalkbackWebsocket()
          // 切换图标
          this.toolsMap.talk.active = false
          this.audioContext = context
          this.audioStream = stream
          this.audioWebsocket = ws
          const config = {
            channelCount: 1,
            sampleRate: 8000, // 采样率16K
            sampleBits: 16, // 采样数位 8, 16
            bufferSize: 4096
          }
          // 将声音输入这个对像
          const source = context.createMediaStreamSource(stream)
          // 设置音量节点
          const volume = context.createGain()
          source.connect(volume)

          // 创建声音的缓存节点，createScriptProcessor方法的  ,第二个和第三个参数指的是输入和输出都是声道数。
          const recorder = context.createScriptProcessor(config.bufferSize, config.channelCount, config.channelCount)
          source.connect(recorder)
          recorder.connect(context.destination)

          /* 存成pcm文件 */
          // _this.gbuffer = [];
          // 接收实时音频流
          recorder.onaudioprocess = function (e) {
            const data = new Float32Array(e.inputBuffer.getChannelData(0)) // PCM数据
            // 压缩
            const getRawDataion = parseInt(context.sampleRate / config.sampleRate)
            const length = data.length / getRawDataion
            const bytes = new Float32Array(length)
            let index = 0
            let j = 0
            while (index < length) {
              bytes[index] = data[j]
              j += getRawDataion
              index++
            }
            // 处理数据
            const dataLength = bytes.length * (config.sampleBits / 8)
            const buffer = new ArrayBuffer(dataLength)
            const dataView = new DataView(buffer)
            let offset = 0
            if (config.sampleBits === 8) {
              for (let i = 0; i < bytes.length; i++, offset++) {
                const s = Math.max(-1, Math.min(1, bytes[i]))
                let val = s < 0 ? s * 0x8000 : s * 0x7FFF
                val = parseInt(255 / (65535 / (val + 32768)))
                dataView.setInt8(offset, val, true)
              }
            } else {
              for (let i = 0; i < bytes.length; i++, offset += 2) {
                const s = Math.max(-1, Math.min(1, bytes[i]))
                dataView.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
              }
            }
            /* 存成pcm文件 */
            // _this.gbuffer.push(dataView);
            // 发送pcm转wav音频数据,格式sim_data
            ws.send(new Blob([deviceId, '_', dataView]))
          }
        } catch (err) {
          console.log(err.name + ': ' + err.message)
          if (err.name === 'NotFoundError') {
            return { flag: false, message: '没有麦克风设备', code: -301 }
          } else if (err.name === 'SecurityError') {
            return { flag: false, message: '设备由于安全问题被禁止调用', code: -302 }
          } else {
            return { flag: false, message: '设备调用错误', code: -303 }
          }
        }
        return { flag: true, message: 'ok', code: 200 }
      }
    },
    /**
     * 停止对讲
     */
    async stopTalk () {
      if (!this.deviceIdPlay) {
        return
      }
      const paramArr = this.deviceIdPlay.split('_')
      const params = {
        deviceId: paramArr[0],
        userName: this.GpsPlayer.userName
      }
      const res = await axios.post('/stopTalkBack', qs.stringify(params))
      const data = res.data
      if (data.flag) {
        this.audioContext.close()
        const tracks = this.audioStream.getAudioTracks()
        tracks[0].stop()
        this.audioWebsocket.close()
        this.audioWebsocket = null
        this.audioContext = null
        this.audioStream = null
        // 切换图标
        this.toolsMap.talk.active = true
        // 清空对讲窗口记录
        this.currentTalkBackIndex = null
      }
      /* 存成pcm文件 */
      // let blob = new Blob(this.gbuffer)
      // let a = document.createElement('a')
      // a.href = URL.createObjectURL(blob)
      // a.download = 'test.pcm'
      // a.click();
      return data
    },
    mutedEvent () {
      if (this.toolsMap.muted.active) {
        this.muted()
      } else {
        this.unmuted()
      }
      // this.toolsMap.muted.active = !this.toolsMap.muted.active
    },
    /**
     * 静音
     */
    muted () {
      const videoElement = document.getElementById('videoElement' + this.videoId)
      if (videoElement) {
        videoElement.muted = true
      }
      this.toolsMap.muted.active = false
    },
    /**
     * 打开音量
     */
    unmuted () {
      document.getElementById('videoElement' + this.videoId).muted = false
      this.toolsMap.muted.active = true
    },
    tilingEvent () {
      if (this.toolsMap.tiling.active) {
        this.tiling()
      } else {
        this.untiling()
      }
    },
    /**
     * 视频铺满video大小
     */
    tiling () {
      document.getElementById('videoElement' + this.videoId).style.cssText = 'object-fit:fill'
      this.toolsMap.tiling.active = false
    },
    /**
     * 标准 原始视频大小
     */
    untiling () {
      document.getElementById('videoElement' + this.videoId).style.cssText = ''
      this.toolsMap.tiling.active = true
    },
    /**
     * 视频截图
     */
    snapshot () {
      const video = document.getElementById('videoElement' + this.videoId)
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
      // document.body.appendChild(canvas)
      // 下载
      // let oA = document.createElement('a');
      // oA.href = canvas.toDataURL();
      // oA.download = Date.parse(new Date());//使用时间戳作为文件名称
      // let event = document.createEvent('MouseEvents');
      // event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      // oA.dispatchEvent(event);
      const strDataURL = canvas.toDataURL('image/png') // canvas中video中取一帧图片并转成dataURL
      const arr = strDataURL.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      const blob = new Blob([u8arr], {
        type: mime
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      const preName = this.videoScreenName === null ? '' : this.videoScreenName + '_'
      a.download = preName + Date.parse(new Date()) + '.png'
      document.body.appendChild(a)
      a.click()
      setTimeout(function () {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }, 1000)
    },
    fullScreenEvent () {
      if (this.toolsMap.fullScreen.active) {
        this.fullScreen()
      } else {
        this.narrowScreen()
      }
    },
    /**
     * 视频全屏
     */
    fullScreen () {
      // 先移除resize事件
      // window.onresize = '';
      const videoContainer = this.$refs.videoContainer
      console.log(videoContainer)
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen()
      } else if (videoContainer.mozRequestFullScreen) {
        videoContainer.mozRequestFullScreen()
      } else if (videoContainer.webkitRequestFullScreen) {
        videoContainer.webkitRequestFullScreen()
      }
      this.toolsMap.fullScreen.active = false
      // 若设置了标题，隐藏标题,重新计算高度
      // document.getElementById('videoDiv' + this.videoId).style.height = '100%'
      this.$refs.videoDiv.style.height = '100%'
      // document.getElementById('videoTitle' + this.videoId).style.display = 'none'
      this.showTitle = false
    },
    /**
     * 取消全屏
     */
    narrowScreen () {
      // 判断当前是全屏状态，才进行处理
      this.fullScreenIndex = null
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen()
      }
      this.narrow()
    },
    /**
     * 取消全屏时，安装、标题等状态改变
     */
    narrow () {
      this.toolsMap.fullScreen.active = true
      // 若设置了标题，重新显示标题,重新计算高度
      this.showTitle = true
    },
    settingEvent () {
      if (this.toolsMap.setting.active) {
        this.showSetting = true
        this.toolsMap.setting.active = false
      } else {
        this.showSetting = false
        this.toolsMap.setting.active = true
      }
    },
    /**
     * 开启滤镜配置
     */
    openSetting () {
      this.showSetting = true
      this.toolsMap.setting.active = false
    },
    /**
     * 关闭滤镜配置
     */
    closeSetting () {
      this.showSetting = false
      this.toolsMap.setting.active = true
    },
    clearTitle () {
      // this.videoTitle = ''
      this.videoTitleValue = ''
      this.showTitle = false
    },
    /**
     * 清空该播放窗口截屏、录屏前缀名称
     */
    clearScreenName () {
      this.videoScreenName = null
    },
    setActive () {
      if (this.GpsPlayer.selectOnClick) {
        this.GpsPlayer.activeId = this.videoId
        this.GpsPlayer.$children.forEach(comp => {
          if (this.videoId === comp.videoId) {
            this.isSelected = !this.isSelected
            this.GpsPlayer.setActive(this.videoId, this.isSelected)
          } else {
            comp.isSelected = false
          }
        })
      }
    },
    /**
     * 双击窗口
     */
    onVideoDblClick () {
      console.log(this.$parent.videoCount)
      if (this.$parent.videoCount > 1) {
        const sWidth = Number(this.$parent.containerWidth.split('px')[0])
        const sHeight = Number(this.$parent.containerHeight.split('px')[0])
        console.log(sWidth, sHeight)
        const videoWidth = this.$refs.videoContainer.offsetWidth
        const videoHeight = this.$refs.videoContainer.offsetHeight
        console.log(videoWidth, videoHeight)
        this.GpsPlayer.resetContainer()
        this.showVideo = true
        if (videoWidth === sWidth && videoHeight === sHeight) {
          this.$refs.videoContainer.style.height = this.videoHeight
          this.$refs.videoContainer.style.width = this.videoWidth
          this.$refs.videoContainer.style.top = this.position.top
          this.$refs.videoContainer.style.left = this.position.left
          this.$refs.videoContainer.style.bottom = this.position.bottom
          this.$refs.videoContainer.style.right = this.position.right
        } else {
          this.$refs.videoContainer.style.height = sHeight + 'px'
          this.$refs.videoContainer.style.width = sWidth + 'px'
          this.$refs.videoContainer.style.top = '0px'
          this.$refs.videoContainer.style.left = '0px'
        }
      } else if (this.$parent.videoCount === 1) {
        this.fullScreenEvent()
      }
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
      this.mousemove.timing = new Date()
      // console.log('on mouse move', evt)
      // 给可视区域添加鼠标的移动事件
      document.onmousemove = (eve) => {
        // event的兼容性
        const ev = eve || event

        // 获取鼠标移动时的坐标
        const x2 = ev.clientX
        const y2 = ev.clientY

        // 计算出鼠标的移动距离
        const x = x2 - x1
        const y = y2 - y1
        // console.log('计算出鼠标的移动距离', x, y)
        this.mousemove.x = x
        this.mousemove.y = y
      }
    },
    onmouseup (evt) {
      document.onmousemove = null
      if (evt.target.nodeName === 'VIDEO') {
        // 只监听video元素上的动作
        if (Math.abs(this.mousemove.x) < Math.abs(this.mousemove.y)) {
          if (Math.abs(this.mousemove.y) > 100) {
            // 上下移动
            if (this.mousemove.y > 0) {
              // 下
              this.ptzController('ptzdown')
            } else {
              // 上
              this.ptzController('ptzup')
            }
          }
        } else {
          if (Math.abs(this.mousemove.x) > 100) {
            // 左右移动
            if (this.mousemove.x > 0) {
              // 右
              this.ptzController('ptzright')
            } else {
              // 左
              this.ptzController('ptzleft')
            }
          }
        }
        // 按得越久转动时间越长
        const timing = new Date() - this.mousemove.timing
        setTimeout(() => {
          this.ptzController('ptzstop')
        }, timing)
      }
    },
    /**
     * 鼠标滚轮事件
     * @param e
     */
    onmousewheel (e) {
      console.log(e)
      // 0----down  1----up
      const direction = e.deltaY > 0 ? '0' : '1'
      // 下面的逻辑实现的是内部元素横向滚动，前提设置好内部元素横向的滚动样式了
      if (direction === '0') {
        this.ptzController('ptzzoomin')
      } else {
        this.ptzController('ptzzoomout')
      }
      this.ptzController('ptzstop')
    },
    /**
     * 云台操作
     * @param {*} action
     *  向左：ptzleft
     *  向右：ptzright
     *  向上：ptzup
     *  向下：ptzdown
     *  停止云台：ptzstop
     *  放大：ptzzoomin
     *  缩小：ptzzoomout
     *  聚焦拉近：focusedin
     *  聚焦拉远：focusedout
     *  光圈放大：irisin
     *  光圈缩小：irisout
     *  停止光圈聚焦：fistop
     * (未完待续)
     */
    ptzController (action) {
      if (this.ptzControl && !this.toolsMap.control.active) {
        const params = {
          deviceId: this.deviceId,
          action: action
        }
        axios.post('/ptzControl', qs.stringify(params))
          .then(function (response) {
            const data = response.data
            if (data.flag) {
              // TODO：调用之后操作
            }
          }).catch(function (error) {
            console.log(error)
          })
      }
    },
    /**
     * 滤镜操作
     */
    setBrightnessVal () {
      console.log(this.brightnessVal)
      this.setVideoFilter('brightness', this.brightnessVal)
    },
    setGrayscaleVal () {
      this.setVideoFilter('grayscale', this.grayscaleVal)
    },
    setContrastVal () {
      this.setVideoFilter('contrast', this.contrastVal)
    },
    setSaturateVal () {
      this.setVideoFilter('saturate', this.saturateVal)
    },
    setVideoFilter (type, value) {
      const styleArr = getComputedStyle(this.$refs.videoElement).getPropertyValue('filter').split(' ')
      console.log(styleArr)
      for (let i = 0; i < styleArr.length; i++) {
        if (styleArr[i].indexOf(type) !== -1) {
          styleArr[i] = type + '(' + (value / 100) + ')'
          break
        }
      }
      this.$refs.videoElement.style.setProperty('-webkit-filter', styleArr.join(' '))
      this.$refs.videoElement.style.setProperty('filter', styleArr.join(' '))
    },
    /**
     * 销毁播放器
     */
    destroyPlayer () {
      if (this.flvPlayer) {
        this.flvPlayer.unload()
        this.flvPlayer.detachMediaElement()
        this.flvPlayer.destroy()
        this.flvPlayer = null
      }
    },
    onmouseenter () {
      this.showToolBar = true
    },
    onmouseleave () {
      this.showToolBar = false
    },
    async changeProcess (evt) {
      console.log('changeProcess', evt)
      console.log(this.progressPoint)
      const video = this.$refs.videoElement
      const params = {
        deviceId: this.deviceId,
        uuid: this.historyUUID,
        time: parseInt(this.progressPoint),
        userName: this.GpsPlayer.userName
      }
      // 先暂停
      // this.clearProgressTimer()
      // 拖动位置换算成时间
      // let time = this.du * width / processWidth;
      // 记录跳转的时间差
      this.seekTime = this.progressPoint - video.currentTime
      this.pause()
      const res = await axios.post('/seek', qs.stringify(params))
      console.log(res)
      const data = res.data
      // 跳转到缓存的最新位置，防止暂停一直在收码流
      // const video = this.$refs.videoElement
      // console.log('video buffered end', video.buffered.end(video.buffered.length - 1))
      // video.currentTime = video.buffered.end(video.buffered.length - 1)
      // console.log(video.currentTime)
      if (data.flag) {
        console.log('seek 调用成功', this.progressPoint)
        console.log('seek 调用成功 buffered', video.buffered.end(0))
        // this.$refs.videoElement.currentTime = parseInt(this.progressPoint)
        // this.startProgress()
      }
      // 跳转到缓存的最新位置，防止暂停一直在收码流
      console.log('parseInt', parseInt(this.progressPoint))
      // video.currentTime = parseInt(this.progressPoint)
      video.addEventListener('timeupdate', () => {
        video.currentTime = parseInt(this.progressPoint)
      })
      this.play()
      // setTimeout(() => {
      //   // this.$forceUpdate()
      //   console.log('video.currentTime ', video.currentTime)
      //   // 调用之后再播放
      //   this.play()
      // }, 3000)
    },
    onmousemove (evt) {
      this.showTargetPoint = true
      this.targetPointLeft = evt.offsetX + 'px'
      this.targetPoint = this.calcSliderPos(evt).toFixed(2)
    },
    calcSliderPos (e) {
      return (e.offsetX / e.target.clientWidth) * parseInt(e.target.getAttribute('max'), 10)
    },
    onSeek () {
      const video = this.$refs.videoElement
      video.currentTime = video.buffered.end(video.buffered.length - 1)
      // 调用之后再播放
      this.play()
    },
    onPlayHistory (currentTime) {
      this.nowTime = this.formatSeconds(currentTime)
    },
    setOperation (mode) {
      this.showRate = true
      // console.log(this.rateList)
      // console.log(mode)
      // console.log(this.rateList[mode])
      // console.log(this.rateIndex)
      // console.log(this.rateList[mode][this.rateIndex])
      if (mode === this.operation) {
        if (this.rateIndex < this.rateList[mode].length - 1) {
          this.rateIndex++
        } else {
          this.rateIndex = 0
        }
      } else {
        this.rateIndex = 4
      }
      this.rate = this.rateList[mode][this.rateIndex].value
      this.operation = mode
      this.playbackControl(this.rate)
    },
    setRate () {
      this.playbackControl(this.rate)
    },
    /**
     * 历史回放播放控制
     * @param {*} speed 1正常速度  快进:2 4 8 16  慢放:0.5 0.25 0.125 0.0625   倒退-2 -4 -8 -16
     */
    async playbackControl (speed) {
      const params = {
        deviceId: this.deviceId,
        uuid: this.historyUUID,
        fileId: this.fileId,
        operation: this.operation,
        speed: speed
      }
      // 通知播放变速控制 this.pause(index);
      this.showLoading = true
      // 通知播放变速控制
      const res = await axios.post('/playbackControl', qs.stringify(params))
      const data = res.data
      if (data.flag) {
        if (this.operation === 0 || this.operation === 1) {
          this.rate = speed
          if (speed > 0) {
            this.$refs.videoElement.playbackRate = speed
          }
        }
      }
      this.showLoading = false
      return data
    },
    clearProgressTimer () {
      if (this.progressTimer) {
        clearInterval(this.progressTimer)
        this.progressTimer = null
        this.seekTime = 0
      }
    }
  },
  mounted () {
    console.log('this.GpsPlayer.load', this.GpsPlayer.load)
    if (this.autoPlay && this.deviceId) {
      console.log('init', this.deviceId)
      this.bindDevice()
      // this.play()
    }
    /**
     * @Describe 以下代码作用为监听标签页是否激活状态，如果离开过视频播放的标签页会造成视频流不实时，造成画面延迟、云台操作效果延迟。
     * 新方案改为，在操作区域加一个主动刷新按钮执行主动销毁、注册、取流。刷新画面。
     */
    /* document.addEventListener('visibilitychange', () => {
      if (!this.showProgress) {
        if (document.visibilityState === 'hidden') {
          // 切离该页面时执行
          console.log('切离该页面时执行')
          this.destroyPlayer()
        } else if (document.visibilityState === 'visible') {
          // 切换到该页面时执行
          console.log('切换到该页面时执行')
          this.bindDevice()
        }
      }
    }) */
  },
  beforeDestroy () {
    this.destroyPlayer()
  },
  destroyed () {
    this.clearProgressTimer()
  }
}
</script>

<style lang="scss" scoped>
.position{
  position: absolute;
}
</style>
