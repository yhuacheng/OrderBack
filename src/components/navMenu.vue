<template>
  <div class="navCon">
    <div class="navHead">
      <div class="line"></div>
      <el-menu :default-active="onRoutes" background-color="#001529" text-color="#fff" active-text-color="#5FB878"
        class="el-menu-demo navBox" mode="horizontal" unique-opened router>
        <el-menu-item style="border: none;">
          <img class="imgLogo" src="../assets/image/logo.png" />
        </el-menu-item>
        <el-menu-item index="index" v-if="menu.index"><i class="el-icon-data-line"></i>首页</el-menu-item>
        <el-menu-item index="order" v-if="menu.order"><i class="el-icon-document-checked"></i>订单管理</el-menu-item>
        <el-menu-item index="task" v-if="menu.task"><i class="el-icon-document"></i>任务管理</el-menu-item>
        <el-menu-item index="customer" v-if="menu.customer"><i class="el-icon-news"></i>客户管理</el-menu-item>
        <el-menu-item index="takemoney" v-if="menu.takemoney"><i class="el-icon-coin"></i>提现管理</el-menu-item>
        <el-menu-item index="user" v-if="menu.user"><i class="el-icon-user"></i>用户管理</el-menu-item>
        <el-menu-item index="system" v-if="menu.system"><i class="el-icon-setting"></i>系统设置</el-menu-item>
        <el-submenu index="11" class="userInfoBox">
          <template slot="title"><i class="el-icon-s-custom"></i>{{userName}}</template>
          <el-menu-item index="userInfo">个人资料</el-menu-item>
          <el-menu-item index="12" @click="loginOut">退出系统</el-menu-item>
        </el-submenu>
      </el-menu>
    </div>
  </div>
</template>

<script>
  import bus from './bus'
  export default {
    name: 'navMenu',
    data() {
      return {
        userName: sessionStorage.getItem('userName'),
        menu: {
          'index': false,
          'order': false,
          'task': false,
          'customer': false,
          'takemoney': false,
          'user': false,
          'system': false
        }
      }
    },
    created() {
      // 通过 Event Bus 进行组件间通信，来折叠侧边栏
      bus.$on('collapse', msg => {
        this.collapse = msg
      })

      //获取菜单
      this.getMenu()
    },
    computed: {
      onRoutes() {
        return this.$route.path.replace('/', '')
      }
    },
    methods: {
      //退出
      loginOut() {
        this.$router.push('/login')
        sessionStorage.clear()
      },

      //根据角色判断目录权限
      getMenu() {
        let _this = this
        let roleId = sessionStorage.getItem('roleId')

        //管理员
        if (roleId.indexOf(1) >= 0) {
          _this.menu.index = true
          _this.menu.order = true
          _this.menu.task = true
          _this.menu.customer = true
          _this.menu.takemoney = true
          _this.menu.user = true
          _this.menu.system = true
        }
        //子管理员
        if (roleId.indexOf(2) >= 0) {
          _this.menu.index = true
          _this.menu.order = true
          _this.menu.task = true
          _this.menu.customer = true
        }
        //财务
        if (roleId.indexOf(3) >= 0) {
          _this.menu.index = true
          _this.menu.task = true
          _this.menu.customer = true
          _this.menu.takemoney = true
        }
        //操作员
        if (roleId.indexOf(4) >= 0) {
          _this.menu.index = true
          _this.menu.order = true
          _this.menu.task = true
        }
        //外派员
        if (roleId.indexOf(5) >= 0) {
          _this.menu.task = true
        }
        //业务员
        if (roleId.indexOf(6) >= 0) {
          _this.menu.index = true
          _this.menu.order = true
          _this.menu.task = true
          _this.menu.customer = true
        }
      }
    }
  }
</script>

<style>

</style>
