<template>
  <div>
    <el-collapse-transition>
      <div class="searchBox mb20">
        <el-form ref="searchForm" :model="searchForm" class="form-item" label-width="80px">
          <el-row>
            <el-col :xs="24" :span="6">
              <el-form-item label="推荐码">
                <el-input v-model="searchForm.searchWords" placeholder="请输入推荐码" size="small"></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :span="6">
              <el-form-item label="状态">
                <el-select v-model="searchForm.state" placeholder="请选择状态" size="small">
                  <el-option value="1" label="有效"></el-option>
                  <el-option value="0" label="无效"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :span="12">
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
      <el-button type="success" size="small" @click="addModalShow"><i class="el-icon-plus"></i> 生成推荐码</el-button>
      <el-button type="primary" size="small" :disabled="disabled" @click="changeState(1)"><i class="el-icon-circle-check"></i>
        有效</el-button>
      <el-button type="warning" size="small" :disabled="disabled" @click="changeState(0)">
        <i class="el-icon-warning-outline"></i> 无效</el-button>
    </div>
    <div class="mt10">
      <el-table border :data="tableData" id="exportTable" style="width: 100%" :header-cell-style="{background:'#fafafa'}"
        @selection-change="handleSelectionChange" @row-click="rowClick" ref="table">
        <el-table-column type="selection" align="center"></el-table-column>
        <el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
        <el-table-column prop="Rnumber" label="推荐码" align="center"></el-table-column>
        <el-table-column prop="Name" label="姓名" align="center"></el-table-column>
        <el-table-column prop="States" label="状态" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.States==1" class="success">有效</span>
            <span v-if="scope.row.States==0" class="danger">无效</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-foot">
        <div></div>
        <div>
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]" :page-size="10" layout="total, sizes, prev, pager, next, jumper" :total="total">
          </el-pagination>
        </div>
      </div>
    </div>
    <!--新增/修改-->
    <el-dialog :title="title" :visible.sync="editModal" :close-on-click-modal="false" :before-close="closeModal">
      <el-form :model='editForm' ref='editForm' :rules='Rules' label-width='120px' status-icon>
        <el-form-item label='生成数量' prop="count">
          <el-input v-model='editForm.count'></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addSubmit" v-show="doType=='add'">确 定</el-button>
        <el-button @click="closeModal">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    codeList,
    codeAdd,
    codeState
  } from '@/api/api';
  export default {
    name: 'referralCode',
    data() {
      return {
        title: '',
        currentPage: 1,
        pageSize: 10,
        total: 0,
        doType: '',
        disabled: true, //单项禁用
        disabledMore: true, //多项禁用
        editModal: false, //新增修改
        tableData: [],
        checkBoxData: [], //选中数据
        searchForm: {
          searchWords: '',
          state: ''
        },
        editForm: {
          count: ''
        },
        Rules: {
          count: [{
              required: true,
              message: '数量不能为空',
              trigger: 'blur'
            },
            {
              pattern: /^([1-9]|10)$/,
              message: '数量必须为大于0且小于等于10的整数',
              trigger: 'blur'
            }
          ]
        }
      }
    },
    created() {
      this.getAllData()
    },
    methods: {
      //获取数据
      getAllData() {
        let _this = this
        let params = {
          number: _this.searchForm.searchWords,
          state: _this.searchForm.state,
          pageNum: _this.currentPage,
          pagesize: _this.pageSize,
        }
        codeList(params).then(res => {
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

      // 新增弹框
      addModalShow() {
        let _this = this
        _this.editModal = true
        _this.title = '生成推荐码'
        _this.doType = 'add'
      },

      // 新增
      addSubmit() {
        let _this = this
        _this.$refs.editForm.validate((valid) => {
          if (valid) {
            let params = {
              Number: _this.editForm.count,
              Id: 1
            }
            codeAdd(params).then((res) => {
              _this.closeModal()
              _this.getAllData()
            }).catch((e) => {})
          }
        })
      },

      //更改状态
      changeState(val) {
        let _this = this
        let params = {
          Id: _this.checkBoxData[0].Id,
          State: val
        }
        codeState(params).then((res) => {
          _this.getAllData()
        }).catch(() => {})
      },

      //选中行
      rowClick(val) {
        let _this = this
        _this.$refs.table.clearSelection()
        _this.$refs.table.toggleRowSelection(val, true)
        _this.checkBoxData[0] = val
      },

      // 是否有选中
      handleSelectionChange(val) {
        let _this = this
        _this.checkBoxData = val
        let checkNum = _this.checkBoxData.length
        if (checkNum == 1) {
          _this.disabled = false
          _this.disabledMore = false
        } else if (checkNum > 1) {
          _this.disabled = true
          _this.disabledMore = false
        } else {
          _this.disabled = true
          _this.disabledMore = true
        }
      },

      // 重置
      resetSearch() {
        let _this = this
        _this.searchForm = {
          searchWords: '',
          state: ''
        }
        _this.currentPage = 1
        _this.getAllData()
      },

      //关闭新增修改弹窗
      closeModal() {
        let _this = this
        _this.editModal = false
        _this.$refs['editForm'].resetFields()
        _this.editForm = {
          count: '',
        }
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
      }

    }
  }
</script>

<style>

</style>
