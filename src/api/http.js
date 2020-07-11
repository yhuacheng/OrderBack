import Axios from 'axios'
import qs from 'qs'
import Vue from 'vue'
import {
  Message,
  Loading
} from 'element-ui';

let loading; //定义loading变量

function startLoading() { //使用Element loading-start 方法
  loading = Loading.service({
    lock: true,
    text: '请稍候',
    background: 'rgba(0, 0, 0, 0.3)'
  })
}

function endLoading() { //使用Element loading-close 方法
  loading.close()
}
//那么 showFullScreenLoading() tryHideFullScreenLoading() 要干的事儿就是将同一时刻的请求合并。
//声明一个变量 needLoadingRequestCount，每次调用showFullScreenLoading方法 needLoadingRequestCount + 1。
//调用tryHideFullScreenLoading()方法，needLoadingRequestCount - 1。needLoadingRequestCount为 0 时，结束 loading。
let needLoadingRequestCount = 0
export function showFullScreenLoading() {
  if (needLoadingRequestCount === 0) {
    startLoading()
  }
  needLoadingRequestCount++
}

export function tryHideFullScreenLoading() {
  if (needLoadingRequestCount <= 0) return
  needLoadingRequestCount--
  if (needLoadingRequestCount === 0) {
    endLoading()
  }
}

Axios.defaults.timeout = 60000
Axios.defaults.baseURL = ''


//http request 拦截器
Axios.interceptors.request.use(
  config => {
    if (config.method === 'post') { //支持2种方法，默认使用Form Data
      if (config.data.useRequestBody) {
        //参数需要带上useRequestBody
        //如果useRequestBody=true, 支持Request Payload，
        //SpringMVC Controller 中需要使用@RequestBody
        delete config.data.useRequestBody;
        config.headers = {
          'Content-Type': 'application/json;charset=UTF-8'
        }
      } else {
        //如果useRequestBody=false, 默认支持Form Data
        //SpringMVC Controller 中不需要使用@RequestBody，默认使用@RequestParam
        config.data = qs.stringify(config.data);
        config.headers = {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
      }

    } else if (config.method === 'get') {
      let newParams = {}
      for (let key in config.params) {
        // newParams[key] = encodeURIComponent(config.params[key])  //转码
        newParams[key] = config.params[key] //不转码
      }
      config.params = newParams

      config.headers = {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    }

    //显示等待框
    showFullScreenLoading();

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

//http response 拦截器
Axios.interceptors.response.use(
  response => {
    let data = response.data

    //隐藏等待框
    tryHideFullScreenLoading()

    if (data.Code != 'no') {
      return Promise.resolve(data)
    } else {
      Message.error(data.Msg) //弹出提示信息

      return Promise.reject(data)
    }
  },
  error => {
    //如果出现错误，隐藏等待框，提示错误信息
    tryHideFullScreenLoading()
    Message.error('请求出现错误，错误码：' + error.response.status) //弹出提示信息

    return Promise.reject(error)
  }
)

/**
 * 封装get方法
 * @param url
 * @param data
 * @returns {Promise}
 */

const get = function get(url, params = {}) {
  return new Promise((resolve, reject) => {
    params.showLoading && showFullScreenLoading() //显示等待框

    Axios.get(url, {
        params: params
      })
      .then(response => {
        params.showLoading && tryHideFullScreenLoading() //隐藏等待框

        resolve(response);
      })
      .catch(err => {
        params.showLoading && tryHideFullScreenLoading() //隐藏等待框

        reject(err)
      })
  })
}


/**
 * 封装post请求
 * @param url
 * @param params
 * @returns {Promise}
 */

const post = function post(url, params = {}) {
  return new Promise((resolve, reject) => {
    params.showLoading && showFullScreenLoading() //显示等待框

    Axios.post(url, params)
      .then(response => {
        params.showLoading && tryHideFullScreenLoading() //隐藏等待框
        resolve(response);
        if (response.Msg) {
          Message.success(response.Msg) //弹出提示信息
        }
      }, err => {
        params.showLoading && tryHideFullScreenLoading() //隐藏等待框

        reject(err)
      })
  })
}

/**
 * 封装patch请求
 * @param url
 * @param data
 * @returns {Promise}
 */

const patch = function patch(url, data = {}) {
  return new Promise((resolve, reject) => {
    Axios.patch(url, data)
      .then(response => {
        resolve(response);
      }, err => {
        reject(err)
      })
  })
}

/**
 * 封装put请求
 * @param url
 * @param data
 * @returns {Promise}
 */

const put = function put(url, data = {}) {
  return new Promise((resolve, reject) => {
    Axios.put(url, data)
      .then(response => {
        resolve(response);
      }, err => {
        reject(err)
      })
  })
}


export {
  get,
  post,
  patch,
  put
}
