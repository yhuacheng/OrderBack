<template>
	<div>
		<div class="mb20">
			<el-button type="success" size="small" @click="addModalShow"><i class="el-icon-plus"></i> 新增</el-button>
			<el-button type="primary" size="small" :disabled="disabled" @click="editModalShow">
				<i class="el-icon-edit-outline"></i> 修改</el-button>
			<el-button type="success" size="small" :disabled="disabled" @click="changeState(1)"><i class="el-icon-circle-check"></i>
				有效</el-button>
			<el-button type="warning" size="small" :disabled="disabled" @click="changeState(0)"><i class="el-icon-warning-outline"></i>
				无效</el-button>
		</div>
		<div class="mt10">
			<el-table border :data="tableData" id="exportTable" style="width: 100%" :header-cell-style="{background:'#fafafa'}"
			 @selection-change="handleSelectionChange" @row-click="rowClick" ref="table">
				<el-table-column type="selection" align="center"></el-table-column>
				<el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
				<el-table-column prop="AccountNumber" label="收款账号" align="center"></el-table-column>
				<el-table-column prop="PaymentName" label="收款名称" align="center"></el-table-column>
				<el-table-column prop="PaymentState" label="支付方式" align="center" :formatter="toText"></el-table-column>
				<el-table-column prop="Image" label="收款二维码" align="center">
					<template slot-scope="scope">
						<img style="width: 40px;height: 40px;" v-show="scope.row.Image" :src="scope.row.Image" @click="showImage(scope.$index,scope.row)" />
					</template>
				</el-table-column>
				<el-table-column prop="Remarks" label="备注" align="center"></el-table-column>
				<el-table-column prop="Enabled" label="状态" align="center">
					<template slot-scope="scope">
						<span v-if="scope.row.Enabled==1" class="success">有效</span>
						<span v-if="scope.row.Enabled==0" class="danger">无效</span>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<!--新增/修改-->
		<el-dialog :title='title' :visible.sync='editModal' :close-on-click-modal='false' :before-close="closeModal">
			<el-form :model='editForm' ref='editForm' :rules='Rules' label-width='120px' status-icon>
				<el-form-item label='收款账号' prop='AccountNumber'>
					<el-input v-model='editForm.AccountNumber'></el-input>
				</el-form-item>
				<el-form-item label='收款名称' prop='PaymentName'>
					<el-input v-model='editForm.PaymentName'></el-input>
				</el-form-item>
				<el-form-item label='支付方式' prop='PaymentState'>
					<el-select v-model="editForm.PaymentState" placeholder="请选择支付方式" style="width: 100%;">
						<el-option :value="1" label="支付宝"></el-option>
						<el-option :value="2" label="微信"></el-option>
						<el-option :value="3" label="银行卡"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label='收款二维码' prop='Image'>
					<el-upload class="avatar-uploader" name="Image" action="/api/Payment/GetProductPictures" :show-file-list="false"
					 :on-success="handleAvatarSuccess" :on-error="handleError" :before-upload="beforeAvatarUpload" accept="image/jpeg,image/png,image/gif,image/bmp">
						<img v-if="imageUrl" :src="imageUrl" class="avatar">
						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
					</el-upload>
					<el-input v-show="false" v-model='editForm.Image'></el-input>
				</el-form-item>
				<el-form-item label="备注" prop="Remarks">
					<el-input type="textarea" :rows="3" v-model='editForm.Remarks'></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="addSubmit" v-show="doType=='add'">确 定</el-button>
				<el-button type="primary" @click="editSubmit" v-show="doType=='edit'">确 定</el-button>
				<el-button @click="closeModal">取 消</el-button>
			</div>
		</el-dialog>
		<!--查看收款二维码大图-->
		<el-dialog :title='title' :visible.sync='imageModal' :close-on-click-modal='false' :before-close="closeImageModal">
			<div class="txtCenter">
				<img :src='imageUrl' style="max-width: 50%;" />
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button @click="closeImageModal">关 闭</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
	import {
		payTypeList,
		payTypeAdd,
		payTypeEdit,
		payTypeState
	} from '@/api/api';

	export default {
		name: 'payType',
		data() {
			return {
				title: '',
				currentPage: 1,
				pageSize: 10,
				total: 0,
				doType: '',
				disabled: true, //单项禁用
				disabledMore: true, //多项禁用
				loading: true,
				editModal: false, //新增修改
				imageModal: false, //图片
				tableData: [],
				checkBoxData: [], //选中数据
				searchForm: {
					searchWords: ''
				},
				editForm: {
					AccountNumber: '',
					PaymentName: '',
					PaymentState: '',
					Image: '',
					Remarks: ''
				},
				imageUrl: '',
				Rules: {
					AccountNumber: [{
						required: true,
						message: '请输入收款账号',
						trigger: 'blur'
					}],
					PaymentName: [{
						required: true,
						message: '请输入收款名称',
						trigger: 'blur'
					}],
					PaymentState: [{
						required: true,
						message: '请选择支付方式',
						trigger: 'blur'
					}],
				}
			}
		},
		created() {
			this.getAllData()
		},
		methods: {
			//支付方式转文字
			toText(row, column) {
				let text = ''
				if (row.PaymentState == 1) {
					text = '支付宝'
				}
				if (row.PaymentState == 2) {
					text = '微信'
				}
				if (row.PaymentState == 3) {
					text = '银行卡'
				}
				return text
			},

			// 获取列表数据
			getAllData() {
				let _this = this
				let params = {}
				payTypeList(params).then(res => {
					_this.tableData = res.list
				}).catch((e) => {})
			},

			// 新增弹框
			addModalShow() {
				let _this = this
				_this.editModal = true
				_this.title = '支付方式新增'
				_this.doType = 'add'
			},

			// 新增
			addSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						let params = Object.assign({}, this.editForm)
						payTypeAdd(params).then(res => {
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
				_this.title = '支付方式修改'
				_this.doType = 'edit'
				let data = _this.checkBoxData[0]
				_this.editForm = {
					AccountNumber: data.AccountNumber,
					PaymentName: data.PaymentName,
					PaymentState: data.PaymentState,
					Image: data.Image,
					Remarks: data.Remarks
				}
				if (data.Image) {
					_this.imageUrl = data.Image
				}
			},

			// 修改
			editSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						let params = Object.assign({}, this.editForm)
						params.Id = _this.checkBoxData[0].Id
						payTypeEdit(params).then(res => {
							_this.closeModal()
							_this.getAllData()
						}).catch((e) => {})
					}
				})
			},

			// 图片上传
			handleAvatarSuccess(res, file) {
				if (res.Data != '') {
					this.editForm.Image = res.Data
				}
				this.imageUrl = URL.createObjectURL(file.raw);
				this.$message.success('二维码上传成功！')
			},
			handleError(res) {
				this.$message.error('二维码上传失败！')
			},
			beforeAvatarUpload(file) {
				const isJPG = file.type === 'image/jpeg';
				const isPNG = file.type === 'image/png';
				const isGIF = file.type === 'image/gif';
				const isBMP = file.type === 'image/bmp';
				const isLt2M = file.size / 1024 / 1024 < 2;
				if (!isJPG && !isPNG && !isGIF && !isBMP) {
					this.$message.error('上传图片必须是JPG/PNG/GIF/BMP 格式!');
				} else if (!isLt2M) {
					this.$message.error('上传图片大小不能超过 2MB!');
				}
				return (isJPG || isPNG || isGIF || isBMP) && isLt2M;
			},

			//更改状态
			changeState(val) {
				let _this = this
				let params = {
					Id: _this.checkBoxData[0].Id,
					State: val
				}
				payTypeState(params).then((res) => {
					_this.getAllData()
				}).catch(() => {})
			},

			//查看大图
			showImage(index, row) {
				let _this = this
				_this.imageModal = true
				_this.title = '【' + row.PaymentName + '】收款二维码'
				_this.imageUrl = row.Image
			},

			closeImageModal() {
				let _this = this
				_this.imageModal = false
				_this.imageUrl = ''
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

			//关闭新增修改弹窗
			closeModal() {
				let _this = this
				_this.editModal = false
				_this.$refs['editForm'].resetFields()
				_this.editForm = {
					AccountNumber: '',
					PaymentName: '',
					PaymentState: '',
					Image: '',
					Remarks: ''
				}
				_this.imageUrl = ''
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
