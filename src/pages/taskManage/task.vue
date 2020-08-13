<template>
  <div class="container">
    <div class="mb20 fz14">
      <span>任务管理</span>
    </div>
    <div class="mt10">
      <el-collapse-transition>
        <div class="searchBox mb20">
          <el-form ref="searchForm" :model="searchForm" class="form-item" label-width="100px">
            <el-row>
              <el-col :xs="24" :span="7">
                <el-form-item label="搜索内容">
                  <el-input v-model="searchForm.searchWords" placeholder="请输入任务编号/产品ASIN/操作员/客户编码/购买单号" size="small"></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :span="4">
                <el-form-item label="国家">
                  <el-select v-model="searchForm.country" placeholder="请选择国家" size="small">
                    <el-option value="0" label="全部国家"></el-option>
                    <el-option v-for="item in countryData" :key="item.Id" :label="item.CountryName" :value="item.Id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :span="8">
                <el-form-item label="购买时间">
                  <el-date-picker size="small" v-model="searchForm.time" :unlink-panels='true' type="datetimerange"
                    range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :span="5">
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
        <el-button type="primary" size="small" v-if="menuBtnShow" :disabled="disabledEditFee" @click="editModalShow">
          <i class="el-icon-edit-outline"></i> 修改【经销商】服务费和汇率</el-button>
        <el-button type="danger" size="small" v-if="menuBtnShow" :disabled="disabledOut" @click="userModalShow">
          <i class="el-icon-place"></i> 外派</el-button>
        <el-button type="success" size="small" v-if="menuBtnShow" :disabled="disabled" @click="TaskAgainShow">
          <i class="el-icon-circle-plus-outline"></i> 追加任务</el-button>
        <el-button v-if="btnShow && searchForm.state!=0 && searchForm.state!=6 && searchForm.state!=7" type="danger"
          size="small" @click="changeStateMore" :disabled="disabledMore"><i class="el-icon-circle-close"></i> 批量取消</el-button>
        <el-button type="warning" size="small" @click="exportExcel"><i class="el-icon-upload2"></i> 导出</el-button>
        <div class="tagMenu mt20 mb20" style="float: none">
          <el-badge :value="all" type="success" class="item">
            <el-button size="small" @click='searchStateData(0)' :class="{'active':searchForm.state==0}">全部</el-button>
          </el-badge>
          <el-badge :value="dfp" type="info" class="item">
            <el-button size="small" @click='searchStateData(1)' :class="{'active':searchForm.state==1}">待分配</el-button>
          </el-badge>
          <el-badge :value="dgm" type="warning" class="item">
            <el-button size="small" @click='searchStateData(2)' :class="{'active':searchForm.state==2}">待购买</el-button>
          </el-badge>
          <el-badge :value="dqrcd" type="primary" class="item">
            <el-button size="small" @click='searchStateData(3)' :class="{'active':searchForm.state==3}">待确认出单</el-button>
          </el-badge>
          <el-badge :value="dpj" type="warning" class="item">
            <el-button size="small" @click='searchStateData(4)' :class="{'active':searchForm.state==4}">待评价</el-button>
          </el-badge>
          <el-badge :value="dqrpj" type="primary" class="item">
            <el-button size="small" @click='searchStateData(5)' :class="{'active':searchForm.state==5}">待确认评价</el-button>
          </el-badge>
          <el-badge :value="ywc" type="success" class="item">
            <el-button size="small" @click='searchStateData(6)' :class="{'active':searchForm.state==6}">已完成</el-button>
          </el-badge>
          <el-badge :value="yqx" type="danger" class="item">
            <el-button size="small" @click='searchStateData(7)' :class="{'active':searchForm.state==7}">已取消</el-button>
          </el-badge>
          <el-badge :value="error" type="warning">
            <el-button size="small" @click='searchStateData(8)' :class="{'active':searchForm.state==8}">异常</el-button>
          </el-badge>
        </div>
      </div>
      <div class="mt10">
        <el-table border :data="tableData" id="exportTable" style="width: 100%" :header-cell-style="{background:'#fafafa'}"
          @selection-change="handleSelectionChange" @row-click="rowClick" ref="table">
          <el-table-column type="selection" align="center"></el-table-column>
          <el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
          <el-table-column fixed="left" prop="OrderNumbers" label="任务编号" align="center" width="156">
            <template slot-scope="scope">
              <el-link type="primary" :underline="false" @click="viewModalShow(scope.$index,scope.row)">{{scope.row.OrderNumbers}}</el-link>
              <p>
                <span v-if="scope.row.AgainTaskState==1"><span class="danger fz10">追加任务</span></span>
                <span v-if="scope.row.NoComment==1"><span class="danger fz10">免评单</span></span>
              </p>
            </template>
          </el-table-column>
          <el-table-column prop="OrderProductPictures" label="产品图" align="center">
            <template slot-scope="scope">
              <img style="width: 40px;height: 40px;" v-show="scope.row.OrderProductPictures" :src="GLOBAL.IMG_URL+scope.row.OrderProductPictures"
                @click="showImage(scope.$index,scope.row)" />
            </template>
          </el-table-column>
          <el-table-column prop="ServiceType" label="任务类型" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.ServiceType==1">评后返（代返）</span>
              <span v-if="scope.row.ServiceType==2">评后返（自返）</span>
            </template>
          </el-table-column>
          <el-table-column prop="CountryName" label="国家" align="center"></el-table-column>
          <el-table-column prop="Asin" label="ASIN" align="center"></el-table-column>
          <el-table-column prop="ProductName" label="产品名称" align="center" :show-overflow-tooltip='true'></el-table-column>
          <el-table-column prop="OrderAddedFee" label="增值费" align="center"></el-table-column>
          <el-table-column prop="OrderUnitPriceSerCharge" label="服务费" align="center"></el-table-column>
          <el-table-column prop="OrderExchangeRate" label="汇率" align="center"></el-table-column>
          <el-table-column prop="Total" label="总额" align="center">
            <template slot-scope="scope">
              <span class="danger">{{scope.row.Total}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="TaskUnitPriceSerCharge" label="改后服务" align="center"></el-table-column>
          <el-table-column prop="TaskExchangeRate" label="改后汇率" align="center"></el-table-column>
          <el-table-column prop="NewTaskTotal" label="改后总额" align="center">
            <template slot-scope="scope">
              <span class="danger">{{scope.row.NewTaskTotal}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="DifferenceTotal" label="差额" align="center">
            <template slot-scope="scope">
              <span class="danger">{{scope.row.DifferenceTotal}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="CustomerUserId" label="客户编码" align="center"></el-table-column>
          <el-table-column prop="OrderRemarks" label="订单备注" align="center" :show-overflow-tooltip='true'></el-table-column>
          <el-table-column prop="ExecutionTime" label="执行时间" align="center"></el-table-column>
          <el-table-column prop="Name" label="操作员" align="center"></el-table-column>
          <el-table-column prop="Name1" label="外派员" align="center"></el-table-column>
          <el-table-column prop="AmazonNumber" label="购买单号" align="center"></el-table-column>
          <el-table-column prop="BuyTime" label="购买时间" align="center"></el-table-column>
          <el-table-column prop="DealTime" label="返款时间" align="center"></el-table-column>
          <el-table-column prop="Remarks" label="任务备注" align="center" :show-overflow-tooltip='true'></el-table-column>
          <el-table-column prop="TaskState" label="状态" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.TaskState==1">待分配</span>
              <span v-if="scope.row.TaskState==2" class="warning">待购买</span>
              <span v-if="scope.row.TaskState==3" class="primary">待确认出单</span>
              <span v-if="scope.row.TaskState==4" class="warning">待评价</span>
              <span v-if="scope.row.TaskState==5" class="primary">待确认评价</span>
              <span v-if="scope.row.TaskState==6" class="success">已完成</span>
              <span v-if="scope.row.TaskState==7" class="danger">已取消</span>
              <span v-if="scope.row.TaskState==8" class="warning">异常</span>
            </template>
          </el-table-column>
          <el-table-column fixed="right" prop="TaskState" label="操作" align="center" width="140">
            <template slot-scope="scope">
              <el-button size="small" type="primary" v-if="scope.row.TaskState==2 || scope.row.TaskState==8" @click="buyModalShow(scope.$index,scope.row)">购买</el-button>
              <el-button size="small" type="warning" v-if="scope.row.TaskState==4 || scope.row.TaskState==5" @click="commentModalShow(scope.$index,scope.row)">评价</el-button>
              <el-button size="small" type="danger" v-if="btnShow && scope.row.TaskState!=6 && scope.row.TaskState!=7"
                @click="changeState(scope.$index,scope.row)">取消</el-button>
            </template>
          </el-table-column>
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
    <!-- 确认购买 -->
    <el-dialog :title="title" :visible.sync="buyModal" :close-on-click-modal="false" :before-close="closeBuyModal">
      <el-form :model='taskFormView' ref='taskFormView' label-width='120px'>
        <p class="info-title">任务信息</p>
        <el-row>
          <el-col :span="12">
            <el-form-item label='任务编号：' prop="OrderNumbers">
              <span>{{taskFormView.OrderNumbers}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='任务类型：' prop="ServiceType">
              <span v-show="taskFormView.ServiceType==1">评后返（代返）</span>
              <span v-show="taskFormView.ServiceType==2">评后返（自返）</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='国家：' prop="CountryName">
              <span>{{taskFormView.CountryName}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='产品价格：' prop="ProductPrice">
              <span>{{symbol}}</span><span>{{taskFormView.ProductPrice}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label='产品ASIN：' prop="Asin">
              <span>{{taskFormView.Asin}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label='产品名称：' prop="ProductName">
              <span>{{taskFormView.ProductName}}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-form :model='buyForm' ref='buyForm' :rules='Rules' label-width='120px' status-icon>
        <p class="info-title">购买信息</p>
        <el-form-item label='返款账号' prop="PayAccount">
          <el-input v-model='buyForm.PayAccount'></el-input>
        </el-form-item>
        <el-form-item label='购买时间' prop="BuyingTime">
          <el-date-picker v-model="buyForm.BuyingTime" type="datetime" style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-form-item label='购买单号' prop="AmazonNumber">
          <el-input v-model='buyForm.AmazonNumber'></el-input>
        </el-form-item>
        <el-form-item label='购买截图' prop="image">
          <el-upload class="avatar-uploader" name="Image" action="/api/Payment/GetProductPictures" :show-file-list="false"
            :on-success="handleAvatarSuccessBuy" :on-error="handleError" :before-upload="beforeAvatarUpload" accept="image/jpeg,image/png,image/gif,image/bmp">
            <img v-if="imageUrl" :src="imageUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <el-input v-show="false" v-model='buyForm.Image'></el-input>
        </el-form-item>
        <el-form-item label='购买备注' prop="Remarks">
          <el-input type="textarea" v-model="buyForm.BuyRemarks" rows="5"></el-input>
        </el-form-item>
        <div v-if="taskFormView.ServiceType==1">
          <el-form-item label='产品金额' prop="AmazonProductPrice">
            <el-input v-model='buyForm.AmazonProductPrice'>
              <template slot="prepend">{{symbol}}</template>
            </el-input>
          </el-form-item>
          <el-form-item label='运费' prop="Freight">
            <el-input v-model='buyForm.Freight'>
              <template slot="prepend">{{symbol}}</template>
            </el-input>
          </el-form-item>
          <el-form-item label='税费' prop="Taxation">
            <el-input v-model='buyForm.Taxation'>
              <template slot="prepend">{{symbol}}</template>
            </el-input>
          </el-form-item>
          <el-form-item label='其他' prop="Other">
            <el-input v-model='buyForm.Other'>
              <template slot="prepend">{{symbol}}</template>
            </el-input>
          </el-form-item>
          <el-form-item label='官方手续费率'>
            <el-input v-model='handFee' :disabled="true">
              <template slot="prepend">{{symbol}}</template>
            </el-input>
          </el-form-item>
          <el-form-item label='固定手续费用'>
            <el-input v-model='handMoney' :disabled="true">
              <template slot="prepend">{{symbol}}</template>
            </el-input>
          </el-form-item>
          <el-form-item label='汇率'>
            <el-input v-model='rate' :disabled="true">
              <template slot="prepend">{{symbol}}</template>
            </el-input>
          </el-form-item>
          <el-form-item label='总额' class="disabled-font-color">
            <el-input v-model='totalValue' :disabled="true">
              <template slot="prepend" class="danger">￥</template>
            </el-input>
          </el-form-item>
        </div>
        <el-form-item label='增值费' class="disabled-font-color">
          <el-input v-model='addFee' :disabled="true">
            <template slot="prepend" class="danger">￥</template>
          </el-input>
        </el-form-item>
        <el-form-item label='服务费' class="disabled-font-color">
          <el-input v-model='serviceFei' :disabled="true">
            <template slot="prepend" class="danger">￥</template>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="buySubmit">确 定</el-button>
        <el-button @click="closeBuyModal">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 评价 -->
    <el-dialog :title="title" :visible.sync="commentModal" :close-on-click-modal="false" :before-close="closeCommentModal">
      <el-form :model='taskFormView' ref='taskFormView' label-width='120px'>
        <p class="info-title">任务信息</p>
        <el-row>
          <el-col :span="12">
            <el-form-item label='任务编号：' prop="OrderNumbers">
              <span>{{taskFormView.OrderNumbers}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='任务类型：' prop="ServiceType">
              <span v-show="taskFormView.ServiceType==1">评后返（代返）</span>
              <span v-show="taskFormView.ServiceType==2">评后返（自返）</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='国家：' prop="CountryName">
              <span>{{taskFormView.CountryName}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='产品价格：' prop="ProductPrice">
              <span>{{symbol}}</span><span>{{taskFormView.ProductPrice}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label='产品ASIN：' prop="Asin">
              <span>{{taskFormView.Asin}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label='产品名称：' prop="ProductName">
              <span>{{taskFormView.ProductName}}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-form :model='commentForm' ref='commentForm' label-width='120px' status-icon>
        <p class="info-title">评价信息</p>
        <el-form-item label='返款账号' prop="PPaccount">
          <el-input v-model='commentForm.PPaccount'></el-input>
        </el-form-item>
        <el-form-item label='评价链接' prop="Link">
          <el-input v-model='commentForm.Link'></el-input>
        </el-form-item>
        <el-form-item label='评价截图' prop="image">
          <el-upload class="avatar-uploader" name="Image" action="/api/Payment/GetProductPictures" :show-file-list="false"
            :on-success="handleAvatarSuccess" :on-error="handleError" :before-upload="beforeAvatarUpload" accept="image/jpeg,image/png,image/gif,image/bmp">
            <img v-if="imageUrl" :src="imageUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <el-input v-show="false" v-model='commentForm.Image'></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="commentSubmit(1)" style="position: absolute;left: 15px">免 评</el-button>
        <el-button type="primary" @click="commentSubmit(0)">确 定</el-button>
        <el-button @click="closeCommentModal">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 任务查看 -->
    <el-dialog width="70%" :title="title" :visible.sync="viewModal" :close-on-click-modal="false">
      <el-form :model='view' ref='view' label-width='150px'>
        <p class="info-title">任务信息</p>
        <el-row>
          <el-col :span="12">
            <el-form-item label='产品图：' prop="OrderProductPictures">
              <img style="width: 100px" class="pointer" @click="showImage2(view.OrderNumbers,view.OrderProductPictures)"
                v-show="view.OrderProductPictures" :src="view.OrderProductPictures" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='产品链接：' prop="OrderProductLink">
              <el-link :href="view.OrderProductLink" target="_blank" type="primary" :underline="false">{{view.OrderProductLink}}</el-link>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label='任务编号：' prop="OrderNumbers">
              <span>{{view.OrderNumbers}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='任务状态：' prop="TaskState">
              <span v-if="view.TaskState==1">待分配</span>
              <span v-if="view.TaskState==2" class="warning">待购买</span>
              <span v-if="view.TaskState==3" class="primary">待确认出单</span>
              <span v-if="view.TaskState==4" class="warning">待评价</span>
              <span v-if="view.TaskState==5" class="primary">待确认评价</span>
              <span v-if="view.TaskState==6" class="success">已完成</span>
              <span v-if="view.TaskState==7" class="danger">已取消</span>
              <span v-if="view.TaskState==8" class="warning">异常</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='任务类型：' prop="ServiceType">
              <span v-if="view.ServiceType==1">评后返（代返）</span>
              <span v-if="view.ServiceType==2">评后返（自返）</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='国家：' prop="CountryName">
              <span>{{view.CountryName}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label='产品名称：' prop="ProductName">
              <span>{{view.ProductName}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='产品评分：' prop="OrderProductScore">
              <span>{{view.OrderProductScore}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='店铺名：' prop="OrderShopName">
              <span>{{view.OrderShopName}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='产品ASIN：' prop="Asin">
              <span>{{view.Asin}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='产品价格：' prop="ProductPrice">
              <span>{{symbol}}</span><span>{{view.ProductPrice}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='关键词类型：' prop="OrderKeyWordType">
              <span v-if="view.OrderKeyWordType==1">产品关键词</span>
              <span v-if="view.OrderKeyWordType==2">CPC关键词</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='关键词：' prop="KeyWord">
              <span>{{view.KeyWord}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='订单开始时间：' prop="OrderStartTime">
              <span>{{view.OrderStartTime}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='客户编码：' prop="CustomerUserId">
              <span>{{view.CustomerUserId}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label='订单备注：' prop="OrderRemarks">
              <span>{{view.OrderRemarks}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label='任务备注：' prop="Remarks">
              <span>{{view.Remarks}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='任务执行时间：' prop="ExecutionTime">
              <span>{{view.ExecutionTime}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='操作员：' prop="Name">
              <span>{{view.Name}}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <p class="info-title">购买信息</p>
        <el-row>
          <el-col :span="12">
            <el-form-item label='购买时间：' prop="BuyTime">
              <span>{{view.BuyTime}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='购买单号：' prop="AmazonNumber">
              <span>{{view.AmazonNumber}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label='购买备注：' prop="BuyRemarks">
              <span>{{view.BuyRemarks}}</span>
            </el-form-item>
          </el-col>
          <div v-show="view.ServiceType==1">
            <el-col :span="12">
              <el-form-item label='产品金额：' prop="AmazonProductPrice">
                <span v-show="view.AmazonProductPrice">{{symbol}}</span><span>{{view.AmazonProductPrice}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label='运费：' prop="Freight">
                <span v-show="view.Freight">{{symbol}}</span><span>{{view.Freight}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label='税费：' prop="Taxation">
                <span v-show="view.Taxation">{{symbol}}</span><span>{{view.Taxation}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label='其他：' prop="Other">
                <span v-show="view.Other">{{symbol}}</span><span>{{view.Other}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label='总额：' prop="Total">
                <span v-show="view.Total">￥</span><span>{{view.Total}}</span>
              </el-form-item>
            </el-col>
          </div>
          <el-col :span="12">
            <el-form-item label='汇率：' prop="OrderExchangeRate">
              <span>{{view.OrderExchangeRate}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label='服务费：' prop="OrderUnitPriceSerCharge">
              <span>￥</span> <span>{{view.OrderUnitPriceSerCharge}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label='购买截图：' prop="BuyImage">
              <img style="max-width: 80%;" v-show="view.BuyImage" :src="view.BuyImage" />
            </el-form-item>
          </el-col>
        </el-row>
        <p class="info-title">评价信息</p>
        <el-row>
          <el-col :span="24">
            <el-form-item label='返款账号：' prop="PayAccount">
              <span>{{view.PayAccount}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label='评价链接：' prop="ProductLink">
              <span>{{view.ProductLink}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label='评价截图：' prop="ProductImage">
              <img style="max-width: 80%;" v-show="view.ProductImage" :src="view.ProductImage" />
            </el-form-item>
          </el-col>
        </el-row>
        <div v-show="view.ServiceType==2">
          <p class="info-title">交易信息</p>
          <el-row>
            <el-col :span="24">
              <el-form-item label='返款时间：' prop="DealTime">
                <span>{{view.DealTime}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label='交易截图：' prop="DealIamge">
                <img style="max-width: 80%;" v-show="view.DealIamge" :src="view.DealIamge" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewModal=false">关 闭</el-button>
      </div>
    </el-dialog>
    <!--查看产品图大图-->
    <el-dialog :title='title2' :visible.sync='imageModal' :close-on-click-modal='false' :before-close="closeImageModal">
      <div class="txtCenter">
        <img :src='taskProductImgUrl' style="max-width: 80%;" />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeImageModal">关 闭</el-button>
      </div>
    </el-dialog>
    <!--服务费和汇率修改-->
    <el-dialog :title="titleFee" width="30%" :visible.sync="editModal" :close-on-click-modal="false" :before-close="closeModal">
      <el-form :model="editForm" ref="editForm" :rules='RulesFee' label-width='100px' status-icon>
        <el-form-item label="服务费" prop="fee">
          <el-input v-model="editForm.fee"></el-input>
        </el-form-item>
        <el-form-item label="汇率" prop="rate">
          <el-input v-model="editForm.rate"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editSubmit">确 定</el-button>
        <el-button @click="closeModal">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 外派(任务分配给外派员) -->
    <el-dialog :title="userListTitle" width="40%" :visible.sync="userModal" :close-on-click-modal="false">
      <el-table border :data="tableData2" id="exportTable2" style="width: 100%" :header-cell-style="{background:'#fafafa'}"
        @row-click="rowClick2" ref="table2">
        <el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
        <el-table-column prop="Id" label="编码" align="center"></el-table-column>
        <el-table-column prop="Name" label="姓名" align="center"></el-table-column>
        <el-table-column prop="LoginName" label="账号" align="center"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="userModal=false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'

  import table2excel from 'js-table2excel'

  import {
    taskList,
    taskStateNum,
    rateList,
    taskBuy,
    taskState,
    taskStateMore,
    taskComment,
    taskView,
    taskFeeEdit,
    userList,
    orderTaskBind,
    taskBindOut,
    taskAgain,
    countryList
  } from '@/api/api';
  export default {
    name: 'task',
    data() {
      return {
        title: '',
        currentPage: 1,
        pageSize: 10,
        total: 0,
        disabled: true, //单项禁用
        disabledMore: true, //多项禁用
        disabledEditFee: true, //修改费率禁用
        disabledOut: true, //外派禁用
        tableData: [],
        checkBoxData: [], //选中数据
        menuBtnShow: false, //是否显示列表上方菜单按钮
        searchForm: {
          searchWords: '',
          state: 0,
          country: '0',
          time: []
        },
        all: 0, //全部
        dfp: 0, //待分配
        dgm: 0, //待购买
        dqrcd: 0, //待确认出单
        dpj: 0, //待评价
        dqrpj: 0, //待确认评价
        ywc: 0, //已完成
        yqx: 0, //已取消
        error: 0, //异常
        buyModal: false, //购买弹窗
        taskFormView: {
          OrderNumbers: '',
          ServiceType: '',
          CountryName: '',
          Asin: '',
          ProductName: '',
          ProductPrice: ''
        },
        buyForm: {
          PayAccount: '',
          BuyingTime: '',
          AmazonNumber: '',
          AmazonProductPrice: '',
          Freight: '',
          Taxation: '',
          Other: '',
          Total: '',
          Image: '',
          BuyRemarks: ''
        },
        //设置日期控件只可选择今天及以后的时间
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() < Date.now() - 8.64e7;
          }
        },
        taskId: '', //选中的任务id
        rateData: [], //汇率数据
        symbol: '', //货币符号
        rate: '', //货币汇率
        addFee: '', //增值费
        serviceFei: '', //服务费
        handFee: '', //官方手续费率
        handMoney: '', //官方固定费率
        btnShow: false, //判断是否显示取消按钮
        Rules: {
          BuyingTime: [{
            required: true,
            message: '请输入购买时间',
            trigger: 'blur'
          }],
          AmazonNumber: [{
            required: true,
            message: '请输入购买单号',
            trigger: 'blur'
          }],
          AmazonProductPrice: [{
              required: true,
              message: '请输入产品金额',
              trigger: 'blur'
            },
            {
              pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
              message: '金额格式不正确',
              trigger: ['blur']
            }
          ],
          Freight: [{
            pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
            message: '金额格式不正确',
            trigger: ['blur']
          }],
          Taxation: [{
            pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
            message: '金额格式不正确',
            trigger: ['blur']
          }],
          Other: [{
            pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
            message: '金额格式不正确',
            trigger: ['blur']
          }],
        },
        commentModal: false,
        imageUrl: '',
        commentForm: {
          Link: '',
          Image: '',
          PPaccount: ''
        },
        viewModal: false,
        view: {},
        imageModal: false,
        taskProductImgUrl: '',
        title2: '', //产品图大图弹窗标题
        editModal: false,
        titleFee: '',
        editForm: {
          fee: '',
          rate: ''
        },
        RulesFee: {
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
        },
        userListTitle: '',
        userModal: false,
        tableData2: [],
        countryData: [], //国家数据
      }
    },
    created() {
      this.getAllData()
      this.getTaskStateNum()
      this.getRateData()
      this.getCountryData()
    },
    computed: {
      //合计
      totalValue: function() {
        let all = (Number(this.buyForm.AmazonProductPrice) + Number(this.buyForm.Freight) + Number(this.buyForm.Taxation) +
          Number(this.buyForm.Other)) * (1 + Number(this.handFee)) + Number(this.handMoney)
        return (all * Number(this.rate)).toFixed(2)
      }
    },
    methods: {
      //获取国家数据
      getCountryData() {
        let _this = this
        let params = {
          country: '',
          pageNum: 1,
          pagesize: 100000000
        }
        countryList(params).then(res => {
          _this.countryData = res.list
        }).catch((e) => {})
      },

      //获取数据
      getAllData() {
        let _this = this

        // 根据角色判断任务列表能看到哪些数据
        let show = ''
        let roleId = sessionStorage.getItem('roleId').trim()
        let x = roleId.indexOf(1) //管理员
        let y = roleId.indexOf(2) //业务员
        let z = roleId.indexOf(4) //操作员
        let w = roleId.indexOf(5) //外派员
        if (x >= 0 || y >= 0) {
          show = 'Michale_009'
        } else if (z >= 0 || w >= 0) {
          show = 'Thomers_120146'
        } else {
          show = 'No'
        }
        //判断如果有管理员权限则显示取消按钮
        if (x >= 0) {
          _this.btnShow = true
        }
        //判断如不是外派员则显示列表上方操作按钮
        if (w < 0) {
          _this.menuBtnShow = true
        }
        let userId = sessionStorage.getItem('userId')
        let time = _this.searchForm.time
        let time1 = ''
        let time2 = ''
        if (time != '' && time != null) {
          time1 = time[0]
          time2 = time[1]
        }
        let params = {
          id: userId,
          key: show,
          keyWord: _this.searchForm.searchWords,
          State: _this.searchForm.state,
          countryId: _this.searchForm.country,
          startTime: time1,
          endTime: time2,
          pageNum: _this.currentPage,
          pagesize: _this.pageSize,
          RoolId: roleId
        }
        taskList(params).then(res => {
          _this.tableData = res.list
          _this.total = Number(res.total)
        }).catch((e) => {})
      },

      //获取不同状态的订单数量
      getTaskStateNum() {
        let _this = this
        // 根据角色判断任务列表能看到哪些数据
        let show = ''
        let roleId = sessionStorage.getItem('roleId').trim()
        let x = roleId.indexOf(1) //管理员
        let y = roleId.indexOf(2) //业务员
        let z = roleId.indexOf(4) //操作员
        let w = roleId.indexOf(5) //外派员
        if (x >= 0 || y >= 0) {
          show = 'Michale_009'
        } else if (z >= 0 || w >= 0) {
          show = 'Thomers_120146'
        } else {
          show = 'No'
        }
        let userId = sessionStorage.getItem('userId')
        let time = _this.searchForm.time
        let time1 = ''
        let time2 = ''
        if (time != '' && time != null) {
          time1 = time[0]
          time2 = time[1]
        }
        let params = {
          Id: userId,
          Key: show,
          keyWord: _this.searchForm.searchWords,
          countryId: _this.searchForm.country,
          startTime: time1,
          endTime: time2,
          RoolId: roleId
        }
        taskStateNum(params).then(res => {
          _this.all = Number(res.list[0].TotalCount) //全部
          _this.dfp = Number(res.list[0].OrderStateInOne) //待分配
          _this.dgm = Number(res.list[0].OrderStateInTwo) //待购买
          _this.dqrcd = Number(res.list[0].OrderStateInThree) //待确认出单
          _this.dpj = Number(res.list[0].OrderStateInFour) //待评价
          _this.dqrpj = Number(res.list[0].OrderStateInFive) //待确认评价
          _this.ywc = Number(res.list[0].OrderStateInSix) //已完成
          _this.yqx = Number(res.list[0].OrderStateInSeven) //已取消
          _this.error = Number(res.list[0].OrderStateInEight) //异常
        }).catch((e) => {})
      },

      //查询
      searchData() {
        let _this = this
        _this.currentPage = 1 //页码归1
        _this.getAllData()
        _this.getTaskStateNum()
      },

      //查询某订单状态下的数据
      searchStateData(val) {
        let _this = this
        _this.currentPage = 1 //页码归1
        _this.searchForm.state = val
        _this.getAllData()
      },

      //任务取消
      changeState(index, row) {
        let _this = this
        _this.$confirm('确认取消任务【' + row.OrderNumbers + '】吗？', '信息提示', {
          type: 'warning'
        }).then(() => {
          let params = {
            Id: row.Id
          }
          taskState(params).then((res) => {
            _this.getAllData()
            _this.getTaskStateNum()
          })
        }).catch(() => {})
      },

      //批量任务取消
      changeStateMore() {
        let _this = this
        let ids = _this.checkBoxData.map(item => item.Id) //选中的数据
        let num = _this.checkBoxData.length //选中的数量
        _this.$confirm('确认取消选中的【' + num + '】条任务吗？', '信息提示', {
          type: 'warning'
        }).then(() => {
          let params = {
            Id: ids
          }
          taskStateMore(params).then((res) => {
            _this.getAllData()
            _this.getTaskStateNum()
          })
        }).catch(() => {})
      },

      // 获取汇率数据
      getRateData() {
        let _this = this
        let params = {
          CurrencyName: '',
          pageNum: 1,
          pagesize: 100000000,
        }
        rateList(params).then(res => {
          _this.rateData = res.list
        }).catch((e) => {})
      },

      //传入国家id获取货币信息
      getRateInfo(countryId) {
        let _this = this
        for (let x in _this.rateData) {
          if (Number(_this.rateData[x].cId) == Number(countryId)) {
            _this.symbol = _this.rateData[x].RcurrencySymbol //货币符号
            _this.handFee = _this.rateData[x].handFee //官方手续费率
            _this.handMoney = _this.rateData[x].handMoney //官方固定费用
          }
        }
      },

      // 购买弹窗
      buyModalShow(index, row) {
        let _this = this
        _this.title = '填写购买信息'
        _this.buyModal = true
        _this.taskFormView.OrderNumbers = row.OrderNumbers
        _this.taskFormView.ServiceType = row.ServiceType
        _this.taskFormView.CountryName = row.CountryName
        _this.taskFormView.Asin = row.Asin
        _this.taskFormView.ProductName = row.ProductName
        _this.taskFormView.ProductPrice = row.ProductPrice
        _this.addFee = row.OrderAddedFee //增值费
        _this.serviceFei = row.OrderUnitPriceSerCharge //服务费
        _this.rate = row.OrderExchangeRate //汇率
        _this.taskId = row.Id
        _this.getRateInfo(row.CountryId)
      },

      // 购买
      buySubmit() {
        let _this = this
        let userId = sessionStorage.getItem('userId')
        let ServiceType = _this.taskFormView.ServiceType
        let params = {}
        _this.$refs.buyForm.validate((valid) => {
          if (valid) {
            if (ServiceType == 1) {
              params = Object.assign({}, this.buyForm)
              if (params.Freight == '') {
                params.Freight = 0
              }
              if (params.Taxation == '') {
                params.Taxation = 0
              }
              if (params.Other == '') {
                params.Other = 0
              }
              params.Type = ServiceType
              params.TaskId = _this.taskId
              params.Id = userId
            } else {
              params = {
                PayAccount: _this.buyForm.PayAccount,
                BuyingTime: _this.buyForm.BuyingTime,
                AmazonNumber: _this.buyForm.AmazonNumber,
                Type: ServiceType,
                TaskId: _this.taskId,
                Id: userId,
                Image: _this.buyForm.Image,
                BuyRemarks: _this.buyForm.BuyRemarks
              }
            }
            //核算总金额(总额+增值服+服务费)
            params.Total = (Number(_this.totalValue) + Number(_this.addFee) + Number(_this.serviceFei)).toFixed(2)
            taskBuy(params).then(res => {
              _this.closeBuyModal()
              _this.getAllData()
              _this.getTaskStateNum()
            }).catch((e) => {})
          }
        })
      },

      // 关闭购买弹窗
      closeBuyModal() {
        let _this = this
        _this.buyModal = false
        _this.$refs['buyForm'].resetFields()
        _this.buyForm = {
          PayAccount: '',
          BuyingTime: '',
          AmazonNumber: '',
          AmazonProductPrice: '',
          Freight: '',
          Taxation: '',
          Other: '',
          Total: '',
          Image: '',
          BuyRemarks: ''
        }
        _this.imageUrl = ''

      },

      // 评价弹窗
      commentModalShow(index, row) {
        let _this = this
        _this.title = '填写评价信息'
        _this.commentModal = true
        _this.taskFormView.OrderNumbers = row.OrderNumbers
        _this.taskFormView.ServiceType = row.ServiceType
        _this.taskFormView.CountryName = row.CountryName
        _this.taskFormView.Asin = row.Asin
        _this.taskFormView.ProductName = row.ProductName
        _this.taskFormView.ProductPrice = row.ProductPrice
        _this.taskId = row.Id
        _this.commentForm.Link = row.ProductLink
        _this.commentForm.Image = row.ProductImage
        _this.imageUrl = row.ProductImage
        _this.commentForm.PPaccount = row.PayAccount
        _this.getRateInfo(row.CountryId)
      },

      // 评价
      commentSubmit(val) {
        let _this = this
        let userId = sessionStorage.getItem('userId')
        let link = _this.commentForm.Link
        let image = _this.commentForm.Image
        let PPaccount = _this.commentForm.PPaccount
        let params = {
          Id: _this.taskId,
          BackUserId: userId,
          Link: link,
          Image: image,
          PayAccount: PPaccount,
          NoComment: val
        }
        _this.$refs.commentForm.validate((valid) => {
          if (valid) {
            // 如果是需要评论的单,评价链接和评论图片必须二选一填写;如果是免评单不要填写评价链接,评论图片可填可不填.(1为免评)
            if (val != 1) {
              if (link == '' && image == '') {
                this.$message.error('评价链接和评价截图必须至少填写一项！')
              } else {
                taskComment(params).then(res => {
                  _this.closeCommentModal()
                  _this.getAllData()
                  _this.getTaskStateNum()
                }).catch((e) => {})
              }
            } else {
              if (link != '') {
                this.$message.error('免评单请不要填写评价链接！')
              } else {
                taskComment(params).then(res => {
                  _this.closeCommentModal()
                  _this.getAllData()
                  _this.getTaskStateNum()
                }).catch((e) => {})
              }
            }
          }
        })
      },

      // 图片上传

      //购买图片上传成功
      handleAvatarSuccessBuy(res, file) {
        if (res.Data != '') {
          this.buyForm.Image = res.Data
        }
        this.imageUrl = URL.createObjectURL(file.raw);
        this.$message.success('图片上传成功！')
      },

      //评论图片上传成功
      handleAvatarSuccess(res, file) {
        if (res.Data != '') {
          this.commentForm.Image = res.Data
        }
        this.imageUrl = URL.createObjectURL(file.raw);
        this.$message.success('图片上传成功！')
      },

      handleError(res) {
        this.$message.error('图片上传失败！')
      },
      beforeAvatarUpload(file) {
        const isJPG = file.type === 'image/jpeg';
        const isPNG = file.type === 'image/png';
        const isGIF = file.type === 'image/gif';
        const isBMP = file.type === 'image/bmp';
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isJPG && !isPNG && !isGIF && !isBMP) {
          this.$message.error('上传图片必须是JPG/PNG/GIF/BMP 格式!');
        } else if (!isLt5M) {
          this.$message.error('上传图片大小不能超过 5MB!');
        }
        return (isJPG || isPNG || isGIF || isBMP) && isLt5M;
      },

      // 关闭评价弹窗
      closeCommentModal() {
        let _this = this
        _this.commentModal = false
        _this.$refs['commentForm'].resetFields()
        _this.commentForm = {
          Link: '',
          Image: '',
          PPaccount: ''
        }
        _this.imageUrl = ''
      },

      //任务详情弹窗
      viewModalShow(index, row) {
        let _this = this
        _this.title = '任务【' + row.OrderNumbers + '】详情'
        _this.taskId = row.Id
        _this.taskView()
      },

      //任务详情
      taskView() {
        let _this = this
        let params = {
          Id: _this.taskId
        }
        taskView(params).then(res => {
          _this.view = Object.assign({}, res.list[0])
          let img = res.list[0].OrderProductPictures
          if (img) {
            _this.view.OrderProductPictures = this.GLOBAL.IMG_URL + img
          }
          let img2 = res.list[0].DealIamge
          if (img2) {
            _this.view.DealIamge = this.GLOBAL.IMG_URL + img2
          }
          let countryId = res.list[0].CountryId
          _this.viewModal = true //获取到数据后显示模态框
          _this.getRateInfo(countryId)
        }).catch((e) => {})
      },

      //查看产品图大图（列表点击图片查看）
      showImage(index, row) {
        let _this = this
        _this.imageModal = true
        _this.title2 = '任务【' + row.OrderNumbers + '】产品图'
        _this.taskProductImgUrl = this.GLOBAL.IMG_URL + row.OrderProductPictures
      },

      //查看产品图大图（详情页点击图片查看）
      showImage2(OrderNumbers, imageUrl) {
        let _this = this
        _this.imageModal = true
        _this.title2 = '任务【' + OrderNumbers + '】产品图'
        _this.taskProductImgUrl = imageUrl
      },

      closeImageModal() {
        let _this = this
        _this.imageModal = false
        _this.taskProductImgUrl = ''
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
        //任务状态
        let state = val.map(item => item.TaskState)
        let dis = false
        for (let x in state) {
          //如果状态不是待购买
          if (state[x] != 2) {
            dis = true
          }
        }
        if (checkNum > 0) {
          if (dis == false) {
            _this.disabledEditFee = false
            _this.disabledOut = false
          } else {
            _this.disabledEditFee = true
            _this.disabledOut = true
          }
        } else {
          _this.disabledEditFee = true
          _this.disabledOut = true
        }
      },

      // 重置
      resetSearch() {
        let _this = this
        _this.searchForm.searchWords = ''
        _this.searchForm.country = '0'
        _this.searchForm.time = []
        _this.currentPage = 1
        _this.getAllData()
        _this.getTaskStateNum()
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

      //打开修改服务费和汇率弹窗
      editModalShow() {
        let _this = this
        let count = _this.checkBoxData.length
        _this.titleFee = '服务费和汇率修改 当前选中【' + count + '】条任务'
        _this.editModal = true
      },

      // 修改服务费和汇率
      editSubmit() {
        let _this = this
        _this.$refs.editForm.validate((valid) => {
          if (valid) {
            let params = {
              tid: _this.checkBoxData.map(item => item.Id),
              servicecharge: _this.editForm.fee,
              exchangerate: _this.editForm.rate
            }
            taskFeeEdit(params).then(res => {
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

      //打开分配人员弹窗
      userModalShow() {
        let _this = this
        _this.userListTitle = '外派员列表'
        _this.getUserData()
      },

      //获取外派员列表
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
            //如果角色包含5(外派员)并且状态为有效
            if (roleId.indexOf(5) >= 0 && state == 1) {
              arr.push(res.list[x])
            }
          }
          _this.tableData2 = arr
          _this.userModal = true //获取数据后显示模态框
        }).catch((e) => {})
      },

      //人员选中行绑定外派员
      rowClick2(val) {
        let _this = this
        _this.$refs.table2.clearSelection()
        _this.$refs.table2.toggleRowSelection(val, true)
        let taskIds = _this.checkBoxData.map(item => item.Id) //任务表选中的数据
        let userId = val.Id //人员表选中的数据
        let taskNum = _this.checkBoxData.length //选中的任务数
        _this.$confirm('确认要将选中的 ' + taskNum + ' 条任务外派给【' + val.Name + '】吗？', '信息提示', {
          type: 'warning'
        }).then(() => {
          let params = {
            Tid: taskIds,
            userId: userId
          }
          taskBindOut(params).then((res) => {
            _this.userModal = false
            _this.getAllData()
            _this.getTaskStateNum()
          })
        }).catch(() => {})
      },

      //追加任务弹窗
      TaskAgainShow() {
        let _this = this
        _this.$prompt('请输入要追加的任务数', '信息提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[1-9]\d*$/,
          inputErrorMessage: '任务数必须为正整数'
        }).then(({
          value
        }) => {
          _this.taskAgainAdd(value)
        }).catch(() => {})
      },

      //追加任务
      taskAgainAdd(val) {
        let _this = this
        let params = {
          TaskId: _this.checkBoxData[0].Id,
          Number: val,
          OrderId: _this.checkBoxData[0].OrderId
        }
        taskAgain(params).then(res => {
          _this.getAllData()
        }).catch((e) => {})
      },

      //导出
      exportExcel() {
        const column = [{
            title: '任务编号',
            key: 'OrderNumbers',
            type: 'text'
          },
          {
            title: '产品图',
            key: 'ExpProductImg',
            type: 'image',
            width: 100,
            height: 100
          },
          {
            title: '任务类型',
            key: 'ExpServiceType',
            type: 'text'
          },
          {
            title: '国家',
            key: 'CountryName',
            type: 'text'
          },
          {
            title: 'ASIN',
            key: 'Asin',
            type: 'text'
          },
          {
            title: '产品名称',
            key: 'ProductName',
            type: 'text'
          },
          {
            title: '增值费',
            key: 'OrderAddedFee',
            type: 'text'
          },
          {
            title: '服务费',
            key: 'OrderUnitPriceSerCharge',
            type: 'text'
          },
          {
            title: '汇率',
            key: 'OrderExchangeRate',
            type: 'text'
          },
          {
            title: '总额',
            key: 'Total',
            type: 'text'
          },
          {
            title: '改后服务费',
            key: 'TaskUnitPriceSerCharge',
            type: 'text'
          },
          {
            title: '改后汇率',
            key: 'TaskExchangeRate',
            type: 'text'
          },
          {
            title: '改后总额',
            key: 'NewTaskTotal',
            type: 'text'
          },
          {
            title: '差额',
            key: 'DifferenceTotal',
            type: 'text'
          },
          {
            title: '客户编码',
            key: 'CustomerUserId',
            type: 'text'
          },
          {
            title: '订单备注',
            key: 'OrderRemarks',
            type: 'text'
          },
          {
            title: '执行时间',
            key: 'ExecutionTime',
            type: 'text'
          },
          {
            title: '操作员',
            key: 'Name',
            type: 'text'
          },
          {
            title: '外派员',
            key: 'Name1',
            type: 'text'
          },
          {
            title: '购买单号',
            key: 'AmazonNumber',
            type: 'text'
          },
          {
            title: '购买时间',
            key: 'BuyTime',
            type: 'text'
          },
          {
            title: '返款时间',
            key: 'DealTime',
            type: 'text'
          },
          {
            title: '任务备注',
            key: 'Remarks',
            type: 'text'
          },
          {
            title: '状态',
            key: 'ExpTaskState',
            type: 'text'
          },
        ]

        // 1.title为列名
        // 2.key为data数据每个对象对应的key
        // 3.若为图片格式, 需要加type为image的说明,并且可以设置图片的宽高
        const data = this.tableData
        // data数据一些特殊处理
        for (const t in data) {
          data[t].ExpProductImg = this.GLOBAL.IMG_URL + data[t].OrderProductPictures

          let TxtServiceType = ''
          if (data[t].ServiceType == 1) {
            TxtServiceType = '评后返（代返）'
          }
          if (data[t].ServiceType == 2) {
            TxtServiceType = '评后返（自返）'
          }
          data[t].ExpServiceType = TxtServiceType

          let TxtTaskState = ''
          if (data[t].TaskState == 1) {
            TxtTaskState = '待分配'
          }
          if (data[t].TaskState == 2) {
            TxtTaskState = '待购买'
          }
          if (data[t].TaskState == 3) {
            TxtTaskState = '待确认出单'
          }
          if (data[t].TaskState == 4) {
            TxtTaskState = '待评价'
          }
          if (data[t].TaskState == 5) {
            TxtTaskState = '待确认评价'
          }
          if (data[t].TaskState == 6) {
            TxtTaskState = '已完成'
          }
          if (data[t].TaskState == 7) {
            TxtTaskState = '已取消'
          }
          if (data[t].TaskState == 8) {
            TxtTaskState = '异常'
          }
          data[t].ExpTaskState = TxtTaskState
        }
        const excelName = '任务管理.xls'
        table2excel(column, data, excelName)
      }
    }
  }
</script>

<style>
  /* 上传组件相关样式 */
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px !important;
    text-align: center;
  }

  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
