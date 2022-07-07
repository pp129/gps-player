<template>
<div>
  <p style="display: flex;flex-direction: row;">
    <span v-for="item in routes" :key="item.name" @click="routeTo(item.path)" style="margin-left: 10px;cursor: pointer;">
      <span>{{item.meta.title}}</span>
    </span>
  </p>
</div>
</template>

<script>
import { routes } from '@/router'
export default {
  name: 'navList',
  data () {
    return {
      routes: routes
    }
  },
  methods: {
    routeTo (path) { this.$router.push(path) }
  }
}
</script>

<style scoped>

</style>
