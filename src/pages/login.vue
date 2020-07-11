<template>
	<div class="login_page fillcontain">
		<div class="login-container">
			<div class="manage_tit txtCenter">
				<div class="manage_tit_main">
					<img alt="logo" class="manage_tit_logo" src="../assets/image/logo.png">
				</div>
				<div class="manage_tit_sub">Accelpower 是深圳最具影响力的企业</div>
			</div>
			<div class="login_box">
				<el-form :model="loginForm" ref="loginForm" :rules="Rules">
					<el-form-item prop="userName">
						<el-input v-model="loginForm.userName" prefix-icon="el-icon-user" placeholder="请输入用户名"></el-input>
					</el-form-item>
					<el-form-item prop="pwd">
						<el-input type="password" prefix-icon="el-icon-lock" placeholder="请输入密码" v-model="loginForm.pwd"></el-input>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" class="submit_btn" @click="loginIn">登 陆</el-button>
					</el-form-item>
				</el-form>
			</div>
		</div>
	</div>
</template>

<script>
	import {
		login
	} from '@/api/api';
	export default {
		name: 'login',
		data() {
			return {
				loginForm: {
					userName: '',
					pwd: '',
				},
				Rules: {
					userName: [{
						required: true,
						message: '请输入用户名',
						trigger: 'blur'
					}],
					pwd: [{
						required: true,
						message: '请输入密码',
						trigger: 'blur'
					}]
				}
			}
		},
		created() {
			//回车键登录
			let _this = this
			document.onkeydown = function(e) {
				var key = window.event.keyCode
				if (key === 13) {
					_this.loginIn()
				}
			}
		},
		beforeDestroy() {
			//离开页面销毁回车键事件
			document.onkeydown = function(e) {
				var key = window.event.keyCode
				if (key === 13) {}
			}
		},
		methods: {
			// 登录
			loginIn() {
				let _this = this
				_this.$refs.loginForm.validate((valid) => {
					if (valid) {
						let params = {
							LoginName: _this.loginForm.userName,
							Password: _this.loginForm.pwd,
						}
						login(params).then(res => {
							let arr = res.Data.split(',')
							let userId = arr[0]
							let userName = arr[1]
							let roleArr = arr[2]
							let userPhone = arr[3]

							sessionStorage.setItem('token', userId) //token
							sessionStorage.setItem('userId', userId) //用户ID
							sessionStorage.setItem('userName', userName) //用户名
							sessionStorage.setItem('roleId', roleArr) //角色ID
							sessionStorage.setItem('userPhone', userPhone) //用户手机号

							//如果是外派员则跳转到任务页，否则跳转到首页
							if (roleArr.indexOf(5) >= 0) {
								this.$router.push('/task')
							} else {
								this.$router.push('/')
							}

						}).catch((e) => {})
					}
				})
			}
		}
	}
</script>

<style scoped>

</style>
