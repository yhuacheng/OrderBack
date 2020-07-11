<template>
	<div>
		<el-collapse-transition>
			<div class="searchBox mb20">
				<el-form ref="searchForm" :model="searchForm" class="form-item" label-width="80px">
					<el-row>
						<el-col :xs="24" :span="6">
							<el-form-item label="国家名称">
								<el-input v-model="searchForm.searchWords" placeholder="请输入国家名称" size="small"></el-input>
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
			<el-button type="primary" size="small" @click="editModalShow" :disabled="disabled"><i class="el-icon-edit-outline"></i>
				修改</el-button>
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
				<el-table-column prop="CountryName" label="国家" align="center"></el-table-column>
				<el-table-column prop="Probability" label="留评率" align="center"></el-table-column>
				<el-table-column prop="FeePrice" label="每单服务费" align="center"></el-table-column>
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
		<!-- 新增修改 -->
		<el-dialog :title="title" :visible.sync="editModal" :close-on-click-modal="false" :before-close="closeModal">
			<el-form :model='editForm' ref='editForm' :rules='Rules' label-width='120px' status-icon>
				<el-form-item label="国家" prop="CountryId">
					<el-select style="width: 100%;" v-model="editForm.CountryId" filterable placeholder="请选择国家">
						<el-option v-for="item in countryData" :key="item.Id" :label="item.CountryName" :value="item.Id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="留评率" prop="Probability">
					<template>
						<el-select v-model="editForm.Probability" placeholder="请选择留评比例" style="width: 100%;">
							<el-option label="0%" value="0%"></el-option>
							<el-option label="10%" value="10%"></el-option>
							<el-option label="20%" value="20%"></el-option>
							<el-option label="30%" value="30%"></el-option>
							<el-option label="40%" value="40%"></el-option>
							<el-option label="50%" value="50%"></el-option>
							<el-option label="60%" value="60%"></el-option>
							<el-option label="70%" value="70%"></el-option>
							<el-option label="80%" value="80%"></el-option>
							<el-option label="90%" value="90%"></el-option>
							<el-option label="100%" value="100%"></el-option>
						</el-select>
					</template>
				</el-form-item>
				<el-form-item label="每单服务费" prop="FeePrice">
					<el-input v-model="editForm.FeePrice"></el-input>
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
		serviceFeeList,
		serviceFeeAdd,
		serviceFeeEdit,
		serviceFeeState,
		countryList
	} from '@/api/api'
	export default {
		name: 'serviceFee',
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
					searchWords: ''
				},
				countryData: [], //国家数据
				editForm: {
					CountryId: '',
					Probability: '',
					FeePrice: ''
				},
				Rules: {
					CountryId: [{
						required: true,
						message: '请选择国家',
						trigger: 'blur'
					}],
					Probability: [{
						required: true,
						message: '请选择留评率',
						trigger: 'blur'
					}],
					FeePrice: [{
							required: true,
							message: '请输入每单服务费',
							trigger: 'blur'
						},
						{
							pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
							message: '服务费格式不正确',
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

			// 获取列表数据
			getAllData() {
				let _this = this
				let params = {
					currencyName: _this.searchForm.searchWords,
					pageNum: _this.currentPage,
					pagesize: _this.pageSize,
				}
				serviceFeeList(params).then(res => {
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
				_this.getCountryData() //获取国家数据
				_this.title = '服务费新增'
				_this.doType = 'add'
			},

			// 新增
			addSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						let params = Object.assign({}, this.editForm)
						serviceFeeAdd(params).then(res => {
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
				_this.getCountryData() //获取国家数据
				_this.title = '服务费修改'
				_this.doType = 'edit'
				let data = _this.checkBoxData[0]
				_this.editForm = {
					CountryId: data.CountryId,
					Probability: data.Probability,
					FeePrice: data.FeePrice
				}
			},

			// 修改
			editSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						let params = Object.assign({}, _this.editForm)
						params.Id = _this.checkBoxData[0].Id
						serviceFeeEdit(params).then(res => {
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
				serviceFeeState(params).then((res) => {
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

			//关闭新增修改弹窗
			closeModal() {
				let _this = this
				_this.editModal = false
				_this.$refs['editForm'].resetFields()
				_this.editForm = {
					CountryId: '',
					Probability: '',
					FeePrice: ''
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
