import {
  get,
  post
} from './http'

export const login = (params) => post('/api/Login/UserLogin', params) //登录

export const userList = (params) => get('/api/BackUser/GetBackUser', params) //用户列表
export const userAdd = (params) => post('/api/BackUser/Adduser', params) //用户新增
export const userEdit = (params) => post('/api/BackUser/Changeuser', params) //用户修改
export const userDelete = (params) => post('/api/BackUser/Deleteuser', params) //用户删除
export const codeNoUsed = (params) => get('/api/Recommend/GetRecommend', params) //未使用的推荐码
export const roleList = (params) => get('/api/Rool/GetRool', params) //角色列表

export const codeList = (params) => get('/api/Recommend/GetAllRecommend', params) //推荐码列表
export const codeAdd = (params) => post('/api/Recommend/AddRecommend', params) //推荐码新增
export const codeState = (params) => post('/api/Recommend/ChangeRecommend', params) //更改推荐码状态

export const countryList = (params) => get('/api/Country/GetCountry', params) //国家列表
export const countryAdd = (params) => post('/api/Country/AddCountry', params) //国家新增
export const countryEdit = (params) => post('/api/Country/ChangeCountry', params) //国家修改

export const noticeAdd = (params) => post('/api/HomePage/AddHomePage', params) //公告添加
export const noticeGet = (params) => get('/api/BackUser/GetHomeSystem', params) //公告内容获取

export const addedServiceList = (params) => get('/api/IncrementServiceFee/GetIncrementServiceFee', params) //增值服务费列表
export const addedServiceAdd = (params) => post('/api/IncrementServiceFee/AddIncrementServiceFee', params) //增值服务费新增
export const addedServiceEdit = (params) => post('/api/IncrementServiceFee/ChangeIncrementServiceFee', params) //增值服务费修改
export const addedServiceState = (params) => post('/api/IncrementServiceFee/ChangeState', params) //更改增值服务费状态

export const rateList = (params) => get('/api/Rate/GetRate', params) //货币汇率列表
export const rateAdd = (params) => post('/api/Rate/AddRate', params) //货币汇率新增
export const rateEdit = (params) => post('/api/Rate/ChangeRate', params) //货币汇率修改

export const serviceFeeList = (params) => get('/api/Fee/GetFee', params) //服务费列表
export const serviceFeeAdd = (params) => post('/api/Fee/AddFee', params) //服务费新增
export const serviceFeeEdit = (params) => post('/api/Fee/ChangeFee', params) //服务费修改
export const serviceFeeState = (params) => post('/api/Fee/ChangeFeeState', params) //更改服务费状态

export const customerList = (params) => get('/api/CustomerAppointment/GetCustomerAppointment', params) //客户列表
export const customerState = (params) => post('/api/CustomerAppointment/ChangeCustomerState', params) //更改客户状态
export const customerRecharge = (params) => post('/api/CustomerAppointment/ChangeAccountbalance', params) //客户充值扣款
export const customerBalance = (params) => get('/api/CustomerAppointment/GetAccountbalance', params) //客户余额信息
export const customerLog = (params) => get('/api/CustomerAppointment/GetBackAppoinmentLog', params) //客户日志
export const customerBindUser = (params) => post('/api/CustomerAppointment/CustomerBindUser', params) //客户重新分配所属用户

export const takemoneyList = (params) => get('/api/DrawMoney/GetDrawMoneyList', params) //客户提现列表
export const takemoneyState = (params) => post('/api/DrawMoney/ChangeDrawMoenyState', params) //更改客户提现状态

export const payTypeList = (params) => get('/api/Payment/GetPayment', params) //支付方式列表
export const payTypeAdd = (params) => post('/api/Payment/AddPayment', params) //支付方式新增
export const payTypeEdit = (params) => post('/api/Payment/ChangePayment', params) //支付方式修改
export const payTypeState = (params) => post('/api/Payment/ChangeState', params) //更改支付方式

export const orderList = (params) => get('/api/Order/GetCustomerOrderList', params) //订单列表
export const orderStateNum = (params) => post('/api/Order/GetState', params) //订单不同状态下的数量
export const orderState = (params) => post('/api/Order/ChangeOrderState', params) //订单确认/取消
export const orderStateMore = (params) => post('/api/Order/BatchOrderChangeState', params) //订单批量确认/取消
export const orderTask = (params) => get('/api/Order/GetTask', params) //订单拆分的任务列表
export const orderTaskBind = (params) => post('/api/Order/AssignedTaks', params) //订单任务分配
export const orderFeeEdit = (params) => post('/api/Order/ChangeOrderInformation', params) //订单服务费汇率修改

export const taskList = (params) => get('/api/Task/GetTaskList', params) //任务列表
export const taskStateNum = (params) => post('/api/Task/GetState', params) //任务不同状态下的数量
export const taskBuy = (params) => post('/api/Task/ChangeBuyingTwo', params) //确认购买
export const taskState = (params) => post('/api/Task/ChangeTaskCancel', params) //任务取消
export const taskStateMore = (params) => post('/api/Task/BatchChangeTaskState', params) //批量任务取消
export const taskComment = (params) => post('/api/Task/ChangeTaskFour', params) //任务评价
export const taskView = (params) => get('/api/Task/TaskDetails', params) //任务详情
export const taskFeeEdit = (params) => post('/api/Task/ChangeTaskServicechargeAndExchangeRate', params) //任务服务费汇率修改
export const taskBindOut = (params) => post('/api/Task/TaskAgainBaskUser', params) //任务外派
export const taskAgain = (params) => post('/api/Task/AgainTask', params) //任务追加

export const customerCount = (params) => get('/api/Login/GetHomeUser', params) //首页统计(客户)
export const orderCount = (params) => get('/api/Login/GetHomeOrder', params) //首页统计(订单)
export const taskCount = (params) => get('/api/Login/GetHomeTask', params) //首页统计(任务)
export const taskNoAllot = (params) => get('/api/Login/GetHomeTaskTobeAllocated', params) //首页统计(7天未分配任务)
export const taskProgress = (params) => get('/api/Login/GetHomeUserTask', params) //首页统计(任务进度统计图)

export const phoneCode = (params) => post('/api/CustomerAppointment/ChangePhoneCode', params) //获取短信验证码
export const phoneCodeCheck = (params) => post('/api/CustomerAppointment/YzChangePhoneCode', params) //验证短信验证码
