<template>
  <div class="user-box">
    <div class="mt10">
      <el-form :model="userInfo" ref="userInfo" label-width="100px">
        <el-form-item label="账号：">
          <span>{{userInfo.LoginName}}</span>
        </el-form-item>
        <el-form-item label="姓名：">
          <span>{{userInfo.Name}}</span>
        </el-form-item>
        <el-form-item label="角色：">
          <span>{{userInfo.Role}}</span>
        </el-form-item>
        <el-form-item label="推荐码：">
          <span>{{userInfo.RecommentNumber}}</span>
        </el-form-item>
        <el-form-item label="手机：">
          <span>{{userInfo.Phone}}</span>
        </el-form-item>
        <el-form-item label="邮箱：">
          <span>{{userInfo.Email}}</span>
        </el-form-item>
        <el-form-item label="备注：">
          <span>{{userInfo.Remarks}}</span>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
  import {
    userList,
    roleList
  } from '@/api/api'
  export default {
    name: 'userInfo',
    data() {
      return {
        userData: [],
        roleData: [],
        userInfo: {}
      }
    },
    created() {
      this.getUserData()
    },
    methods: {
      // 获取用户数据
      getUserData() {
        let _this = this
        let params = {
          name: '',
          pageNum: 1,
          pagesize: 100000000,
        }
        userList(params).then(res => {
          _this.userData = res.list
          _this.getUserInfo()
        }).catch((e) => {})
      },

      //匹配个人信息
      getUserInfo() {
        let _this = this
        let userData = _this.userData
        let userId = sessionStorage.getItem('userId')
        for (let x in userData) {
          if (userData[x].Id == Number(userId)) {
            _this.userInfo = userData[x]
          }
        }
        _this.getRoleData()
      },

      //获取角色数据 转换角色id为角色名
      getRoleData() {
        let _this = this
        let params = {}
        roleList(params).then(res => {
          _this.roleData = res.list
          let roleText = ''
          let roleIdArr = sessionStorage.getItem('roleId').split('')
          for (let item in roleIdArr) {
            let roleId1 = roleIdArr[item]
            for (let item2 in _this.roleData) {
              let roleId2 = _this.roleData[item2].Id
              if (Number(roleId1) == Number(roleId2)) {
                roleText += '、' + _this.roleData[item2].RoleName
              }
            }
          }
          _this.$set(_this.userInfo, 'Role',roleText.substring(1))
        }).catch((e) => {})
      }
    }
  }
</script>
<style scoped>
  .user-box {
    background: #fff;
    padding: 50px;
    width: 30%;
    margin: 0 auto;
  }
</style>
