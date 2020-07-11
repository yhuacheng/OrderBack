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
			<el-button type="primary" size="small" :disabled="disabled" @click="editModalShow">
				<i class="el-icon-edit-outline"></i> 修改</el-button>
		</div>
		<div class="mt10">
			<el-table border :data="tableData" id="exportTable" style="width: 100%" :header-cell-style="{background:'#fafafa'}"
			 @selection-change="handleSelectionChange" @row-click="rowClick" ref="table">
				<el-table-column type="selection" align="center"></el-table-column>
				<el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
				<el-table-column prop="CountryName" label="国家名称" align="center"></el-table-column>
				<el-table-column prop="CounteyShorthand" label="国家简写" align="center"></el-table-column>
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
		<!--新增/修改-->
		<el-dialog :title='title' :visible.sync='editModal' :close-on-click-modal='false' :before-close="closeModal">
			<el-form :model='editForm' ref='editForm' :rules='Rules' label-width='120px' status-icon>
				<el-form-item label='国家名称' prop='CountryName'>
					<el-input v-model='editForm.CountryName'></el-input>
				</el-form-item>
				<el-form-item label='国家简写' prop='CountryShorthand'>
					<el-input v-model='editForm.CountryShorthand'></el-input>
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
		countryList,
		countryAdd,
		countryEdit
	} from '@/api/api';

	export default {
		name: 'countryManage',
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
				drModal: false, //导入
				tableData: [],
				checkBoxData: [], //选中数据
				searchForm: {
					searchWords: ''
				},
				editForm: {
					CountryName: '',
					CountryShorthand: ''
				},
				Rules: {
					CountryName: [{
						required: true,
						message: '请输入国家名称',
						trigger: 'blur'
					}],
					CountryShorthand: [{
						required: true,
						message: '请输入国家简写',
						trigger: 'blur'
					}]
				}
			}
		},
		created() {
			this.getAllData()
		},
		methods: {
			// 获取列表数据
			getAllData() {
				let _this = this
				let params = {
					country: _this.searchForm.searchWords,
					pageNum: _this.currentPage,
					pagesize: _this.pageSize,
				}
				countryList(params).then(res => {
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
				_this.title = '国家新增'
				_this.doType = 'add'
			},

			// 新增
			addSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						let params = Object.assign({}, this.editForm)
						params.Id = sessionStorage.getItem('userId')
						countryAdd(params).then(res => {
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
				_this.title = '国家修改'
				_this.doType = 'edit'
				let data = _this.checkBoxData[0]
				_this.editForm = {
					CountryName: data.CountryName,
					CountryShorthand: data.CounteyShorthand
				}
			},

			// 修改
			editSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						let params = {
							Country: _this.editForm.CountryName,
							CountryJX: _this.editForm.CountryShorthand,
							Id: _this.checkBoxData[0].Id
						}
						countryEdit(params).then(res => {
							_this.closeModal()
							_this.getAllData()
						}).catch((e) => {})
					}
				})
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
					CountryName: '',
					CountryShorthand: ''
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
			}
		}
	}
</script>

<style>

</style>
