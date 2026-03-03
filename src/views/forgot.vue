<template>
    <div>
        <h1>更改密码</h1>
        <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="120px">
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="ruleForm.email" placeholder="输入邮箱" style=" width:300px;margin-left: 20px;"></el-input>
            </el-form-item>
            <el-form-item label="输入验证码" prop="code">
                <el-row>
                    <el-col :span="18">
                        <el-input v-model="ruleForm.code" placeholder="请输入验证码" style=" width:300px"></el-input>
                    </el-col>
                    <el-col :span="6">
                        <el-button @click="sendCode" style="margin-left: 50px;">发送验证码</el-button>
                    </el-col>
                </el-row>
            </el-form-item>
            <el-form-item label="新密码" prop="password">
                <el-input v-model="ruleForm.password" type="password" placeholder="输入新密码" style=" width:300px;margin-left: 20px;"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm(ruleFormRef)" size="large" style="margin-left: 50px;" >提交</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang='ts'>
import { ref, reactive } from 'vue';
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus';
import { getCode, resetPassword } from '../api/user'
interface RuleForm {
    email: string
    code: string
    password: string
}

const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
    email: '',
    code: '',
    password: ''
})

// let form = reactive({
//     email: '',
//     code: '',
//     password: ''
// });
const rules = reactive<FormRules<RuleForm>>({
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
    ],
    code: [
        { required: true, message: '请输入验证码', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        // { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
    ]
})
const sendCode = () => {
    if (ruleForm.email) {
        getCode(ruleForm.email).then(() => {
            ElMessage.success('验证码发送成功')
        })
            .catch(error => {
                ElMessage.error('验证码发送失败')
                // 处理错误
                console.error(error);
            });
    }
    else {
        ElMessage.error('邮箱不能为空')
    }
    // 在这里发送验证码
};

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            resetPassword(ruleForm.email, ruleForm.password, ruleForm.code).then(response => {
                if(response.status === 200){
                    ElMessage.success('更改成功')
                }
               else{
                throw new Error('Bad Request');
               }
            }).catch(error => {
                ElMessage.error('更改失败')
                // 处理错误
                console.error(error);
            }); 
            console.log('submit!')
        } else {
            ElMessage.error('更改失败')
            console.log('error submit!', fields)
        }
    })
}
</script>

<style></style>