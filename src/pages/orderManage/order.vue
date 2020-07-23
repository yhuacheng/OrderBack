<template>
  <div class="container">
    <div class="mb20 fz14">
      <span>订单管理</span>
    </div>
    <div class="mt10">
      <el-collapse-transition>
        <div class="searchBox mb20">
          <el-form ref="searchForm" :model="searchForm" class="form-item" label-width="80px">
            <el-row>
              <el-col :xs="24" :span="7">
                <el-form-item label="搜索内容">
                  <el-input v-model="searchForm.searchWords" placeholder="请输入订单编号/产品名称/产品ASIN/客户编码" size="small"></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :span="17">
                <el-form-item>
                  <el-button type="primary" size="small" @click="searchData(0)">查询</el-button>
                  <el-button size="small" @click="resetSearch">重置</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </el-collapse-transition>
      <div class="mb20">
        <el-button type="primary" size="small" :disabled="disabledEditFee" @click="editModalShow">
          <i class="el-icon-edit-outline"></i> 修改费率</el-button>
        <el-button type="warning" size="small" @click="exportExcel"><i class="el-icon-upload2"></i> 导出</el-button>
        <div class="tagMenu">
          <el-badge :value="all" type="success" class="item">
            <el-button size="small" @click='searchStateData(0)' :class="{'active':searchForm.state==0}">全部</el-button>
          </el-badge>
          <el-badge :value="dqr" type="info" class="item">
            <el-button size="small" @click='searchStateData(1)' :class="{'active':searchForm.state==1}">待确认</el-button>
          </el-badge>
          <el-badge :value="dfp" type="primary" class="item">
            <el-button size="small" @click='searchStateData(2)' :class="{'active':searchForm.state==2}">待分配</el-button>
          </el-badge>
          <el-badge :value="yfp" type="warning" class="item">
            <el-button size="small" @click='searchStateData(3)' :class="{'active':searchForm.state==3}">已分配</el-button>
          </el-badge>
          <el-badge :value="ywc" type="success" class="item">
            <el-button size="small" @click='searchStateData(4)' :class="{'active':searchForm.state==4}">已完成</el-button>
          </el-badge>
          <el-badge :value="yqx" type="danger">
            <el-button size="small" @click='searchStateData(5)' :class="{'active':searchForm.state==5}">已取消</el-button>
          </el-badge>
        </div>
      </div>
      <div class="mt10">
        <el-table border :data="tableData" id="exportTable" style="width: 100%" :header-cell-style="{background:'#fafafa'}"
          @selection-change="handleSelectionChange" @row-click="rowClick" ref="table">
          <el-table-column type="selection" align="center"></el-table-column>
          <el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
          <el-table-column fixed="left" prop="OrderNumber" label="订单编号" align="center" width="140">
            <template slot-scope="scope">
              <el-link type="primary" :underline="false" @click="viewModalShow(scope.$index,scope.row)">{{scope.row.OrderNumber}}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="OrderProductPictures" label="产品图" align="center">
            <template slot-scope="scope">
              <img style="width: 40px;height: 40px;" v-show="scope.row.ProductPictures" :src="GLOBAL.IMG_URL+scope.row.ProductPictures"
                @click="showImage(scope.$index,scope.row)" />
            </template>
          </el-table-column>
          <el-table-column prop="ServiceType" label="订单类型" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.ServiceType==1">见单返</span>
              <span v-if="scope.row.ServiceType==2">评后返</span>
            </template>
          </el-table-column>
          <el-table-column prop="CountryName" label="国家" align="center"></el-table-column>
          <el-table-column prop="ASIN" label="ASIN" align="center"></el-table-column>
          <el-table-column prop="ProductName" label="产品名称" align="center" :show-overflow-tooltip='true'></el-table-column>
          <el-table-column prop="Number" label="任务数" align="center"></el-table-column>
          <el-table-column prop="ProductPrice" label="产品价格" align="center"></el-table-column>
          <el-table-column prop="Totalproductprice" label="产品总额" align="center"></el-table-column>
          <el-table-column prop="AddedFee" label="增值费" align="center"></el-table-column>
          <el-table-column prop="UnitPriceSerCharge" label="服务费" align="center"></el-table-column>
          <el-table-column prop="ExchangeRate" label="汇率" align="center"></el-table-column>
          <el-table-column prop="Total" label="合计" align="center">
            <template slot-scope="scope">
              <span class="danger">{{scope.row.Total}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="CustomerUserId" label="客户编码" align="center"></el-table-column>
          <el-table-column prop="OrderTime" label="下单时间" align="center"></el-table-column>
          <el-table-column prop="Remarks" label="备注" align="center" :show-overflow-tooltip='true'></el-table-column>
          <el-table-column prop="OrderState" label="状态" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.OrderState==1">待确认</span>
              <span v-if="scope.row.OrderState==2" class="primary">待分配</span>
              <span v-if="scope.row.OrderState==3" class="warning">已分配</span>
              <span v-if="scope.row.OrderState==4" class="success">已完成</span>
              <span v-if="scope.row.OrderState==5" class="danger">已取消</span>
            </template>
          </el-table-column>
          <el-table-column fixed="right" prop="OrderState" label="操作" align="center" width="140">
            <template slot-scope="scope">
              <el-button size="small" type="primary" v-if="scope.row.OrderState==1" @click="orderConfirm(scope.$index,scope.row,1)">确认</el-button>
              <el-button size="small" type="danger" v-if="scope.row.OrderState==1" @click="orderConfirm(scope.$index,scope.row,0)">取消</el-button>
              <el-button size="small" type="warning" v-if="scope.row.OrderState!=1" @click="taskModalShow(scope.$index,scope.row)">分配
                / 查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="table-foot">
          <div></div>
          <div>
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
              :page-sizes="[10, 20, 50, 100, 10000]" :page-size="10" layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
          </div>
        </div>
      </div>
    </div>
    <!-- 分配任务（任务列表） -->
    <el-dialog :title="title" width="90%" :visible.sync="taskModal" :close-on-click-modal="false" :before-close="closeTaskModal">
      <div class="mt-10">
        <el-button type="primary" size="small" :disabled="disabledMore2" @click="timeModalShow">分配任务</el-button>
      </div>
      <div class="mt20">
        <el-table border :data="tableData2" id="exportTable2" style="width: 100%" :header-cell-style="{background:'#fafafa'}"
          @selection-change="handleSelectionChange2" @row-click="rowClick2" ref="table2">
          <el-table-column type="selection" align="center" v-if="btnState" :selectable='disabledCheckBox'></el-table-column>
          <el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
          <el-table-column prop="OrderNumbers" label="任务编号" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.AgainTaskState!=1">{{scope.row.OrderNumbers}}</span>
              <span v-if="scope.row.AgainTaskState==1">{{scope.row.OrderNumbers}}
                <div class="danger fz10">追加任务</div>
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="Asin" label="产品ASIN" align="center"></el-table-column>
          <el-table-column prop="ProductName" label="产品名称" align="center" :show-overflow-tooltip='true'></el-table-column>
          <el-table-column prop="ProductPrice" label="产品价格" align="center"></el-table-column>
          <el-table-column prop="OrderRemarks" label="备注" align="center" :show-overflow-tooltip='true'></el-table-column>
          <el-table-column prop="TaskState" label="任务状态" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.TaskState==1">待分配</span>
              <span v-if="scope.row.TaskState==2" class="danger">待购买</span>
              <span v-if="scope.row.TaskState==3" class="primary">待确认出单</span>
              <span v-if="scope.row.TaskState==4" class="warning">待评价</span>
              <span v-if="scope.row.TaskState==5" class="primary">待确认评价</span>
              <span v-if="scope.row.TaskState==6" class="success">已完成</span>
              <span v-if="scope.row.TaskState==7" class="danger">已取消</span>
              <span v-if="scope.row.TaskState==8" class="warning">异常</span>
            </template>
          </el-table-column>
          <el-table-column prop="ExecutionTime" label="任务执行时间" align="center">
            <template slot-scope="scope">
              <span class="danger">{{scope.row.ExecutionTime}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="Name" label="操作员" align="center">
            <template slot-scope="scope">
              <span class="danger">{{scope.row.Name}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="Name1" label="外派员" align="center">
            <template slot-scope="scope">
              <span class="danger">{{scope.row.Name1}}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="table-foot">
        <div></div>
        <div>
          <el-pagination @size-change="handleSizeChange2" @current-change="handleCurrentChange2" :current-page="currentPage2"
            :page-sizes="[10, 20, 50, 100]" :page-size="10" layout="total, sizes, prev, pager, next, jumper" :total="total2">
          </el-pagination>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeTaskModal">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 分配任务（任务执行时间） -->
    <el-dialog center title="任务执行时间" width="30%" :visible.sync="timeModal" :close-on-click-modal="false" :before-close="closeTimeModal"
      style="top: -30vh;">
      <div class="textCen">
        <el-date-picker v-model="taskTime" type="datetime" :picker-options="pickerOptions" placeholder="请选择任务执行时间"
          style="width: 320px;"></el-date-picker>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="closeTimeModal">关 闭</el-button>
        <el-button size="small" type="primary" @click="userModalShow">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 分配任务（人员列表） -->
    <el-dialog title="操作员列表" width="40%" :visible.sync="userModal" :close-on-click-modal="false">
      <el-table border :data="tableData3" id="exportTable3" style="width: 100%" :header-cell-style="{background:'#fafafa'}"
        @row-click="rowClick3" ref="table3">
        <el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
        <el-table-column prop="Id" label="编码" align="center"></el-table-column>
        <el-table-column prop="Name" label="姓名" align="center"></el-table-column>
        <el-table-column prop="LoginName" label="账号" align="center"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="userModal=false">关 闭</el-button>
      </div>
    </el-dialog>
    <!--服务费和汇率修改-->
    <el-dialog :title="titleFee" width="30%" :visible.sync="editModal" :close-on-click-modal="false" :before-close="closeModal">
      <el-form :model="editForm" ref="editForm" :rules='Rules' label-width='100px' status-icon>
        <el-form-item label="服务费" prop="fee">
          <el-input v-model="editForm.fee"></el-input>
        </el-form-item>
        <el-form-item label="汇率" prop="rate">
          <el-input :disabled="editForm.type==2" v-model="editForm.rate"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editSubmit">确 定</el-button>
        <el-button @click="closeModal">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 订单查看 -->
    <el-dialog width="70%" :title="title" :visible.sync="viewModal" :close-on-click-modal="false">
      <el-form :model='view' ref='view' label-width='150px'>
        <el-row>
          <el-col :span="12">
            <el-form-item label='产品图：' prop="ProductPictures">
              <img style="width: 100px" class="pointer" @click="showImage2(view.OrderNumber,view.ProductPictures)"
                v-show="view.ProductPictures" :src="view.ProductPictures" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='产品链接：' prop="ProductLink">
              <el-link :href="view.ProductLink" target="_blank" type="primary" :underline="false">{{view.ProductLink}}</el-link>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label='订单编号：' prop="OrderNumber">
              <span>{{view.OrderNumber}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='订单状态：' prop="OrderState">
              <span v-if="view.OrderState==1">待确认</span>
              <span v-if="view.OrderState==2" class="warning">待分配</span>
              <span v-if="view.OrderState==3" class="primary">已分配</span>
              <span v-if="view.OrderState==4" class="success">已完成</span>
              <span v-if="view.OrderState==5" class="danger">已取消</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='国家：' prop="CountryName">
              <span>{{view.CountryName}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='订单类型：' prop="ServiceType">
              <span v-if="view.ServiceType==1">见单返</span>
              <span v-if="view.ServiceType==2">评后返</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label='产品名称：' prop="ProductName">
              <span>{{view.ProductName}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='产品评分：' prop="ProductScore">
              <span>{{view.ProductScore}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='店铺名：' prop="ShopName">
              <span>{{view.ShopName}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='产品ASIN：' prop="ASIN">
              <span>{{view.ASIN}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='产品单价：' prop="ProductPrice">
              <span>{{view.ProductPrice}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='关键词类型：' prop="KeyWordType">
              <span v-if="view.KeyWordType==1">产品关键词</span>
              <span v-if="view.KeyWordType==2">CPC关键词</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='关键词：' prop="ProductKeyWord">
              <span>{{view.ProductKeyWord}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='留评率：' prop="ProductPosition">
              <span>{{view.ProductPosition}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='任务开始时间：' prop="StartTime">
              <span>{{view.StartTime}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='任务结束时间：' prop="EndTime">
              <span>{{view.EndTime}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='任务数量：' prop="Number">
              <span>{{view.Number}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='汇率：' prop="ExchangeRate">
              <span>{{view.ExchangeRate}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='产品总价：' prop="Totalproductprice">
              <span>{{view.Totalproductprice}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='增值费：' prop="AddedFee">
              <span>{{view.AddedFee}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='服务费：' prop="UnitPriceSerCharge">
              <span>{{view.UnitPriceSerCharge}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='合计：' prop="Total">
              <span>{{view.Total}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='订单时间：' prop="OrderTime">
              <span>{{view.OrderTime}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='客户编码：' prop="CustomerUserId">
              <span>{{view.CustomerUserId}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label='订单备注：' prop="Remarks">
              <span>{{view.Remarks}}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewModal=false">关 闭</el-button>
      </div>
    </el-dialog>
    <!--查看产品图大图-->
    <el-dialog :title='title2' :visible.sync='imageModal' :close-on-click-modal='false' :before-close="closeImageModal">
      <div class="txtCenter">
        <img :src='orderProductImgUrl' style="max-width: 80%;" />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeImageModal">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'

  import {
    orderList,
    orderStateNum,
    orderState,
    orderTask,
    userList,
    orderTaskBind,
    orderFeeEdit
  } from '@/api/api';
  export default {
    name: 'order',
    data() {
      return {
        title: '',
        currentPage: 1,
        pageSize: 10,
        total: 0,
        disabled: true, //单项禁用
        disabledMore: true, //多项禁用
        disabledEditFee: true, //修改费率禁用
        tableData: [],
        checkBoxData: [], //选中数据
        searchForm: {
          searchWords: '',
          state: 0
        },
        all: 0, //全部
        dqr: 0, //待确认
        dfp: 0, //待分配
        yfp: 0, //已分配
        ywc: 0, //已完成
        yqx: 0, //已取消
        taskModal: false,
        tableData2: [],
        checkBoxData2: [], //选中数据
        disabled2: true, //单项禁用
        disabledMore2: true, //多项禁用
        orderId: '',
        currentPage2: 1,
        pageSize2: 10,
        total2: 0,
        timeModal: false,
        taskTime: '',
        //设置日期控件只可选择今天及以后的时间
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() < Date.now() - 8.64e7;
          }
        },
        userModal: false,
        tableData3: [],
        btnState: true,
        rateData: [], //汇率数据
        editModal: false,
        titleFee: '',
        editForm: {
          fee: '',
          rate: '',
          type: 1 //订单类型(1:见单返，2:评后返)
        },
        viewModal: false,
        view: {},
        imageModal: false,
        orderProductImgUrl: '',
        title2: '', //产品图大图弹窗标题
        Rules: {
          fee: [{
              required: true,
              message: '请输入服务费',
              trigger: 'blur'
            },
            {
              pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
              message: '服务费格式不正确',
              trigger: ['blur']
            }
          ],
          rate: [{
              required: true,
              message: '请输入汇率',
              trigger: 'blur'
            },
            {
              pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
              message: '汇率格式不正确',
              trigger: ['blur']
            }
          ]
        }
      }
    },
    created() {
      this.getAllData()
      this.getOrderStateNum()
    },
    methods: {
      //获取数据
      getAllData() {
        let _this = this
        let params = {
          keyWord: _this.searchForm.searchWords,
          state: _this.searchForm.state,
          pageNum: _this.currentPage,
          pagesize: _this.pageSize
        }
        orderList(params).then(res => {
          _this.tableData = res.list
          _this.total = Number(res.total)
        }).catch((e) => {})
      },

      //获取不同状态的订单数量
      getOrderStateNum() {
        let _this = this
        let params = {
          keyWord: _this.searchForm.searchWords
        }
        orderStateNum(params).then(res => {
          _this.all = Number(res.list[0].TotalCount) //全部
          _this.dqr = Number(res.list[0].OrderStateInOne) //待确认
          _this.dfp = Number(res.list[0].OrderStateInTwo) //待分配
          _this.yfp = Number(res.list[0].OrderStateInThree) //已分配
          _this.ywc = Number(res.list[0].OrderStateInFour) //已完成
          _this.yqx = Number(res.list[0].OrderStateInFive) //已取消
        }).catch((e) => {})
      },

      //查询
      searchData() {
        let _this = this
        _this.currentPage = 1 //页码归1
        _this.getAllData()
        _this.getOrderStateNum()
      },

      //查询某订单状态下的数据
      searchStateData(val) {
        let _this = this
        _this.currentPage = 1 //页码归1
        _this.searchForm.state = val
        _this.getAllData()
      },

      //订单确认/取消
      orderConfirm(index, row, val) {
        let _this = this
        let params = {
          Id: row.Id,
          State: val
        }
        orderState(params).then((res) => {
          _this.getAllData()
          _this.getOrderStateNum()
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
          let state = val[0].OrderState
          if (state == 1) {
            _this.disabledEditFee = false
          } else {
            _this.disabledEditFee = true
          }
          _this.disabled = false
          _this.disabledMore = false
        } else if (checkNum > 1) {
          _this.disabled = true
          _this.disabledMore = false
          _this.disabledEditFee = true
        } else {
          _this.disabled = true
          _this.disabledMore = true
          _this.disabledEditFee = true
        }
      },

      // 重置
      resetSearch() {
        let _this = this
        _this.searchForm.searchWords = ''
        _this.currentPage = 1
        _this.getAllData()
        _this.getOrderStateNum()
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

      //打开分配任务
      taskModalShow(index, row) {
        let _this = this
        _this.title = '订单【' + row.OrderNumber + '】任务列表'
        _this.orderId = row.Id
        _this.getTaskData()
      },

      //如果不是待分配状态则禁用该行复选框
      disabledCheckBox(row, index) {
        let checked = ''
        let state = row.TaskState
        if (state == 1) {
          checked = true
        } else {
          checked = false
        }
        return checked
      },

      //获取订单任务列表
      getTaskData() {
        let _this = this
        let params = {
          Id: _this.orderId,
          pageNum: _this.currentPage2,
          pagesize: _this.pageSize2
        }
        orderTask(params).then(res => {
          _this.tableData2 = res.list
          _this.total2 = Number(res.total)
          _this.taskModal = true //获取数据后显示模态框
        }).catch((e) => {})
      },

      //任务信息弹窗关闭
      closeTaskModal() {
        let _this = this
        _this.taskModal = false
        _this.tableData2 = []
        _this.checkBoxData2 = []
        _this.currentPage2 = 1
        _this.pageSize2 = 10
      },

      //任务信息选中行
      rowClick2(row) {
        let _this = this
        //判断如果该行数据不是待分配状态则不再触发点击行选中事件
        let checked = ''
        let state = row.TaskState
        if (state == 1) {
          let findResult = _this.checkBoxData2.findIndex((value, index) => {
            return value == row
          })
          if (findResult != -1) {
            _this.$refs.table2.toggleRowSelection(row, false);
          } else {
            _this.$refs.table2.toggleRowSelection(row, true);
          }
        }
      },

      // 任务信息是否有选中
      handleSelectionChange2(val) {
        let _this = this
        _this.checkBoxData2 = val
        let checkNum = _this.checkBoxData2.length
        if (checkNum == 1) {
          _this.disabled2 = false
          _this.disabledMore2 = false
        } else if (checkNum > 1) {
          _this.disabled2 = true
          _this.disabledMore2 = false
        } else {
          _this.disabled2 = true
          _this.disabledMore2 = true
        }
      },

      //任务信息翻页
      handleSizeChange2(val) {
        let _this = this
        _this.pageSize2 = val
        _this.getTaskData()
      },
      handleCurrentChange2(val) {
        let _this = this
        _this.currentPage2 = val
        _this.getTaskData()
      },

      //任务执行时间弹窗
      timeModalShow() {
        let _this = this
        _this.timeModal = true
      },

      //关闭任务执行时间弹窗
      closeTimeModal() {
        let _this = this
        _this.timeModal = false
        _this.taskTime = ''
      },

      //打开分配人员弹窗
      userModalShow() {
        let _this = this
        _this.getUserData()
      },

      //获取操作员列表
      getUserData() {
        let _this = this
        let params = {
          name: '',
          pageNum: 1,
          pagesize: 100000000,
        }
        userList(params).then(res => {
          let arr = []
          for (let x in res.list) {
            let roleId = res.list[x].RoolId
            if (roleId == null) {
              roleId = ''
            }
            let state = res.list[x].State
            //如果角色包含4(操作员)并且状态为有效
            if (roleId.indexOf(4) >= 0 && state == 1) {
              arr.push(res.list[x])
            }
          }
          _this.tableData3 = arr
          _this.userModal = true //获取数据后显示模态框
        }).catch((e) => {})
      },

      //人员选中行绑定人员
      rowClick3(val) {
        let _this = this
        _this.$refs.table3.clearSelection()
        _this.$refs.table3.toggleRowSelection(val, true)
        let taskIds = _this.checkBoxData2.map(item => item.Id) //任务表选中的数据
        let userId = val.Id //人员表选中的数据
        let taskNum = _this.checkBoxData2.length //选中的任务数
        _this.$confirm('确认要将选中的 ' + taskNum + ' 条任务分配给【' + val.Name + '】吗？', '信息提示', {
          type: 'warning'
        }).then(() => {
          let params = {
            id: taskIds,
            userId: userId,
            stateTime: _this.taskTime,
            orderId: _this.orderId
          }
          orderTaskBind(params).then((res) => {
            _this.userModal = false
            _this.closeTimeModal()
            _this.getTaskData()
            _this.getAllData()
            _this.getOrderStateNum()
          })
        }).catch(() => {})
      },

      //打开修改服务费和汇率弹窗
      editModalShow() {
        let _this = this
        let orderNum = _this.checkBoxData[0].OrderNumber
        _this.editForm.fee = _this.checkBoxData[0].UnitPriceSerCharge
        _this.editForm.rate = _this.checkBoxData[0].ExchangeRate
        _this.editForm.type = _this.checkBoxData[0].ServiceType
        _this.titleFee = '订单【' + orderNum + '】费率修改'
        _this.editModal = true
      },

      // 修改服务费和汇率
      editSubmit() {
        let _this = this
        _this.$refs.editForm.validate((valid) => {
          if (valid) {
            let params = {
              Id: _this.checkBoxData[0].Id,
              servicecharge: _this.editForm.fee,
              exchangerate: _this.editForm.rate
            }
            orderFeeEdit(params).then(res => {
              _this.closeModal()
              _this.getAllData()
            }).catch((e) => {})
          }
        })
      },

      //关闭服务费汇率修改弹窗
      closeModal() {
        let _this = this
        _this.editModal = false
        _this.$refs['editForm'].resetFields()
        _this.editForm = {
          fee: '',
          rate: ''
        }
      },

      //订单详情
      viewModalShow(index, row) {
        let _this = this
        _this.title = '订单【' + row.OrderNumber + '】详情'
        _this.view = Object.assign({}, row)
        _this.view.ProductPictures = this.GLOBAL.IMG_URL + row.ProductPictures
        _this.viewModal = true //获取到数据后显示模态框
      },

      //查看产品图大图（列表点击图片查看）
      showImage(index, row) {
        let _this = this
        _this.imageModal = true
        _this.title2 = '订单【' + row.OrderNumber + '】产品图'
        _this.orderProductImgUrl = this.GLOBAL.IMG_URL + row.ProductPictures
      },

      //查看产品图大图（详情页点击图片查看）
      showImage2(OrderNumber, imageUrl) {
        let _this = this
        _this.imageModal = true
        _this.title2 = '订单【' + OrderNumber + '】产品图'
        _this.orderProductImgUrl = imageUrl
      },

      closeImageModal() {
        let _this = this
        _this.imageModal = false
        _this.orderProductImgUrl = ''
      },

      // 导出
      exportExcel() {
        var xlsxParam = {
          raw: true
        }
        // 解决生成重复数据-因为使用table fixed属性
        var fix = document.querySelector('.el-table__fixed')
        var wb
        // 判断要导出的节点中是否有fixed的表格，如果有，转换excel时先将该dom移除，然后append回去
        if (fix) {
          wb = XLSX.utils.table_to_book(document.querySelector('#exportTable').removeChild(fix))
          document.querySelector('#exportTable').appendChild(fix)
        } else {
          wb = XLSX.utils.table_to_book(document.querySelector('#exportTable'))
        }
        var wbout = XLSX.write(wb, {
          bookType: 'xlsx',
          bookSST: true,
          type: 'array'
        })
        try {
          FileSaver.saveAs(new Blob([wbout], {
            type: 'application/octet-stream'
          }), '订单管理.xlsx')
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
