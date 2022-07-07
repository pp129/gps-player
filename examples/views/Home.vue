<template>
  <div class="home">
    <button @click="showPlayer=true">显示</button>
    <ul>
      <li v-for="(item,index) in deviceList" :key="index">
        <span>{{item.name}}</span>
        <span style="margin-left: 10px;cursor: pointer;" @click="play(item.id)">播放</span>
        <span style="margin-left: 10px;cursor: pointer;" @click="pause(item.id)">暂停</span>
        <span style="margin-left: 10px;cursor: pointer;" @click="stop(item.id)">停止</span>
        <input type="datetime-local" step="1" v-model="item.beginTime">
        <input type="datetime-local" step="1" v-model="item.endTime">
        <button @click="getHistory(item)">历史视频</button>
        <ul style="display: inline-block;">
          <li style="cursor: pointer;" v-for="history in item.historyList" :key="history.fileId" @click.prevent="playHistory(item,history)">{{history.fileId}}</li>
        </ul>
      </li>
    </ul>
    <gps-player
      v-if="showPlayer"
      ref="gpsPlayer"
      :width="960"
      :height="720"
      :bottom="20"
      :left="20"
      :server="server" :user-name="userName" :password="password"
      relative
      draggable
      closeable
      @onClose="onClose"
      select-on-click @onSelect="onSelect">
      <template #close>
        <div style="width:50px;">关闭</div>
      </template>
      <template #drag>
        <div style="width:50px;">拖拽</div>
      </template>
      <gps-video
        :ref="'video-'+device.id"
        v-for="(device,index) in playList"
        :key="index"
        :object-fit="'fill'"
        :ptz-control="device.ptzControl"
        :device-id="device.id"
        :file-id="device.fileId"
        :video-title="device.name"
        :position="device.position"
        :width="device.width"
        :height="device.height"></gps-video>
    </gps-player>
  </div>
</template>

<script>
import { GpsPlayer, GpsVideo } from '~'
import dayjs from 'dayjs'
export default {
  name: 'Home',
  components: {
    GpsPlayer,
    GpsVideo
  },
  data () {
    return {
      showPlayer: true,
      server: '/sppt',
      userName: 'XMGPS_JW',
      password: 'Xmgps@2022',
      videoTitle: 'name',
      deviceList: [
        {
          id: '35020300021320000103',
          fileId: '',
          name: '大华-公交',
          ptzControl: false,
          beginTime: dayjs().subtract(1, 'h').format('YYYY-MM-DDTHH:mm'),
          endTime: dayjs().format('YYYY-MM-DDTHH:mm'),
          historyList: []
        },
        {
          id: '35020300021320000015',
          fileId: '',
          name: '公交研发混合区',
          ptzControl: false,
          beginTime: dayjs().subtract(1, 'h').format('YYYY-MM-DDTHH:mm'),
          endTime: dayjs().format('YYYY-MM-DDTHH:mm'),
          historyList: []
        },
        {
          id: '35020300021320000110',
          fileId: '',
          name: '大华-警务2',
          ptzControl: false,
          beginTime: dayjs().subtract(1, 'h').format('YYYY-MM-DDTHH:mm'),
          endTime: dayjs().format('YYYY-MM-DDTHH:mm'),
          historyList: []
        },
        {
          id: '35020300021320000017',
          fileId: '',
          name: '事业部领导小区',
          ptzControl: false,
          beginTime: dayjs().subtract(1, 'h').format('YYYY-MM-DDTHH:mm'),
          endTime: dayjs().format('YYYY-MM-DDTHH:mm'),
          historyList: []
        },
        {
          id: '35020300021320000016',
          fileId: '',
          name: '外来驻点混合区',
          ptzControl: false,
          beginTime: dayjs().subtract(1, 'h').format('YYYY-MM-DDTHH:mm'),
          endTime: dayjs().format('YYYY-MM-DDTHH:mm'),
          historyList: []
        },
        {
          id: '35020300021320000012',
          fileId: '',
          name: '福宇后门',
          ptzControl: false,
          beginTime: dayjs().subtract(1, 'h').format('YYYY-MM-DDTHH:mm'),
          endTime: dayjs().format('YYYY-MM-DDTHH:mm'),
          historyList: []
        },
        {
          id: '35020300021320000012',
          fileId: '',
          name: '大华-平台',
          ptzControl: false,
          beginTime: dayjs().subtract(1, 'h').format('YYYY-MM-DDTHH:mm'),
          endTime: dayjs().format('YYYY-MM-DDTHH:mm'),
          historyList: []
        },
        {
          id: '35020300021320000073',
          fileId: '',
          name: '73会议室宇视大球-平台',
          ptzControl: true,
          beginTime: dayjs().subtract(1, 'h').format('YYYY-MM-DDTHH:mm'),
          endTime: dayjs().format('YYYY-MM-DDTHH:mm'),
          historyList: []
        }
      ],
      playList: [
        {
          id: '',
          fileId: '',
          name: '',
          width: '66.66666666%',
          height: '66.66666666%',
          ptzControl: false,
          position: {
            top: 0,
            left: 0
          }
        },
        {
          id: '',
          fileId: '',
          name: '',
          width: '33.3333333%',
          height: '33.3333333%',
          position: {
            top: 0,
            right: 0
          },
          ptzControl: false
        },
        {
          id: '',
          fileId: '',
          name: '',
          width: '33.3333333%',
          height: '33.3333333%',
          position: {
            top: '33.3333333%',
            right: 0
          },
          ptzControl: false
        },
        {
          id: '',
          name: '',
          width: '33.3333333%',
          height: '33.3333333%',
          position: {
            bottom: 0,
            left: 0
          },
          ptzControl: false
        },
        {
          id: '',
          fileId: '',
          name: '',
          width: '33.3333333%',
          height: '33.3333333%',
          position: {
            bottom: 0,
            left: '33.3333333%'
          },
          ptzControl: false
        },
        {
          id: '',
          fileId: '',
          name: '',
          width: '33.3333333%',
          height: '33.3333333%',
          position: {
            bottom: 0,
            right: 0
          },
          ptzControl: false
        }
      ],
      playingIndex: null
    }
  },
  methods: {
    play (id) {
      if (id) {
        // this.$refs.gpsPlayer.bindDevice(0, '35020300021320000105')
        if (this.playList[this.playingIndex].id && this.playList[this.playingIndex].id === id) {
          console.log('111', this.playList[this.playingIndex])
          // this.$refs[`video-${id}`][0].bindDevice()
        } else {
          console.log('222', this.playList[this.playingIndex])
          this.playList[this.playingIndex].id = id
          this.playList[this.playingIndex].name = this.deviceList.filter(x => x.id === id)[0].name
          this.playList[this.playingIndex].ptzControl = this.deviceList.filter(x => x.id === id)[0].ptzControl
          this.playList[this.playingIndex].fileId = this.deviceList.filter(x => x.id === id)[0].fileId
        }
      }
    },
    pause (id) {
      if (id) {
        this.$refs[`video-${id}`][0].pause()
      }
    },
    stop (id) {
      if (id) {
        this.$refs[`video-${id}`][0].stop()
      }
    },
    onSelect (index, id, isSelected) {
      console.log('onSelect', index, id, isSelected)
      this.playingIndex = index
      // this.playList[this.playingIndex].ptzControl = isSelected
    },
    onClose () {
      this.showPlayer = false
      this.playList.forEach(val => {
        val.id = ''
        val.fileId = ''
        val.name = ''
      })
    },
    getHistory (item) {
      const beginTime = dayjs(item.beginTime).format('YYYY-MM-DD HH:mm:ss')
      const endTime = dayjs(item.endTime).format('YYYY-MM-DD HH:mm:ss')
      const params = { deviceId: item.id, beginTime: beginTime, endTime: endTime }
      this.$refs.gpsPlayer.getHisResourceList(params).then(res => {
        console.log(res)
        item.historyList = res.resultList
      })
    },
    playHistory (item, history) {
      console.log(item, history)
      item.fileId = history.fileId
      this.play(item.id)
    }
  },
  mounted () {
    // this.play()
  }
}
</script>
<style>
.home{
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
