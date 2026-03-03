<template>
  <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" status-icon :rules="rules" label-width="auto"
    class="demo-ruleForm">
    <el-form-item label="用户Id" prop="id">
      <el-input v-model="ruleForm.id" autocomplete="off" disabled="true" />
    </el-form-item>
    <el-form-item label="用户名" prop="name">
      <el-input v-model="ruleForm.name" autocomplete="off" disabled="true" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-row style="width:100%">
        <el-col :span="16">
          <el-input v-model="ruleForm.email" autocomplete="off" />
        </el-col>
        <el-col :span="8">
          <el-button @click="postEmail">更新邮箱</el-button>
        </el-col>
      </el-row>
    </el-form-item>
    <el-form-item label="用户类型" prop="type">
      <el-input v-model="ruleForm.type" autocomplete="off" disabled="true" />
    </el-form-item>
    <!-- <el-form-item>
      <el-button type="primary" @click="submitForm(ruleFormRef)">
        提交更改
      </el-button>
      <el-button @click="resetForm(ruleFormRef)">重置</el-button>
    </el-form-item> -->
  </el-form>

</template>

<script setup lang='ts'>
// import { useRoute } from 'vue-router'
//import { getAllClass, getUserInfo, updateStudentInfo, updateTeacherInfo } from '../../../api/admin'
import { onMounted, ref, reactive } from 'vue'
import { getInfo,addEmail } from '../api/user';
import type { FormInstance, FormRules } from 'element-plus'
import { devLog } from '../utils/devLog';
import { ElMessage } from 'element-plus';
const ruleFormRef = ref<FormInstance>()
interface RuleForm {
  id: string
  name: string
  type: string
  email: string


}
const ruleForm = reactive({
  id: '',
  name: '',
  type: '',
  email: ''
})

const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  id: [
    { required: true, message: '请输入Id', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请输入用户类型', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
  ]
})


onMounted(() => {
  getInfo().then(data => {
    devLog("this is getInfo data", data)
    ruleForm.id = data.data.id
    ruleForm.name = data.data.userName
    ruleForm.type = data.data.role
    ruleForm.email= data.data.email
  }).catch(error => {
    console.error('获取用户失败', error);
  });


})


const postEmail = ()=>{
  addEmail(ruleForm.email).then(()=>{
    ElMessage.success("更改邮箱成功")
  }).catch(error => {
    ElMessage.error("更改邮箱失败")
    devLog("ERROR",error)
  });
}
// interface StudentInfo{
//   id:string,
//   userName:string,
//   classId:number
// }
// const submitForm = async (formEl: FormInstance | undefined) => {
//   if (!formEl) return
//   await formEl.validate((valid, fields) => {
//     if (valid) {
//       console.log('submit!')
//     } else {
//       console.log('error submit!', fields)
//     }
//   })
// }

// const resetForm = (formEl: FormInstance | undefined) => {
//   if (!formEl) return
//   formEl.resetFields()
//   window.location.reload();
// }
</script>
<style></style>