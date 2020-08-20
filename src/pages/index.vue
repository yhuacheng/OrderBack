<template>
  <div style="width:80%;margin: 0 auto;">
    <el-row type="flex" justify="space-between" class="indexCount">
      <el-col :span="3" :xs="12">
        <div class="items">
          <div class="grid">总客户</div>
          <div class="nums success">{{allCustomer}}</div>
        </div>
      </el-col>
      <el-col :span="3" :xs="12">
        <div class="items">
          <div class="grid">今日客户</div>
          <div class="nums warning">{{todayCustomer}}</div>
        </div>
      </el-col>
      <el-col :span="3" :xs="12">
        <div class="items">
          <div class="grid">总订单</div>
          <div class="nums success">{{allOrder}}</div>
        </div>
      </el-col>
      <el-col :span="3" :xs="12">
        <div class="items">
          <div class="grid">今日订单</div>
          <div class="nums warning">{{todayOrder}}</div>
        </div>
      </el-col>
      <el-col :span="3" :xs="12">
        <div class="items">
          <div class="grid">总任务</div>
          <div class="nums success">{{allTask}}</div>
        </div>
      </el-col>
      <el-col :span="3" :xs="12">
        <div class="items">
          <div class="grid">进行中的任务</div>
          <div class="nums primary">{{doingTask}}</div>
        </div>
      </el-col>
      <el-col :span="3" :xs="12">
        <div class="items">
          <div class="grid">7天未分配的任务</div>
          <div class="nums danger">{{taskNoAllot}}</div>
        </div>
      </el-col>
    </el-row>
    <el-row class="mt20" :gutter="20">
      <el-col :span="12">
        <div class="itemBg">
          <div id="container2" style="height: 250px;"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="itemBg">
          <div id="container3" style="height: 250px;"></div>
        </div>
      </el-col>
    </el-row>
    <el-row class="mt20">
      <el-col :span="24">
        <div class="itemBg">
          <div id="container" style="height: 300px;"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  var echarts = require('echarts/lib/echarts')
  // 引入柱状图组件、折线图
  require('echarts/lib/chart/bar')
  require('echarts/lib/chart/line')
  require('echarts/lib/chart/pie')
  // 引入提示框和title组件
  require('echarts/lib/component/tooltip')
  require('echarts/lib/component/title')
  require('echarts/lib/component/legend')
  require('echarts/lib/component/toolbox')

  import {
    customerCount,
    orderCount,
    taskCount,
    taskProgress,
    taskNoAllot,
    orderStateNum,
    taskStateNum
  } from '@/api/api';
  export default {
    name: 'index',
    data() {
      return {
        allCustomer: 0,
        todayCustomer: 0,
        allOrder: 0,
        todayOrder: 0,
        allTask: 0,
        doingTask: 0,
        taskNoAllot: 0
      }
    },
    created() {
      this.customerCountShow()
      this.orderCountShow()
      this.taskCountShow()
      this.taskNoAllotShow()
      this.taskProgressShow()
      this.orderDataShow()
      this.taskDataShow()
    },
    methods: {
      //客户统计数据
      customerCountShow() {
        let _this = this
        customerCount().then(res => {
          _this.allCustomer = Number(res.list[0].heji)
          _this.todayCustomer = Number(res.list[0].meiri)
        }).catch((e) => {})
      },

      //订单统计数据
      orderCountShow() {
        let _this = this
        orderCount().then(res => {
          _this.allOrder = Number(res.list[0].heji)
          _this.todayOrder = Number(res.list[0].meiri)
        }).catch((e) => {})
      },

      //任务统计数据
      taskCountShow() {
        let _this = this
        taskCount().then(res => {
          _this.allTask = Number(res.list[0].heji)
          _this.doingTask = Number(res.list[0].meiri)
        }).catch((e) => {})
      },

      //7天未分配任务数据
      taskNoAllotShow() {
        let _this = this
        taskNoAllot().then(res => {
          _this.taskNoAllot = Number(res.list[0].heji)
        }).catch((e) => {})
      },

      //任务进度数据
      taskProgressShow() {
        let _this = this
        let nameArry = []
        let okDataArry = []
        let noDataArry = []
        taskProgress().then(res => {
          let data = res.list
          for (let x in data) {
            nameArry.push(data[x].name)
            if (Number(data[x].heji) == 0) {
              okDataArry.push(null)
            } else {
              okDataArry.push(Number(data[x].heji))
            }
            if (Number(data[x].meiri) == 0) {
              noDataArry.push(null)
            } else {
              noDataArry.push(Number(data[x].meiri))
            }
          }
          _this.taskProgressChart(nameArry, okDataArry, noDataArry)
        }).catch((e) => {})
      },

      // 任务进度统计图展示
      taskProgressChart(name, okData, noData) {
        let dom = document.getElementById('container')
        let myChart = echarts.init(dom)
        myChart.setOption({
          title: {
            text: '任务进度统计',
            left: 'center',
            textStyle: {
              fontWeight: 'normal',
              fontSize: 12
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          legend: {
            left: 'left',
            data: ['已完结', '待完成']
          },
          toolbox: {
            show: true,
            feature: {
              dataView: {
                readOnly: false
              },
              magicType: {
                type: ['line', 'bar']
              },
              restore: {},
              saveAsImage: {}
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'value'
          },
          yAxis: {
            type: 'category',
            data: name
          },
          series: [{
              name: '已完结',
              type: 'bar',
              stack: '总量',
              label: {
                normal: {
                  show: true,
                  position: 'insideRight'
                }
              },
              itemStyle: {
                normal: {
                  color: '#40C9C6'
                }
              },
              data: okData
            },
            {
              name: '待完成',
              type: 'bar',
              stack: '总量',
              label: {
                normal: {
                  show: true,
                  position: 'insideRight'
                }
              },
              itemStyle: {
                normal: {
                  color: '#e34b71'
                }
              },
              data: noData
            }
          ]
        })
        let autoHeight = name.length * 50 + 50; // length为柱状图的条数
        myChart.getDom().style.height = autoHeight + "px";
        myChart.resize();
      },

      //订单数据
      orderDataShow() {
        let _this = this
        let params = {
          keyWord: '',
          countryId: 0,
          type: 0,
          Diff: 0,
          startTime: '',
          endTime: '',
        }
        orderStateNum(params).then(res => {
          let all = Number(res.list[0].TotalCount) //全部
          let dqr = Number(res.list[0].OrderStateInOne) //待确认
          let dfp = Number(res.list[0].OrderStateInTwo) //待分配
          let yfp = Number(res.list[0].OrderStateInThree) //已分配
          let ywc = Number(res.list[0].OrderStateInFour) //已完成
          let yqx = Number(res.list[0].OrderStateInFive) //已取消

          let nameArry = ['待确认', '待分配', '已分配', '已完成', '已取消']
          let dataArry = [{
            value: dqr,
            name: '待确认'
          }, {
            value: dfp,
            name: '待分配'
          }, {
            value: yfp,
            name: '已分配'
          }, {
            value: ywc,
            name: '已完成'
          }, {
            value: yqx,
            name: '已取消'
          }]
          _this.orderChart(nameArry, dataArry, all)
        }).catch((e) => {})
      },
      //订单统计图展示
      orderChart(name, data, all) {
        let dom = document.getElementById('container2')
        let myChart = echarts.init(dom)
        myChart.setOption({
          title: {
            text: '订单统计',
            left: 'center',
            textStyle: {
              fontWeight: 'normal',
              fontSize: 12
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            data: name
          },
          series: [{
            name: '总订单：' + all,
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }]
        })
      },
      //任务数据
      taskDataShow() {
        let _this = this
        let userId = sessionStorage.getItem('userId')
        let roleId = sessionStorage.getItem('roleId')
        let params = {
          Id: 1,
          Key: 'Michale_009',
          keyWord: '',
          RoolId: 1,
          countryId: 0,
          Diff: 0,
          startTime: '',
          endTime: ''
        }
        taskStateNum(params).then(res => {
          let all = Number(res.list[0].TotalCount) //全部
          let dfp = Number(res.list[0].OrderStateInOne) //待分配
          let dgm = Number(res.list[0].OrderStateInTwo) //待购买
          let dqrcd = Number(res.list[0].OrderStateInThree) //待确认出单
          let dpj = Number(res.list[0].OrderStateInFour) //待评价
          let dqrpj = Number(res.list[0].OrderStateInFive) //待确认评价
          let ywc = Number(res.list[0].OrderStateInSix) //已完成
          let yqx = Number(res.list[0].OrderStateInSeven) //已取消
          let error = Number(res.list[0].OrderStateInEight) //异常
          let nameArry = ['待分配', '待购买', '待确认出单', '待评价', '待确认评价', '已完成', '已取消', '异常']
          let dataArry = [{
            value: dfp,
            name: '待分配'
          }, {
            value: dgm,
            name: '待购买'
          }, {
            value: dqrcd,
            name: '待确认出单'
          }, {
            value: dpj,
            name: '待评价'
          }, {
            value: dqrpj,
            name: '待确认评价'
          }, {
            value: ywc,
            name: '已完成'
          }, {
            value: yqx,
            name: '已取消'
          }, {
            value: error,
            name: '异常'
          }]
          _this.taskChart(nameArry, dataArry, all)
        }).catch((e) => {})
      },
      //任务统计图展示
      taskChart(name, data, all) {
        let dom = document.getElementById('container3')
        let myChart = echarts.init(dom)
        myChart.setOption({
          title: {
            text: '任务统计',
            left: 'center',
            textStyle: {
              fontWeight: 'normal',
              fontSize: 12
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 'right',
            data: name
          },
          series: [{
            name: '总任务：' + all,
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }]
        })
      }
    }
  }
</script>

<style>

</style>
