<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 基础表格
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button
                    type="primary"
                    icon="el-icon-delete"
                    class="handle-del mr10"
                    @click="delAllSelection"
                >批量删除</el-button>
<!--                <el-select v-model="query.address" placeholder="地址" class="handle-select mr10">-->
<!--                    <el-option key="1" label="广东省" value="广东省"></el-option>-->
<!--                    <el-option key="2" label="湖南省" value="湖南省"></el-option>-->
<!--                </el-select>-->
<!--                <el-input v-model="query.name" placeholder="用户名" class="handle-input mr10"></el-input>-->
                <el-input placeholder="任务名称" v-model="jobQuery.name" class="search-input__creator"
                          @keyup.native="keyupSearch"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button type="primary" icon="el-icon-search" class="add-job" @click="handleAdd">添加任务</el-button>
            </div>
            <el-table
                :data="this.jobData"
                border
                class="table"
                ref="multipleTable"
                header-cell-class-name="table-header"
                @selection-change="handleSelectionChange"
            >
<!--                <el-table-column type="selection" width="55" align="center"></el-table-column>-->
                <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
                <el-table-column prop="name" label="任务名" align="center"></el-table-column>
                <el-table-column prop="url" label="任务链接"></el-table-column>
                <el-table-column prop="spec" label="定时器" align="center"></el-table-column>
                <el-table-column prop="creator" label="创建人" align="center"></el-table-column>
                <el-table-column prop="ctime" label="创建时间" align="center">
                    <template slot-scope="scope">
                        <p>{{ dateFormat(scope.row.ctime, 'YYYY-mm-dd HH:MM:SS') }}</p>
                    </template>
                </el-table-column>
                <el-table-column prop="mtime" label="修改时间" align="center">
                    <template slot-scope="scope">
                        <p>{{ dateFormat(scope.row.mtime, 'YYYY-mm-dd HH:MM:SS') }}</p>
                    </template>
                </el-table-column>
                <el-table-column label="状态" align="center">
                    <template slot-scope="scope">
                        <el-switch
                            v-model="scope.row.status"
                            active-color="#13ce66"
                            inactive-color="#ff4949"
                            active-text="ON"
                            inactive-text="OFF"
                            :active-value="1"
                            :inactive-value="0"
                            @change="switchJob(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>


                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button
                            type="text"
                            icon="el-icon-edit"
                            @click="handleEdit(scope.$index, scope.row)"
                        >编辑</el-button>
                        <el-button
                            type="text"
                            icon="el-icon-delete"
                            class="red"
                            @click="handleDelete(scope.$index, scope.row)"
                        >删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination class="pagination"
                           @current-change="handlePageChange"
                           ref="pag"
                           :total="pageTotal"
                           :current-page.sync="jobQuery.page_num"
                           :page-sizes="[5, 10, 15, 20]"
                           :page-size="jobQuery.page_size"
                           v-if="jobData.length"
                           background
                           layout="total, sizes, prev, pager, next">
            </el-pagination>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog title="定时任务" :visible.sync="editVisible" width="50%">
            <el-form ref="form" :model="job" class="app-dialog_form" label-width="80px">
                <el-form-item label="任务名称" required>
                    <el-input v-model="job.name"></el-input>
                </el-form-item>
                <el-form-item label="任务链接" required>
                    <el-input v-model="job.url"></el-input>
                </el-form-item>
                <el-form-item label="请求方法" required>
                    <el-select v-model="job.method" clearable placeholder="请选择">
                        <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
<!--                <el-form-item label="请求头" required>-->
<!--                    <el-select v-model="job.header">-->
<!--                        <el-option-->
<!--                            v-for="item in options"-->
<!--                            :key="item.value"-->
<!--                            :label="item.label"-->
<!--                            :value="item.value">-->
<!--                        </el-option>-->
<!--                    </el-select>-->
<!--                </el-form-item>-->
                <el-form-item label="请求体">
                    <el-input
                        type="textarea"
                        :rows="4"
                        placeholder="请输入Request Body"
                        v-model="job.body">
                    </el-input>
                </el-form-item>
                <el-form-item label="定时器" required>
                    <el-input v-model="job.spec"></el-input>
<!--                    <el-autocomplete-->
<!--                        class="inline-input"-->
<!--                        v-model="job.spec"-->
<!--                        placeholder="例：@every 7s"-->
<!--                    ></el-autocomplete>-->
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>

import { dateFormat } from '@/components/common/util/time.js';
import { addJob, getJobList, switchJob, updateJob } from '@/api/job';
import { DeleteStatus, RunningStatus, StoppingStatus } from '@/components/common/constant';
import {throttle} from "lodash";
export default {
    name: 'job_http',
    data() {
        return {
            dateFormat,
            jobQuery: {
                name: null,
                creator: null,
                status: null,
                page_num: 1,
                page_size: 10
            },
            jobData: [],
            multipleSelection: [],
            delList: [],
            editVisible: false,
            jobOps: '',
            pageTotal: 0,
            form: {},
            idx: -1,
            id: -1,

            job: {
                id: null,
                name: null,
                url: null,
                spec: null,
                status: null,
                comment: null,
                creator: null,
                updater: null,
                body: null,
                method: null,
                header: null
            },
            options: [
                {
                    value: 'GET',
                    label: 'GET'
                }, {
                    value: 'POST',
                    label: 'POST'
                }, {
                    value: 'PUT',
                    label: 'PUT'
                }, {
                    value: 'DELETE',
                    label: 'DELETE'
                }
            ],
            reqHeaders: []

        };
    },
    created() {
        this.getData();
        this.init();
    },
    methods: {
        init() {
            this.jobQuery.creator = localStorage.getItem('access_key')
        },
        switchJob(row) {
            let opt = (row.status == true ? RunningStatus: StoppingStatus)
            switchJob({id: row.id, opt: opt}).then((res)=>{
                if (res.code !== 0) {
                    this.$message.error('切换失败');
                    return
                }
            })
        },

        getData() {
            getJobList(this.jobQuery).then(res => {
                this.jobData = res.data.jobs;
                //console.log("job", this.jobData)
                this.pageTotal = res.data.total || 50;
            });
        },
        // 触发搜索按钮
        handleSearch() {
            this.$set(this.jobQuery, 'page_num', 1);
            this.getData();
        },

        keyupSearch: throttle(function keyupSearch () {
            this.jobQuery.page_num = 1;
            this.getData();
        }, 1000),

        handleAdd() {
            this.editVisible = true;
            this.jobOps = 'add';
            this.job.name = null;
            this.job.url = null;
            this.job.spec = null;
            this.job.status = null;
            this.job.comment = null;
            this.job.creator = null;
            this.job.header = null;
            this.job.method = 'GET';
            this.job.body = null;
        },
        // 删除操作
        handleDelete(index, row) {
            // 二次确认删除
            this.$confirm('确定要删除吗？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    let req = {
                        id: row.id,
                        opt: DeleteStatus
                    }
                    try {
                        switchJob(req).then(res => {
                            if (res.code !== 0) {
                                this.$message.error('删除失败');
                                return
                            }
                            this.jobData.splice(index, 1);
                        })

                    } catch (err) {
                        this.$message.error(err);
                    }
                    this.$message.success('删除成功');
                })
                .catch(() => {});
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        delAllSelection() {
            const length = this.multipleSelection.length;
            let str = '';
            this.delList = this.delList.concat(this.multipleSelection);
            for (let i = 0; i < length; i++) {
                str += this.multipleSelection[i].name + ' ';
            }
            this.$message.error(`删除了${str}`);
            this.multipleSelection = [];
        },
        // 编辑操作
        handleEdit(index, row) {
            this.idx = index;
            this.job = row;
            this.editVisible = true;
            this.jobOps = 'update'
        },
        // 保存编辑
        saveEdit() {
            this.editVisible = false;
            this.job.creator = localStorage.getItem('access_key')
            try {
                if(this.jobOps === 'add') {
                    addJob(this.job).then((res)=>{
                        if(res.code !== 0) {
                            this.$message.error('添加任务失败，请联系管理员！');
                            return
                        }
                        this.$message.success('添加成功');
                        this.getData()
                    })

                }else{
                    updateJob(this.job).then((res)=>{
                        if(res.code !== 0) {
                            this.$message.error('修改任务失败，请联系管理员！');
                            return
                        }
                        this.$message.success('修改成功');
                        this.$set(this.jobData, this.idx, this.job);
                    })
                }
            } catch (e) {
                this.$message.error(e);
            }
        },
        // 分页导航
        handlePageChange(val) {
            this.$set(this.jobQuery, 'page_num', val);
            this.getData();
        }
    }
};
</script>

<style scoped>
.handle-box {
    margin-bottom: 20px;
}

.handle-select {
    width: 120px;
}

.handle-input {
    width: 300px;
    display: inline-block;
}
.table {
    width: 100%;
    font-size: 12px;
}
.red {
    color: #ff0000;
}
.mr10 {
    margin-right: 10px;
}
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}
.app-dialog_form {
    .el-input {
        width: 350px;
    }
}
.name-item {
    font-size: 10px;
}
.add-job {
    float: right;
}
.search-input__creator {
    width: 200px;
    margin-right: 20px;
}
</style>
