<template>
<div>
  <ul>
    <li v-for="(item,index) in deviceList" :key="index">
      <span style="margin-right: 15px;">{{item.name}}</span>
      <span style="margin-right: 15px;">{{item.owner}}</span>
      <span style="margin-right: 15px;">{{item.type}}</span>
      <span style="margin-left: 10px;cursor: pointer;" @click="play(item.id)">播放</span>
      <span style="margin-left: 10px;cursor: pointer;" @click="pause(item.id)">暂停</span>
      <span style="margin-left: 10px;cursor: pointer;" @click="stop(item.id)">停止</span>
      <input type="datetime-local" step="1" v-model="item.beginTime">
      <input type="datetime-local" step="1" v-model="item.endTime">
      <button @click="getHistory(item)">历史视频</button>
      <button @click="item.historyList = []">重置</button>
      <ul style="display: inline-block;">
        <li style="cursor: pointer;" v-for="history in item.historyList" :key="history.fileId">
          <span @click.prevent="playHistory(item,history)">{{history.fileId}}</span>
          <span style="margin-left: 5px;" @click.p.prevent="download(item,history)">下载</span>
          <span style="margin-left: 5px;" @click.p.prevent="stopDownload(item,history)">停止下载</span>
        </li>
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
    :server="server" :ws-server="wsServer" :user-name="userName" :password="password"
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
      :video-title="playing.name">
    </gps-video>
  </gps-player>
</div>
</template>

<script>
import { GpsPlayer, GpsVideo } from '~'
import dayjs from 'dayjs'
export default {
  name: 'ningde',
  components: {
    GpsPlayer,
    GpsVideo
  },
  data () {
    return {
      showPlayer: true,
      server: '/sppt',
      wsServer: 'ws://35.231.35.131:8000/sppt',
      // userName: 'XMGPS_JW',
      // password: 'Xmgps@2022',
      userName: 'admin',
      password: 'Xmgps@0592',
      videoTitle: 'name',
      deviceId: '',
      deviceList: [
        {
          id: '35090200001313100144',
          fileId: '',
          owner: '宇视',
          name: '国宝路与万安东路-北球机',
          type: '球机',
          ptzControl: true,
          beginTime: dayjs().subtract(1, 'h').format('YYYY-MM-DDTHH:mm'),
          endTime: dayjs().format('YYYY-MM-DDTHH:mm'),
          historyList: []
        },
        {
          id: '35090200001323050005',
          fileId: '',
          owner: '大华',
          name: '宁一大厦楼顶高空球通道_1',
          type: '高空球',
          ptzControl: true,
          beginTime: dayjs().subtract(1, 'h').format('YYYY-MM-DDTHH:mm'),
          endTime: dayjs().format('YYYY-MM-DDTHH:mm'),
          historyList: []
        },
        {
          id: '34030000001310000169',
          fileId: '',
          owner: '华为',
          name: '天湖东路东方伟业广场路口-违停',
          type: '违停球',
          ptzControl: true,
          beginTime: dayjs().subtract(1, 'h').format('YYYY-MM-DDTHH:mm'),
          endTime: dayjs().format('YYYY-MM-DDTHH:mm'),
          historyList: []
        },
        {
          id: '35020300021320000073',
          fileId: '',
          name: '73会议室宇视大球-平台',
          owner: '华为',
          type: '球机',
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
        console.log(this.playing)
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
        if (this.$refs[`video-${id}`]) {
          this.$refs[`video-${id}`].stop()
        }
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
      const beginTime = dayjs(item.beginTime).format('YYYY-MM-DD HH:mm:ss')
      const endTime = dayjs(item.endTime).format('YYYY-MM-DD HH:mm:ss')
      const params = { deviceId: item.id, beginTime: beginTime, endTime: endTime }
      this.$refs.gpsPlayer.getHisResourceList(params).then(res => {
        console.log(res)
        item.historyList = res
      })
    },
    playHistory (item, history) {
      console.log(item, history)
      this.playing.id = item.id
      this.playing.fileId = history.fileId
      // this.playing.id = item.id
      // item.fileId = history.fileId
      // if (this.$refs[`video-${item.id}`]) {
      //   this.$refs[`video-${item.id}`].stop().then(() => {
      //     this.play(item.id)
      //   })
      // } else {
      //   this.play(item.id)
      // }
    },
    download (item, history) {
      this.$refs.gpsPlayer.download(item.id, history.fileId).then(res => {
        console.log(res)
      })
    },
    stopDownload (item, history) {
      this.$refs.gpsPlayer.stopDownload(item.id, history.fileId).then(res => {
        console.log(res)
      })
    }
  }
}
</script>

<style scoped>

</style>
