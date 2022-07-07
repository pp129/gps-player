# gps-player

## Installation
```
npm install gps-player
```

## Getting Started

``` vue
<template>
    <div>
        <button @click="play">播放</botton>
        <gps-player :server="server" :user-name="userName" :password="password">
            <gps-video :device-id="device.id" :video-title="device.name" @onStop="stop"></gps-video>
        </gps-player>
    </div>
</template>
<script>
import { GpsPlayer, GpsVideo } from 'gps-player'
export default {
    components: {
        GpsPlayer,
        GpsVideo
    },
    data () {
        return {
            server: '/', // server url
            userName: 'admin',//your username
            password: 'password',// your password
            device: {
                id: '',
                name: ''
            }
        }
    },
    methods: {
        play () {
            this.device.id = 'deviceid'// device id
            this.device.name = 'devicename' // device name
        },
        stop () {
          this.device.id = ''// device id
          this.device.name = '' // device name
        }
    }
}
</script>
```
