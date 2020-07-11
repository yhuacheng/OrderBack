import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

export default new Router({
	// mode: 'history',
	routes: [{
			path: '/',
			redirect: '/index'
		},
		{
			path: '/home',
			name: 'home',
			component: resolve => require(['../components/home.vue'], resolve),
			children: [{
					path: '/index',
					name: 'index',
					component: resolve => require(['../pages/index.vue'], resolve),
					meta: {
						title: '首页'
					}
				},
				{
					path: '/order',
					name: 'order',
					component: resolve => require(['../pages/orderManage/order.vue'], resolve),
					meta: {
						title: '订单管理'
					}
				},
				{
					path: '/task',
					name: 'task',
					component: resolve => require(['../pages/taskManage/task.vue'], resolve),
					meta: {
						title: '任务管理'
					}
				},
				{
					path: '/customer',
					name: 'customer',
					component: resolve => require(['../pages/customerManage/customer.vue'], resolve),
					meta: {
						title: '客户管理'
					}
				},
				{
					path: '/customerLog',
					name: 'customerLog',
					component: resolve => require(['../pages/customerManage/customerLog.vue'], resolve),
					meta: {
						title: '客户日志'
					}
				},
				{
					path: '/takemoney',
					name: 'takemoney',
					component: resolve => require(['../pages/takemoneyManage/takemoney.vue'], resolve),
					meta: {
						title: '提现管理'
					}
				},
				{
					path: '/user',
					name: 'user',
					component: resolve => require(['../pages/userManage/user.vue'], resolve),
					meta: {
						title: '用户管理'
					}
				},
				{
					path: '/system',
					name: 'system',
					component: resolve => require(['../pages/systemManage/system.vue'], resolve),
					meta: {
						title: '系统设置'
					}
				},
				{
					path: '/userInfo',
					name: 'userInfo',
					component: resolve => require(['../pages/userInfo.vue'], resolve),
					meta: {
						title: '个人资料'
					}
				},
			]
		},
		{
			path: '/login',
			name: 'login',
			component: resolve => require(['../pages/login.vue'], resolve)
		}
	]
})
