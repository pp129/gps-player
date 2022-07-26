<template>
  <div>
    <button @click="play">播放</button>
    <gps-player :server="server" :user-name="userName" :password="password" :flex="'start'" :width="960" :height="720">
      <gps-video :device-id="device.id" :video-title="device.name" @onStop="stop" :width="480" :height="360"></gps-video>
      <gps-video :device-id="device.id" :video-title="device.name" @onStop="stop" :width="480" :height="360"></gps-video>
      <gps-video :device-id="device.id" :video-title="device.name" @onStop="stop" :width="480" :height="360"></gps-video>
      <gps-video :device-id="device.id" :video-title="device.name" @onStop="stop" :width="480" :height="360"></gps-video>
    </gps-player>
  </div>
</template>
<script>
import { GpsPlayer, GpsVideo } from '~'
export default {
  name: 'simple',
  components: {
    GpsPlayer,
    GpsVideo
  },
  data () {
    return {
      server: '/sppt',
      userName: 'XMGPS_JW',
      password: 'Xmgps@2022',
      device: {
        id: '',
        name: ''
      }
    }
  },
  methods: {
    play () {
      this.device.id = '35020300021320000017'
      this.device.name = '事业部领导小区'
    },
    stop () {
      this.device.id = ''
      this.device.name = ''
    }
  }
}
</script>
