<template>
  <div class="container">
    <div class="mb20 fz14">
      <span>系统设置</span>
      <span>/</span>
      <span>{{title}}</span>
    </div>
    <div class="tabList mb20">
      <ul class="tabBlock">
        <li :class="active === 1 ? 'active':''" @click="changeMenu(1,'服务费')">服务费</li>
        <li :class="active === 2 ? 'active':''" @click="changeMenu(2,'增值服务费')">增值服务费</li>
        <li :class="active === 3 ? 'active':''" @click="changeMenu(3,'国家管理')">国家管理</li>
        <li :class="active === 4 ? 'active':''" @click="changeMenu(4,'货币汇率')">货币汇率</li>
        <li :class="active === 5 ? 'active':''" @click="changeMenu(5,'推荐码')">推荐码</li>
        <li :class="active === 6 ? 'active':''" @click="changeMenu(6,'支付方式')">支付方式</li>
        <li :class="active === 7 ? 'active':''" @click="changeMenu(7,'网站公告')">网站公告</li>
      </ul>
    </div>
    <div v-if="active==1">
      <serviceFee></serviceFee>
    </div>
    <div v-if="active==2">
      <addedService></addedService>
    </div>
    <div v-if="active==3">
      <countryManage></countryManage>
    </div>
    <div v-if="active==4">
      <exchangeRate></exchangeRate>
    </div>
    <div v-if="active==5">
      <referralCode></referralCode>
    </div>
    <div v-if="active==6">
      <payType></payType>
    </div>
    <div v-if="active==7">
      <notice></notice>
    </div>
  </div>
</template>

<script>
  import serviceFee from './serviceFee'
  import addedService from './addedService'
  import countryManage from './countryManage'
  import exchangeRate from './exchangeRate'
  import referralCode from './referralCode'
  import payType from './payType'
  import notice from './notice'
  export default {
    name: 'system',
    data() {
      return {
        active: 1,
        title: '服务费'
      }
    },
    components: {
      serviceFee,
      addedService,
      countryManage,
      exchangeRate,
      referralCode,
      payType,
      notice
    },
    methods: {
      changeMenu(id, val) {
        let _this = this
        _this.active = id
        _this.title = val
      }
    }
  }
</script>

<style>

</style>
