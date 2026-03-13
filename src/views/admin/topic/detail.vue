<template>
    <el-row>
        <el-col :span="12">
            <div v-if="extension == 'xls' || extension == 'xlsx'">
                <vue-office-excel :src="ruleForm.text" :options="options" style="height: 650px; " />
            </div>
            <div v-if="extension == 'doc' || extension == 'docx'">
                <vue-office-docx :src="ruleForm.text" style="height: 650px; " />
            </div>
            <div v-if="extension == 'pdf' ">
                <vue-office-pdf :src="ruleForm.text" style="height: 650px; " />
            </div>
        </el-col>
        <el-col :span="12">
            <div>
                <el-form :ref="googleDocsViewerUrl" style="max-width: 600px" :model="ruleForm" status-icon
                    :rules="rules" label-width="auto" class="demo-ruleForm">
                    <el-form-item label="题目标题" prop="title">
                        <el-input v-model="ruleForm.title" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="上传文件">
                        <el-upload action="https://example.com/path/to/upload/api">
                            <el-button slot="trigger" size="small" type="primary">点击上传</el-button>
                            <el-button style="margin-left: 10px;" size="small" type="success">上传到服务器</el-button>
                            <div slot="tip" class="el-upload__tip">只支持 jpg/png 文件，且不超过500kb</div>
                        </el-upload>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitForm(ruleFormRef)">
                            提交更改
                        </el-button>
                        <el-button @click="resetForm(ruleFormRef)">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-col>
    </el-row>
</template>

<script setup lang='ts'>
import { useRoute } from 'vue-router'
import { getTopicInfo } from '../../../api/admin'
import { onMounted, ref, reactive } from 'vue'
import { devLog } from '../../../utils/devLog';
import type { FormInstance, FormRules } from 'element-plus'
import VueOfficeExcel from '@vue-office/excel/lib/v3/index.js'
import VueOfficeDocx from '@vue-office/docx/lib/v3/index.js'
import VueOfficePdf from '@vue-office/pdf/lib/v3/index.js'

const options = {
    xls: false, //预览xlsx文件设为false；预览xls文件设为true
    minColLength: 0, // excel最少渲染多少列，如果想实现xlsx文件内容有几列，就渲染几列，可以将此值设置为0.
    minRowLength: 0, // excel最少渲染多少行，如果想实现根据xlsx实际函数渲染，可以将此值设置为0.
    widthOffset: 10, //如果渲染出来的结果感觉单元格宽度不够，可以在默认渲染的列表宽度上再加 Npx宽
    heightOffset: 10, //在默认渲染的列表高度上再加 Npx高
    beforeTransformData: (workbookData: any) => workbookData,
    transformData: (workbookData: any) => workbookData //将获取到的excel数据进行处理之后且渲染到页面之前，可通过transformData对即将渲染的数据及样式进行修改，此时每个单元格的text值就是即将渲染到页面上的内容
};

const ruleFormRef = ref<FormInstance>()

interface RuleForm {
    id: string
    text: string
    title: string
}
const ruleForm = reactive({
    id: '',
    text: '',
    title: '',
})
// 文件的 URL
const fileUrl = ref(ruleForm.text);
// Google Docs Viewer 的 URL
const googleDocsViewerUrl = ref(`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl.value)}&embedded=true`);
const rules = reactive<FormRules<RuleForm>>({
    title: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
    ]
})
const route = useRoute()
const topicId = route.query.topicId
const extension = ref('')
onMounted(() => {

    getTopicInfo(topicId).then(data => {
        devLog("this is data", data.data)
        ruleForm.id = data.data.data.Id
        ruleForm.text = data.data.data.Text
        ruleForm.title = data.data.data.Title
        devLog("this is text", ruleForm.text)
        const url = new URL(ruleForm.text); // 替换为你的链接
        const pathname = url.pathname;
        const parts = pathname.split('.');
        extension.value = parts.pop() || '';
    }).catch(error => {
        console.error('获取题目信息失败', error);
    });
})


const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            console.log('submit!')
        } else {
            console.log('error submit!', fields)
        }
    })
}

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    window.location.reload();
}
</script>
<style></style>