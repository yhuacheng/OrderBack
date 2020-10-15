<template>
  <div class="container">
    <div class="mb20 fz14">
      <span>客户交易记录</span>
      <el-button type="warning" size="small" @click="exportExcel" class="fright"><i class="el-icon-upload2"></i> 导出</el-button>
    </div>
    <div class="mt10">
      <pl-table border :data="tableData" id="exportTable" style="width: 100%" :header-cell-style="{background:'#fafafa'}"
        ref="table" use-virtual max-height="730" :row-height="60">
        <pl-table-column type="index" label="序号" align="center" width="50"></pl-table-column>
        <pl-table-column prop="BusinessNumber" label="流水号" align="center"></pl-table-column>
        <pl-table-column prop="CustomerId" label="客户编号" align="center"></pl-table-column>
        <pl-table-column prop="Name" label="客户名称" align="center"></pl-table-column>
        <pl-table-column prop="PaymentState" label="收支类型" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.PaymentState==1" class="success">收入</span>
            <span v-if="scope.row.PaymentState==2" class="danger">支出</span>
            <span v-if="scope.row.PaymentState==3" class="warning">退单返本</span>
          </template>
        </pl-table-column>
        <pl-table-column prop="TransactionAmount" class="danger" label="金额" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.PaymentState==1" class="success">{{scope.row.TransactionAmount}}</span>
            <span v-if="scope.row.PaymentState==2" class="danger">{{scope.row.TransactionAmount}}</span>
            <span v-if="scope.row.PaymentState==3" class="warning">{{scope.row.TransactionAmount}}</span>
          </template>
        </pl-table-column>
        <pl-table-column prop="TransactionTime" label="交易时间" align="center"></pl-table-column>
        <pl-table-column prop="Remarks" label="备注" align="center" :show-overflow-tooltip='true' width="400"></pl-table-column>
      </pl-table>
    </div>
  </div>
</template>

<script>
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'

  import table2excel from 'js-table2excel'

  import {
    customerMoney
  } from '@/api/api'
  export default {
    name: 'customerMoney',
    data() {
      return {
        currentPage: 1,
        pageSize: 10,
        total: 0,
        tableData: [],
        searchForm: {
          searchWords: ''
        }
      }
    },
    created() {
      this.getAllData()
    },
    methods: {
      // 获取列表数据
      getAllData() {
        let _this = this
        let params = {}
        customerMoney(params).then(res => {
          _this.tableData = res.list
        }).catch((e) => {})
      },

      //查询
      searchData() {
        let _this = this
        _this.currentPage = 1 //页码归1
        _this.getAllData()
      },

      // 重置
      resetSearch() {
        let _this = this
        _this.searchForm = {
          searchWords: ''
        }
        _this.currentPage = 1
        _this.getAllData()
      },

      //翻页
      handleSizeChange(val) {
        let _this = this
        _this.pageSize = val
        _this.getAllData()
      },
      handleCurrentChange(val) {
        let _this = this
        _this.currentPage = val
        _this.getAllData()
      },

      //导出
      exportExcel() {
        const column = [{
            title: '流水号',
            key: 'BusinessNumber',
            type: 'text'
          },
          {
            title: '客户编号',
            key: 'CustomerId',
            type: 'text'
          },
          {
            title: '客户名称',
            key: 'Name',
            type: 'text'
          },
          {
            title: '收支类型',
            key: 'ExpType',
            type: 'text'
          },
          {
            title: '金额',
            key: 'TransactionAmount',
            type: 'text'
          },
          {
            title: '交易时间',
            key: 'TransactionTime',
            type: 'text'
          },
          {
            title: '备注',
            key: 'Remarks',
            type: 'text'
          }
        ]

        // 1.title为列名
        // 2.key为data数据每个对象对应的key
        // 3.若为图片格式, 需要加type为image的说明,并且可以设置图片的宽高
        const data = this.tableData
        // data数据一些特殊处理
        for (const t in data) {
          let TxtType = ''
          if (data[t].PaymentState == 1) {
            TxtType = '余额收入'
          }
          if (data[t].PaymentState == 2) {
            TxtType = '余额支出'
          }
          data[t].ExpType = TxtType
        }
        const excelName = '客户交易记录.xls'
        table2excel(column, data, excelName)
      }
    }
  }
</script>
