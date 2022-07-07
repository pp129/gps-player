<template>
<div>
  <ul>
    <li v-for="(item,index) in deviceList" :key="index">
      <span style="margin-right: 15px;">{{item.name}}</span>
      <span style="margin-left: 10px;cursor: pointer;" @click="play(item.id)">播放</span>
      <span style="margin-left: 10px;cursor: pointer;" @click="pause(item.id)">暂停</span>
      <span style="margin-left: 10px;cursor: pointer;" @click="stop(item.id)">停止</span>
      <input type="datetime-local" step="1" v-model="item.beginTime">
      <input type="datetime-local" step="1" v-model="item.endTime">
      <button @click="getHistory(item)">历史视频</button>
      <button @click="item.historyList = []">重置</button>
      <ul style="display: inline-block;">
        <li style="cursor: pointer;" v-for="history in item.historyList" :key="history.fileId" @click.prevent="playHistory(item,history)">{{history.fileId}}</li>
      </ul>
    </li>
  </ul>
  <gps-player v-if="showPlayer" ref="gpsPlayer"
              :width="960"
              :height="540"
              :bottom="60"
              :left="20"
              :server="server" :user-name="userName" :password="password"
              draggable
              closeable
              @onClose="onClose">
    <template #close>
      <div style="width:50px;">关闭</div>
    </template>
    <template #drag>
      <div style="width:50px;">拖拽</div>
    </template>
    <gps-video
      :ref="'video-'+playing.id"
      :object-fit="'fill'"
      :device-id.sync="playing.id"
      :ptz-control="playing.ptzControl"
      :file-id="playing.fileId"
      :video-title="playing.name"></gps-video>
  </gps-player>
</div>
</template>

<script>
import { GpsPlayer, GpsVideo } from '~'
import dayjs from 'dayjs'
export default {
  name: 'history',
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
      deviceId: '',
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
        },
        {
          id: '35020300021320000072',
          fileId: '',
          name: '72测试间IPC',
          ptzControl: true,
          beginTime: dayjs().subtract(1, 'h').format('YYYY-MM-DDTHH:mm'),
          endTime: dayjs().format('YYYY-MM-DDTHH:mm'),
          historyList: []
        }
      ],
      playing: {
        id: '',
        fileId: '',
        name: '',
        ptzControl: false
      }
    }
  },
  methods: {
    play (id) {
      if (id) {
        this.showPlayer = true
        // this.$refs.gpsPlayer.bindDevice(0, '35020300021320000105')
        this.playing.id = id
        this.playing.name = this.deviceList.filter(x => x.id === id)[0].name
        this.playing.ptzControl = this.deviceList.filter(x => x.id === id)[0].ptzControl
        this.playing.fileId = this.deviceList.filter(x => x.id === id)[0].fileId
      }
    },
    pause (id) {
      if (id) {
        this.$refs[`video-${id}`].pause()
      }
    },
    stop (id) {
      if (id) {
        console.log(this.$refs)
        this.$refs[`video-${id}`].stop()
      }
    },
    onClose () {
      this.showPlayer = false
      this.playing.id = ''
      this.playing.name = ''
      this.playing.owner = ''
      this.playing.type = ''
    },
    getHistory (item) {
      this.deviceList.forEach(device => {
        device.historyList = []
      })
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
  }
}
</script>

<style scoped>

</style>
