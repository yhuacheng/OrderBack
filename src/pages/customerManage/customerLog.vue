<template>
  <div class="container">
    <div class="mb20 fz14">
      <span>客户充值扣款记录</span>
    </div>
    <div class="mt10">
      <el-collapse-transition>
        <div class="searchBox mb20">
          <el-form ref="searchForm" :model="searchForm" class="form-item" label-width="80px">
            <el-row>
              <el-col :xs="24" :span="6">
                <el-form-item label="搜索内容">
                  <el-input v-model="searchForm.searchWords" placeholder="请输入流水号或客户编码" size="small"></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :span="18">
                <el-form-item>
                  <el-button type="primary" size="small" @click="searchData">查询</el-button>
                  <el-button size="small" @click="resetSearch">重置</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </el-collapse-transition>
      <div class="mb20">
        <el-button type="warning" size="small" @click="exportExcel"><i class="el-icon-upload2"></i> 导出</el-button>
      </div>
      <div class="mt10">
        <el-table border :data="tableData" id="exportTable" style="width: 100%" :header-cell-style="{background:'#fafafa'}"
          ref="table">
          <el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
          <el-table-column prop="BusinessNumber" label="流水号" align="center"></el-table-column>
          <el-table-column prop="CustomerId" label="客户编码" align="center"></el-table-column>
          <el-table-column prop="TransactionTime" label="交易时间" align="center"></el-table-column>
          <el-table-column prop="TransactionAmount" label="交易金额" align="center">
            <template slot-scope="scope">
              <span class="danger">{{scope.row.TransactionAmount}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="Remarks" label="备注" align="center"></el-table-column>
        </el-table>
        <div class="table-foot">
          <div></div>
          <div>
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
              :page-sizes="[10, 20, 50, 100, 1000, 10000]" :page-size="10" layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'

  import {
    customerLog
  } from '@/api/api'
  export default {
    name: 'customerLog',
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
        let params = {
          keyWord: _this.searchForm.searchWords,
          pageNum: _this.currentPage,
          pagesize: _this.pageSize,
        }
        customerLog(params).then(res => {
          _this.tableData = res.list
          _this.total = Number(res.total)
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

      // 导出
      exportExcel() {
        var xlsxParam = {
          raw: true
        }
        var wb = XLSX.utils.table_to_book(document.querySelector('#exportTable'), xlsxParam)
        var wbout = XLSX.write(wb, {
          bookType: 'xlsx',
          bookSST: true,
          type: 'array'
        })
        try {
          FileSaver.saveAs(new Blob([wbout], {
            type: 'application/octet-stream'
          }), '客户充值扣款记录.xlsx')
        } catch (e) {
          if (typeof console !== 'undefined') {
            console.log(e, wbout)
          }
        }
        return wbout
      }
    }
  }
</script>

<style>

</style>
