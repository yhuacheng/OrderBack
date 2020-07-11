<template>
  <div class="container">
    <div class="mb20 fz14">
      <span>用户管理</span>
    </div>
    <div class="mt10">
      <el-collapse-transition>
        <div class="searchBox mb20">
          <el-form ref="searchForm" :model="searchForm" class="form-item" label-width="80px">
            <el-row>
              <el-col :xs="24" :span="6">
                <el-form-item label="用户姓名">
                  <el-input v-model="searchForm.searchWords" placeholder="请输入姓名" size="small"></el-input>
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
        <el-button type="success" size="small" @click="addModalShow"><i class="el-icon-plus"></i> 新增</el-button>
        <el-button type="primary" size="small" :disabled="disabled" @click="editModalShow">
          <i class="el-icon-edit-outline"></i> 修改</el-button>
        <el-button type="danger" size="small" :disabled="disabled" @click="delData"><i class="el-icon-delete-solid"></i>
          删除</el-button>
        <el-button type="warning" size="small" @click="exportExcel"><i class="el-icon-upload2"></i> 导出</el-button>
      </div>
      <div class="mt10">
        <el-table border :data="tableData" id="exportTable" style="width: 100%" :header-cell-style="{background:'#fafafa'}"
          @selection-change="handleSelectionChange" @row-click="rowClick" ref="table">
          <el-table-column type="selection" align="center"></el-table-column>
          <el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
          <el-table-column prop="Id" label="编码" align="center"></el-table-column>
          <el-table-column prop="Name" label="姓名" align="center"></el-table-column>
          <el-table-column prop="LoginName" label="账号" align="center"></el-table-column>
          <el-table-column prop="RoolId" label="角色" align="center" :formatter="toTxt"></el-table-column>
          <el-table-column prop="RecommentNumber" label="推荐码" align="center"></el-table-column>
          <el-table-column prop="Phone" label="手机" align="center"></el-table-column>
          <el-table-column prop="Email" label="邮箱" align="center" width="200"></el-table-column>
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
      <!--新增修改-->
      <el-dialog :title="title" :visible.sync="editModal" :close-on-click-modal="false" :before-close="closeModal">
        <el-form :model="editForm" ref="editForm" :rules='Rules' label-width='120px' status-icon>
          <el-form-item label="姓名" prop="name">
            <el-input v-model="editForm.name"></el-input>
          </el-form-item>
          <el-form-item label="账号" prop="loginname">
            <el-input v-model="editForm.loginname"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="editForm.password"></el-input>
          </el-form-item>
          <el-form-item label="角色" prop="roole">
            <el-checkbox-group v-model="editForm.roole" @change='checkBoxFun'>
              <el-checkbox v-for="item in roleData" :label="item.Id" :key="item.Id">{{item.RoleName}}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="推荐码" prop="code" v-if="this.editForm.roole.indexOf(5)<0">
            <el-select style="width: 100%;" v-model="editForm.code" filterable placeholder="请选择推荐码" :disabled="doType=='edit'">
              <el-option v-for="item in codeData" :key="item.Id" :label="item.RecommentNumber" :value="item.Id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="state">
            <el-radio-group v-model="editForm.state">
              <el-radio :label="1">有效</el-radio>
              <el-radio :label="0">无效</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="手机" prop="phone">
            <el-input v-model="editForm.phone"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="resmks">
            <el-input type="textarea" :rows="3" v-model='editForm.resmks'></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="addSubmit" v-show="doType=='add'">确 定</el-button>
          <el-button type="primary" @click="editSubmit" v-show="doType=='edit'">确 定</el-button>
          <el-button @click="closeModal">取 消</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'

  import {
    userList,
    userAdd,
    userEdit,
    userDelete,
    codeNoUsed,
    roleList
  } from '@/api/api'
  export default {
    name: 'user',
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
        roleData: [], //角色数据
        codeData: [], //推荐码数据
        searchForm: {
          searchWords: ''
        },
        editForm: {
          name: '',
          loginname: '',
          password: '',
          roole: [],
          state: 1,
          code: '',
          phone: '',
          email: '',
          resmks: ''
        },
        Rules: {
          name: [{
            required: true,
            message: '请输入姓名',
            trigger: 'blur'
          }],
          loginname: [{
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          }],
          password: [{
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          }],
          roole: [{
            required: true,
            message: '请选择用户角色',
            trigger: 'blur'
          }],
          code: [{
            required: true,
            message: '请选择推荐码',
            trigger: 'blur'
          }],
          state: [{
            required: true,
            message: '请选择推状态',
            trigger: 'blur'
          }],
          phone: [{
            pattern: /^[1][3,4,5,6,7,8,9][0-9]{9}$/,
            message: '请输入正确的手机号',
            trigger: 'blur'
          }],
          email: [{
            pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
            message: '请输入正确的邮箱',
            trigger: 'blur'
          }]
        }
      }
    },
    created() {
      this.getAllData()
      this.getRoleData()
    },
    methods: {
      //角色数字转文字
      toTxt(val) {
        let _this = this
        let roleText = ''
        let roleId = val.RoolId
        if (roleId == null) {
          roleId = ''
        }
        let roleIdArr = roleId.trim().split('')
        for (let item in roleIdArr) {
          let roleId1 = roleIdArr[item]
          for (let item2 in _this.roleData) {
            let roleId2 = _this.roleData[item2].Id
            if (Number(roleId1) == Number(roleId2)) {
              roleText += '、' + _this.roleData[item2].RoleName
            }
          }
        }
        return roleText.substring(1)
      },

      //获取角色数据
      getRoleData() {
        let _this = this
        let params = {}
        roleList(params).then(res => {
          _this.roleData = res.list
        }).catch((e) => {})
      },

      //获取未使用的推荐码
      getCodeData() {
        let _this = this
        let params = {}
        codeNoUsed(params).then(res => {
          _this.codeData = res.list
        }).catch((e) => {})
      },

      // 获取列表数据
      getAllData() {
        let _this = this
        let params = {
          name: _this.searchForm.searchWords,
          pageNum: _this.currentPage,
          pagesize: _this.pageSize,
        }
        userList(params).then(res => {
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
        _this.getCodeData() //获取推荐码数据
        _this.title = '用户新增'
        _this.doType = 'add'
      },

      //角色复选框(外派员只能单选)
      checkBoxFun() {
        let _this = this
        let val = _this.editForm.roole
        if (val.indexOf(5) >= 0) {
          _this.editForm.roole = [5]
        }
      },

      // 新增
      addSubmit() {
        let _this = this
        _this.$refs.editForm.validate((valid) => {
          if (valid) {
            let params = Object.assign({}, this.editForm)
            userAdd(params).then(res => {
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
        _this.getCodeData() //获取推荐码数据
        _this.title = '用户修改'
        _this.doType = 'edit'
        let data = _this.checkBoxData[0]
        let roleArr = data.RoolId.trim().split('')
        _this.editForm = {
          name: data.Name,
          loginname: data.LoginName,
          password: data.Password,
          roole: roleArr.map(Number),
          state: data.State,
          code: data.RecommentNumber,
          phone: data.Phone,
          email: data.Email,
          resmks: data.Remarks
        }
      },

      // 修改
      editSubmit() {
        let _this = this
        _this.$refs.editForm.validate((valid) => {
          if (valid) {
            let params = Object.assign({}, _this.editForm)
            params.id = _this.checkBoxData[0].Id
            userEdit(params).then(res => {
              _this.closeModal()
              _this.getAllData()
            }).catch((e) => {})
          }
        })
      },

      // 删除
      delData() {
        let _this = this
        // var ids = _this.checkBoxData.map(item => item.Id)
        var ids = _this.checkBoxData[0].Id
        _this.$confirm('确认删除用户【' + _this.checkBoxData[0].Name + '】吗？', '信息提示', {
          type: 'warning'
        }).then(() => {
          let params = {
            Id: ids
          }
          userDelete(params).then((res) => {
            _this.getAllData()
          })
        }).catch(() => {})
      },

      //选中行
      rowClick(row) {
        let _this = this
        let findResult = _this.checkBoxData.findIndex((value, index) => {
          return value == row
        })
        if (findResult != -1) {
          _this.$refs.table.toggleRowSelection(row, false);
        } else {
          _this.$refs.table.toggleRowSelection(row, true);
        }
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
          searchWords: ''
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
          name: '',
          loginname: '',
          password: '',
          roole: [],
          state: 1,
          code: '',
          phone: '',
          email: '',
          resmks: ''
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
          }), '用户管理.xlsx')
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
