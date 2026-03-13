<template>

    <el-row>
        <el-col :span="12">
            <div style="margin-left: 20px;" v-if="topicExtension == 'xls' || topicExtension == 'xlsx'">
                <vue-office-excel :src="text" :options="options" style="height: 650px; " />
            </div>
            <div style="margin-left: 20px;" v-if="topicExtension == 'doc' || topicExtension == 'docx'">
                <vue-office-docx :src="text" style="height: 650px; " />
            </div>
            <div style="margin-left: 20px;" v-if="topicExtension == 'pdf'">
                <vue-office-pdf :src="text" style="height: 650px; " />
            </div>
        </el-col>
        <el-col :span="12">
            <!-- <div>{{ titile }}
            </div> -->
            <el-row>
                <h2 style="margin-left: 50px;">题目标题：{{ titile }}</h2>
            </el-row>
            <el-row>
                <el-button style="margin-left: 50px;" type="primary" @click="downloadFile(text)">下载文件</el-button>
            </el-row>
            <el-button v-if="!reportStatus" @click="rightPart = true">上传报告</el-button>
            <el-button v-if="reportStatus" @click="rightPartUpdate = true;">
                更新报告
            </el-button>
            <el-button v-if="reportStatus" @click="handleClick">
                提交情况
            </el-button>
        </el-col>
    </el-row>
    <el-drawer v-model="rightPart" title="上传报告" direction="rtl" size="50%">
        <el-form ref="formRef" style="max-width:100%" :model="dynamicValidateForm" label-width="auto"
            class="demo-dynamic">
            <el-form-item label="报告成员学号" :rules="[{ required: true, message: '请输入同组成员学号', trigger: 'blur', }]">
                <el-input style="width: 300px !important" v-model="userStore.id" disabled />
            </el-form-item>
            <el-form-item v-for="(domain, index) in dynamicValidateForm.domains" :key="domain.key"
                :label="'同组成员' + (index + 1)" :prop="'domains.' + index + '.value'"
                :rules="{ required: true, message: '请输入同组成员学号', trigger: 'blur', }">
                <el-row :gutter="20">
                    <el-col :span="22">
                        <el-input v-model="domain.value" />
                    </el-col>
                    <el-col :span="2">
                        <el-button class="mt-2" @click.prevent="removeDomain(domain)">
                            删除同组成员
                        </el-button>
                    </el-col>
                </el-row>
            </el-form-item>
            <el-form-item>
                <el-button @click="addDomain">添加同组成员</el-button>
            </el-form-item>
        </el-form>



        <el-form-item label="报告文件">
            <el-upload :headers="{ 'Authorization': mytoken }" drag multiple :auto-upload="true" :http-request="input">
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
                <el-button type="primary" @click="submitForm(formRef)">
                    上传
                </el-button>
                <el-button @click="resetForm(formRef)">重置</el-button>
            </div>
        </el-form-item>
    </el-drawer>

    <el-drawer v-model="rightPartUpdate" title="更新报告" direction="rtl" size="50%">
        <el-form ref="formRef" style="max-width:100%" :model="dynamicValidateForm" label-width="auto"
            class="demo-dynamic">
            <el-form-item label="报告文件">
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
                    <el-button type="primary" @click="updateForm(formRef)">
                        上传
                    </el-button>
                    <el-button @click="resetForm(formRef)">重置</el-button>
                </div>
            </el-form-item>
        </el-form>
    </el-drawer>






    <el-drawer v-model="rightPart2" title="提交情况" direction="rtl" size="50%">
        <el-row style="margin-left: 20px;">
            <el-text class="mx-1" size="large">报告分数：{{ reportInfo.Score }}</el-text>
        </el-row>
        <el-row style="margin-left: 20px;">
            <el-text class="mx-1" size="large">报告相似度：{{ reportInfo.Similarity }}</el-text>
        </el-row>
        <el-row style="margin-left: 20px; margin-top: 20px; margin-bottom: 20px;">
            <el-text class="mx-1" size="large">我的报告：</el-text>
            <el-button style="margin-left: 50px;" type="primary" @click="downloadFile(reportInfo.File)">下载文件</el-button>
        </el-row>
        <div style="margin-left: 20px;" v-if="extension == 'xls' || extension == 'xlsx'">
            <vue-office-excel :src="reportInfo.File" :options="options" style="height: 650px; " />
        </div>
        <div style="margin-left: 20px;" v-if="extension == 'doc' || extension == 'docx'">
            <vue-office-docx :src="reportInfo.File" style="height: 650px; " />
        </div>
        <div style="margin-left: 20px;" v-if="extension == 'pdf'">
            <vue-office-pdf :src="reportInfo.File" style="height: 650px; " />
        </div>
        <!-- {{ reportInfo.File }} -->
    </el-drawer>
</template>

<script setup lang='ts'>
import { useRoute } from 'vue-router'
import { getTopicInfo, getReportInfo, uploadReport, updateReport } from '../../../api/student'
import { onMounted, ref, reactive } from 'vue'
import { devLog } from '../../../utils/devLog';
import { useUserStore } from '../../../store/useUserStore';
import { ElMessage, type FormInstance } from 'element-plus'
import VueOfficeExcel from '@vue-office/excel/lib/v3/index.js'
import VueOfficeDocx from '@vue-office/docx/lib/v3/index.js'
//引入VueOfficePdf组件
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
const userStore = useUserStore()

let rightPart = ref(false)
let rightPart2 = ref(false)
let rightPartUpdate = ref(false)


const text = ref('')
const titile = ref('')
const reportStatus = ref()
let mytoken = ref('')
mytoken.value = userStore.token
const route = useRoute()
const TopicId = route.query.TopicId
const reportInfo = reactive({ File: '', Similarity: 0, Score: 0, Status: '', Id: '' })

const file = ref("")
//表单
const formRef = ref<FormInstance>()
const dynamicValidateForm = reactive<{
    domains: DomainItem[]
}>({
    domains: [
        // {
        //     key: 1,
        //     value: '',
        // },
    ]
})

interface DomainItem {
    key: number
    value: string
}

const removeDomain = (item: DomainItem) => {
    const index = dynamicValidateForm.domains.indexOf(item)
    if (index !== -1) {
        dynamicValidateForm.domains.splice(index, 1)
    }
}

const addDomain = () => {
    dynamicValidateForm.domains.push({
        key: Date.now(),
        value: '',
    })
}
const topicExtension = ref('')
//const topicFilePath = ref('')
onMounted(() => {

    getTopicInfo(TopicId).then(data => {
        devLog(data.data)
        text.value = data.data.data.Text
        titile.value = data.data.data.Title
        reportStatus.value = data.data.data.reportStatus

        try {
            const url = new URL(text.value);
            const pathname = url.pathname;
            const parts = pathname.split('.');
            topicExtension.value = parts.pop() || '';
        } catch (error) {
            console.error('Invalid URL:', text.value);
        }

        if (reportStatus.value) {
            getReportInfo(TopicId).then(data => {
                devLog(data.data)
                reportInfo.File = data.data.data.File
                reportInfo.Id = data.data.data.Id
                reportInfo.Score = data.data.data.Score
                reportInfo.Similarity = data.data.data.Similarity
                // //filePath.value =  data.data.data.File
                // //devLog("this is file Path", text)
                // try {
                //     const url = new URL(reportInfo.File);
                //     const pathname = url.pathname;
                //     const parts = pathname.split('.');
                //     extension.value = parts.pop() || '';
                // } catch (error) {
                //     console.error('Invalid URL:', reportInfo.File);
                // }

            }).catch(error => {
                console.error('获取报告信息失败', error);
            });
        }

    }).catch(error => {
        console.error('获取题目信息失败', error);
    });
})
const extension = ref('')
// const filePath = ref('')
const handleClick = () => {
    rightPart2.value = true
    if (reportStatus.value) {
        getReportInfo(TopicId).then(data => {
            devLog(data.data)
            reportInfo.File = data.data.data.File
            reportInfo.Id = data.data.data.Id
            reportInfo.Score = data.data.data.Score
            reportInfo.Similarity = data.data.data.Similarity
            //filePath.value =  data.data.data.File
            //devLog("this is file Path", text)
            try {
                const url = new URL(reportInfo.File);
                const pathname = url.pathname;
                const parts = pathname.split('.');
                extension.value = parts.pop() || '';
            } catch (error) {
                console.error('Invalid URL:', reportInfo.File);
            }

        }).catch(error => {
            console.error('获取报告信息失败', error);
        });
    }
}


const input = (uploadInfo: any) => {
    if (uploadInfo == undefined || uploadInfo == "") {
        ElMessage.error('请选择文件')
    } else {

        // 现在你可以使用 file 变量了
        file.value = uploadInfo.file;
        devLog("file is ok", file.value)
    }
}

const upload = (uploadInfo: any) => {
    //devLog("this is up")
    if (uploadInfo == undefined || uploadInfo == "") {
        ElMessage.error('请选择文件')
    }
    //const { file } = uploadInfo;
    let formData = new FormData();
    formData.append("file", uploadInfo);
    let valuesArray = dynamicValidateForm.domains.map((domain: DomainItem) => domain.value);
    //formData.append("Title", ruleForm.title);
    devLog("this is studentlist", valuesArray)
    devLog("this is studentlist", valuesArray.push(userStore.id))
    formData.append("StudentIds", "[" + valuesArray.toString() + "]")
    formData.append("TopicId", TopicId?.toString() || "");
    uploadReport(formData).then(data => {
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

const update = (uploadInfo: any) => {
    devLog("this is update", uploadInfo)
    if (uploadInfo == undefined || uploadInfo == "") {
        ElMessage.error('请选择文件')
    }
    //const { file } = uploadInfo;
    let formData = new FormData();
    formData.append("file", uploadInfo);
    devLog("this is reportId", reportInfo.Id)
    updateReport(formData, reportInfo.Id).then(data => {
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

const updateForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            devLog("this is file", file.value)
            update(file.value)
            console.log('submit!')
        } else {
            console.log('error submit!', fields)
        }
    })
}

const downloadFile = (url: any) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop();  // Use the last part of the URL as the file name
    link.click();
}

</script>
<style></style>