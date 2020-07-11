<template>
  <el-container>
    <el-header>
      <NavMenu></NavMenu>
    </el-header>
    <el-main>
      <div :class="{'content-collapse':collapse}">
        <div class="main">
          <transition name="move" mode="out-in">
            <keep-alive :include="tagsList">
              <router-view></router-view>
            </keep-alive>
          </transition>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import NavMenu from './navMenu'
import bus from './bus'
export default {
  name: 'home',
  data () {
    return {
      tagsList: [],
      collapse: false
    }
  },
  components: {
    NavMenu
  },
  created () {
    bus.$on('collapse', msg => {
      this.collapse = msg
    })

    // 只有在标签页列表里的页面才使用keep-alive，即关闭标签之后就不保存到内存中了。
    bus.$on('tags', msg => {
      let arr = []
      for (let i = 0, len = msg.length; i < len; i++) {
        msg[i].name && arr.push(msg[i].name)
      }
      this.tagsList = arr
    })
  }
}
</script>

<style scoped>

</style>
