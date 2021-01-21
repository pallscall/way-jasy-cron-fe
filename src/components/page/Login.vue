<template>
    <div class="login-wrap">
        <div class="ms-login">
            <div class="ms-title">定时任务管理系统</div>
            <el-form :model="param" :rules="rules" ref="login" label-width="0px" class="ms-content">
                <el-form-item prop="username">
                    <el-input v-model="param.username" placeholder="username">
                    <el-button slot="prepend" icon="el-icon-lx-people"></el-button>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        type="password"
                        placeholder="password"
                        v-model="param.password"
                        @keyup.enter.native="submitForm()"
                    >
                        <el-button slot="prepend" icon="el-icon-lx-lock"></el-button>
                    </el-input>
                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="submitForm()">登录</el-button>
                </div>
                <div class="login-btn">
                    <el-button type="primary" @click="register">注册新用户</el-button>
                </div>
<!--                <p class="login-tips">Tips : 用户名和密码随便填。</p>-->
            </el-form>

            <el-dialog title="注册" :visible.sync="registerVisible" width="40%">
                <el-form ref="form" :model="regForm" :rules="verifyForm" class="app-dialog_form" label-width="80px">
                    <el-form-item label="昵称" prop="username" required>
                        <el-input v-model="regForm.username"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password" required>
                        <el-input type="password" v-model="regForm.password"></el-input>
                    </el-form-item>
                    <el-form-item label="重复密码" prop="repeatPwd" required>
                        <el-input type="password" v-model="regForm.repeatPwd"></el-input>
                    </el-form-item>
                    <el-form-item label="手机号" prop="tel">
                        <el-input v-model="regForm.tel"></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="regForm.email"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="registerVisible = false">取 消</el-button>
                    <el-button type="primary" @click="saveRegister">确 定</el-button>
                </span>
            </el-dialog>
        </div>
    </div>



</template>

<script>
import { generateRSA, getPublicKey, login, register } from '@/api/user';
import { getRSA } from '@/components/common/util/rsa';

export default {
    data: function() {
        const pwdCheck = async(rule, value, callback) => {
            let reg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~@#$%\*-\+=:,\\?\[\]\{}]).{6,16}$/
            if (value.length < 6) {
                return callback(new Error('密码不能少于6位！'));
            } else if (value.length > 16) {
                return callback(new Error('密码最长不能超过16位！'));
            } else if (!reg.test(value)) {
                return callback(new Error('密码输入有误，请检查格式是否正确！'));
            } else {
                callback()
            }
        }

        const pwdRepeatCheck = async(rule, value, callback) => {
            if (value.length < 1) {
                return callback(new Error('重复密码不能为空！'));
            } else if(this.regForm.password !== this.regForm.repeatPwd){
                return callback(new Error('两次输入密码不一致！'));
            }else{
                callback()
            }
        };

        const telCheck = async(rule, value, callback) => {
            if (value != "") {
                let reg = /^[1][3,4,5,7,8][0-9]{9}$/
                if (value.length != 11 || !reg.test(value)) {
                    console.log("xxxxxxxxxxxxxxxxx")
                    return callback(new Error('手机号格式有误'));
                }
            }
            callback()
        };

        const emailCheck = async(rule, value, callback) => {
            if (value != "") {
                let reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/
                if (!reg.test(value)) {
                    return callback(new Error('邮箱格式有误'));
                }
            }
            callback()
        };


        return {
            param: {
                username: '',
                password: '',
            },
            rules: {
                username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
                password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
            },
            verifyForm: {
                username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
                password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
                repeatPwd: [{ required: true, message: '重复输入密码', validator: pwdRepeatCheck, trigger: 'blur' }],
                email:    [{ validator: emailCheck, required: false, message: '请输入邮箱', trigger: 'blur' }],
                tel:    [{ validator: telCheck, required: false, message: '请输入手机号', trigger: 'blur' }],
            },
            registerVisible: false,
            regForm: {
                username: '',
                password: '',
                repeatPwd: '',
                email: '',
                tel: ''
            }
        };
    },
    methods: {
        submitForm() {
            this.$refs.login.validate(async valid => {
                if (valid) {
                    let pwd = this.param.password, err = false
                    await getPublicKey(this.param).then((res)=>{
                        if (res.code !== 0) {
                            this.$message.error(res.message + "登录失败");
                            err = true
                            return
                        }
                        this.param.password = getRSA(res.data, this.param.password)
                    })
                    if (err === true) return
                    await login(this.param).then((res)=>{
                        if (res.code !== 0) {
                            this.$message.error("用户名或密码错误");
                        } else {
                            this.$message.success('登录成功');
                            localStorage.setItem('access_key', this.param.username);
                            this.$router.push('/');
                        }
                    })
                    this.param.password = pwd
                } else {
                    this.$message.error('请输入账号和密码');
                    console.log('error submit!!');
                    return false;
                }
            });
        },

        register() {
            this.registerVisible = true
            this.regForm.email = ''
            this.regForm.repeatPwd = ''
            this.regForm.username = ''
            this.regForm.password = ''
            this.regForm.tel = ''
        },

        saveRegister() {
            this.$refs.form.validate(async valid => {
                let err = false
                if (valid) {
                    await generateRSA(this.regForm).then((res)=>{
                        if (res.code !== 0) {
                            this.$message.error(res.message + "注册失败")
                            err = true
                            return
                        }
                        this.regForm.password = getRSA(res.data, this.regForm.password)
                        this.regForm.repeatPwd = this.regForm.password
                    })
                    if (err === true) {
                        return
                    }
                    register(this.regForm).then((res)=>{
                        console.log("res", res)
                        if (res.code !== 0) {
                            this.$message.error(res.message + "注册失败")
                            return
                        }
                        this.$message.success("注册成功")
                        this.registerVisible = false
                    })
                } else {
                    return false
                }

            })

        },


    },
};
</script>

<style scoped>
.login-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    background-image: url(../../assets/img/login-bg.jpg);
    background-size: 100%;
}
.ms-title {
    width: 100%;
    line-height: 50px;
    text-align: center;
    font-size: 20px;
    color: #fff;
    border-bottom: 1px solid #ddd;
}
.ms-login {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 350px;
    margin: -190px 0 0 -175px;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.3);
    overflow: hidden;
}
.ms-content {
    padding: 30px 30px;
}
.login-btn {
    text-align: center;
}
.login-btn button {
    width: 100%;
    height: 36px;
    margin-bottom: 10px;
}
.login-tips {
    font-size: 12px;
    line-height: 30px;
    color: #fff;
}
</style>
