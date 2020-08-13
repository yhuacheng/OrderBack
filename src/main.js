// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import 'babel-polyfill'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import global_ from '@/components/global'
import '@/assets/css/base.css'
import 'default-passive-events'

import plTable from 'pl-table'
import 'pl-table/themes/index.css'
Vue.use(plTable);

Vue.config.productionTip = false

Vue.use(ElementUI)

Vue.prototype.axios = axios
Vue.prototype.GLOBAL = global_

axios.defaults.headers.post['Content-Type'] = 'application/json'

if (process.env.NODE_ENV === 'production') {
  Vue.prototype.GLOBAL.BASE_URL = 'http://203.195.212.239:8080/' // 测试接口
} else {
  Vue.prototype.GLOBAL.BASE_URL = '/api'
}

/* eslint-disable no-new */
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token')
  if (!token && to.path !== '/login') {
    next('/login')
  } else {
    // 简单的判断IE10及以下不进入富文本编辑器，该组件不兼容
    if (navigator.userAgent.indexOf('MSIE') > -1 && to.path === '/editor') {
      Vue.prototype.$alert('vue-quill-editor组件不兼容IE10及以下浏览器，请使用更高版本的浏览器查看', '浏览器不兼容通知', {
        confirmButtonText: '确定'
      })
    } else {
      next()
    }
  }
})
new Vue({
  el: '#app',
  router,
  render: h => h(App)
}).$mount('#app')
