<template>
  <div>
    <el-collapse-transition>
      <div class="searchBox mb20">
        <el-form ref="searchForm" :model="searchForm" class="form-item" label-width="80px">
          <el-row>
            <el-col :xs="24" :span="6">
              <el-form-item label="开始区间">
                <el-input v-model="searchForm.start" placeholder="请输入开始区间" size="small"></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :span="6">
              <el-form-item label="结束区间">
                <el-input v-model="searchForm.end" placeholder="请输入结束区间" size="small"></el-input>
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
      <el-button type="success" size="small" @click="addModalShow"><i class="el-icon-plus"></i> 新增</el-button>
      <el-button type="primary" size="small" :disabled="disabled" @click="editModalShow">
        <i class="el-icon-edit-outline"></i> 修改</el-button>
      <el-button type="success" size="small" :disabled="disabled" @click="changeState(1)"><i class="el-icon-circle-check"></i>
        有效</el-button>
      <el-button type="warning" size="small" :disabled="disabled" @click="changeState(0)">
        <i class="el-icon-warning-outline"></i> 无效</el-button>
    </div>
    <div class="mt10">
      <el-table border :data="tableData" id="exportTable" style="width: 100%" :header-cell-style="{background:'#fafafa'}"
        @selection-change="handleSelectionChange" @row-click="rowClick" ref="table">
        <el-table-column type="selection" align="center"></el-table-column>
        <el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
        <el-table-column prop="Start" label="开始区间($)" align="center"></el-table-column>
        <el-table-column prop="Ent" label="结束区间($)" align="center"></el-table-column>
        <el-table-column prop="IServiceFee" label="增值服务费($)" align="center"></el-table-column>
        <el-table-column prop="Remarks" label="备注" align="center"></el-table-column>
        <el-table-column prop="State" label="状态" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.State==1" class="success">有效</span>
            <span v-if="scope.row.State==0" class="danger">无效</span>
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
        <el-form-item label='开始区间$' prop='Start'>
          <el-input v-model='editForm.Start'></el-input>
        </el-form-item>
        <el-form-item label='结束区间$' prop='Ent'>
          <el-input v-model='editForm.Ent'></el-input>
        </el-form-item>
        <el-form-item label='增值服务费(￥)' prop='IServiceFee'>
          <el-input v-model='editForm.IServiceFee'></el-input>
        </el-form-item>
        <el-form-item label='备注' prop="Remarks">
          <el-input type="textarea" :rows="3" v-model='editForm.Remarks'></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addSubmit" v-show="doType=='add'">确 定</el-button>
        <el-button type="primary" @click="editSubmit" v-show="doType=='edit'">确 定</el-button>
        <el-button @click="closeModal">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    addedServiceList,
    addedServiceAdd,
    addedServiceEdit,
    addedServiceState
  } from '@/api/api'
  export default {
    name: 'addedService',
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
          start: '',
          end: ''
        },
        editForm: {
          Start: '',
          Ent: '',
          IServiceFee: '',
          Remarks: ''
        },
        Rules: {
          Start: [{
            required: true,
            message: '请输入开始区间',
            trigger: 'blur'
          }],
          Ent: [{
            required: true,
            message: '请输入结束区间',
            trigger: 'blur'
          }],
          IServiceFee: [{
              required: true,
              message: '请输入增值服务费',
              trigger: 'blur'
            },
            {
              pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
              message: '增值服务费格式不正确',
              trigger: ['blur']
            }
          ]
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
        let start = _this.searchForm.start
        let end = _this.searchForm.end
        if (start != '' && end == '') {
          end = 100000000
        }
        if (start == '' && end != '') {
          start = 0
        }
        if (Number(start) > Number(end)) {
          _this.$message.error('开始区间不能大于结束区间')
        } else {
          let params = {
            start: start,
            ent: end,
            pageNum: _this.currentPage,
            pagesize: _this.pageSize,
          }
          addedServiceList(params).then(res => {
            _this.tableData = res.list
            _this.total = Number(res.total)
          }).catch((e) => {})
        }
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
        _this.title = '增值服务费新增'
        _this.doType = 'add'
      },

      // 新增
      addSubmit() {
        let _this = this
        _this.$refs.editForm.validate((valid) => {
          if (valid) {
            let params = Object.assign({}, this.editForm)
            addedServiceAdd(params).then(res => {
              _this.closeModal()
              _this.getAllData()
            }).catch((e) => {})
          }
        })
      },

      // 修改弹框
      editModalShow() {
        let _this = this
        _this.editModal = true
        _this.title = '增值服务费修改'
        _this.doType = 'edit'
        let data = _this.checkBoxData[0]
        _this.editForm = {
          Start: data.Start,
          Ent: data.Ent,
          IServiceFee: data.IServiceFee,
          Remarks: data.Remarks
        }
      },

      // 修改
      editSubmit() {
        let _this = this
        _this.$refs.editForm.validate((valid) => {
          if (valid) {
            let params = Object.assign({}, _this.editForm)
            params.Id = _this.checkBoxData[0].Id
            addedServiceEdit(params).then(res => {
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
        addedServiceState(params).then((res) => {
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
          start: '',
          end: ''
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
          Start: '',
          Ent: '',
          IServiceFee: '',
          Remarks: ''
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
