<template>
    <el-row>
        <el-col :span="6" style="text-align: left;">
            <el-button @click="rightPart = true">添加题目到题库</el-button>
        </el-col>
        <el-col :span="6" style="text-align: left;">
            <router-link :to="{ path: '/Teacher/Topics', query: { CourseId: CourseId, CourseName: CourseName } }">
                <el-button>查看题库</el-button>
            </router-link>
        </el-col>
    </el-row>

    <el-table :data="topicList" style="width: 100%">
        <el-table-column prop="Id" label="Id" />
        <el-table-column prop="Name" label="标题" />
        <el-table-column label="操作">
            <template #default="scope">
                <router-link
                    :to="{ path: '/Teacher/ClassDetail', query: { ClassId: scope.row.Id, CourseId: CourseId, CourseName: CourseName } }">
                    <el-button size="large" @click="">
                        进入班级
                    </el-button>
                </router-link>
            </template>
        </el-table-column>
    </el-table>
    <el-drawer v-model="rightPart" title="添加题目到题库" direction="rtl" size="50%">
        <el-form ref="ruleFormRef" style="width:100%;" :model="ruleForm" :rules="rules" label-width="auto"
            class="demo-ruleForm" status-icon>
            <el-form-item label="标题" prop="title">
                <el-input v-model="ruleForm.title" />
            </el-form-item>
            <el-form-item label="题目文件">
                <el-upload :headers="{ 'Authorization': mytoken }" drag multiple :auto-upload="true"
                    :http-request="input">
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">
                        Drop file here or <em>click to upload</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">
                            Excel files with a size less than 500kb
                        </div>
                    </template>
                </el-upload>
            </el-form-item>
            <el-form-item>
                <div style="margin-left: 250px;">
                    <el-button type="primary" @click="submitForm(ruleFormRef)">
                        上传
                    </el-button>
                    <el-button @click="resetForm(ruleFormRef)">重置</el-button>
                </div>
            </el-form-item>
        </el-form>



    </el-drawer>
    <div style="display: flex; justify-content: center; position: fixed; bottom: 50px; width: 100%; left: 0; ">
        <el-pagination v-model:current-page="currentPage" background layout="prev, pager, next" :page-count="total"
            @current-change="handleCurrentChange" />
    </div>
</template>

<script setup lang='ts'>
import { onMounted, ref, reactive } from 'vue'
import { getClassList, AddTopicToCourse } from '../../../api/teacher'
import { devLog } from '../../../utils/devLog';
import { useRoute } from 'vue-router'
import { useUserStore } from '../../../store/useUserStore';
//分页用
const currentPage = ref(1)
const total = ref(1)

const file = ref("")
//表单
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
interface RuleForm {
    title: string,
}
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
    title: '',
})
const rules = reactive<FormRules<RuleForm>>({
    title: [
        { required: true, message: '请输入题目标题', trigger: 'blur' },
    ],
})

const userStore = useUserStore()
let topicList = ref([])
const rightPart = ref()
let mytoken = ref('')
const route = useRoute()
mytoken.value = userStore.token
const CourseId = route.query.CourseId
const CourseName = route.query.CourseName
onMounted(() => {
    getClassList(CourseId, currentPage.value).then(data => {
        topicList.value = data.data.data.Items
        total.value = data.data.data.TotalPages
        devLog("this is topicList", topicList.value)
    }).catch(error => {
        console.error('获取班级列表失败', error);
    });
})

const input = (uploadInfo: any) => {
    if (uploadInfo == undefined || uploadInfo == "") {
        ElMessage.error('请选择文件')
    } else {

        // 现在你可以使用 file 变量了
        file.value = uploadInfo.file;
    }
}

const upload = (uploadInfo: any) => {
    if (uploadInfo == undefined || uploadInfo == "") {
        ElMessage.error('请选择文件')
    }
    //const { file } = uploadInfo;
    let formData = new FormData();
    formData.append("file", uploadInfo);
    formData.append("Title", ruleForm.title);
    formData.append("CourseId", CourseId?.toString() || "");
    AddTopicToCourse(formData).then(data => {
        devLog("this is data", data)

        if (data.data.code == 200) {
            ElMessage.success('上传成功')
        }
        else {
            ElMessage.error('上传失败')
        }
    }
    ).catch(error => {
        ElMessage.error('上传失败')
        console.error('上传失败', error);
    });
}

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            devLog("this is file", file.value)
            upload(file.value)
            console.log('submit!')
        } else {
            console.log('error submit!', fields)
        }
    })
}

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
}
const handleCurrentChange = () => {
    getClassList(CourseId, currentPage.value).then(data => {
        topicList.value = data.data.data.Items
        total.value = data.data.data.TotalPages
        devLog("this is topicList", topicList.value)
    }).catch(error => {
        console.error('获取班级列表失败', error);
    });
}

</script>
<style></style>