<template>
  <div id="app">
    <nav-list></nav-list>
    <router-view/>
  </div>
</template>
<script>
import navList from '@/components/nav'
export default {
  components: {
    navList
  }
}
</script>
<style lang="scss">
html,body{
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  ul{
    margin: 0;
    padding: 0;
  }
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}
</style>
