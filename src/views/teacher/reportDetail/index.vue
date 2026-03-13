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
                <h2 style="margin-left: 50px;">题目标题：{{ reportInfo?.Topic?.Title }}</h2>
            </el-row>
            <el-row>
                <el-table :data="reportInfo?.Students" style="width: 100%">
                    <el-table-column prop="Id" label="Id" />
                    <el-table-column prop="UserName" label="学生姓名" />
                </el-table>
            </el-row>
            <el-row style="margin-top:50px;">
                <el-text v-if="reportInfo?.Similarity" class="mx-1" size="large">报告查重率：{{reportInfo?.Similarity}}</el-text>
            </el-row>
            <el-row v-if="!reportInfo?.Status.search('未批改')" style="margin-top:50px;">
                <el-input v-model="score" style="width: 240px" placeholder="请打分" />
                <el-button @click="getScore">打分</el-button>
            </el-row>
            <el-row v-else style="margin-top:50px;">
                <el-text class="mx-1" size="large">报告成绩：{{reportInfo?.Score }}</el-text>
                
            </el-row>
        </el-col>
    </el-row>
    <!-- {{ reportInfo }} -->
</template>

<script setup lang='ts'>
import { onMounted, ref  } from 'vue'
import { getReport,makeScore } from '../../../api/teacher'
import { devLog } from '../../../utils/devLog';
import { useRoute } from 'vue-router'
import { useUserStore } from '../../../store/useUserStore';
import VueOfficeExcel from '@vue-office/excel/lib/v3/index.js'
import VueOfficeDocx from '@vue-office/docx/lib/v3/index.js'
//引入VueOfficePdf组件
import VueOfficePdf from '@vue-office/pdf/lib/v3/index.js'
import { ElMessage } from 'element-plus';
const options = {
    xls: false, //预览xlsx文件设为false；预览xls文件设为true
    minColLength: 0, // excel最少渲染多少列，如果想实现xlsx文件内容有几列，就渲染几列，可以将此值设置为0.
    minRowLength: 0, // excel最少渲染多少行，如果想实现根据xlsx实际函数渲染，可以将此值设置为0.
    widthOffset: 10, //如果渲染出来的结果感觉单元格宽度不够，可以在默认渲染的列表宽度上再加 Npx宽
    heightOffset: 10, //在默认渲染的列表高度上再加 Npx高
    beforeTransformData: (workbookData: any) => workbookData,
    transformData: (workbookData: any) => workbookData //将获取到的excel数据进行处理之后且渲染到页面之前，可通过transformData对即将渲染的数据及样式进行修改，此时每个单元格的text值就是即将渲染到页面上的内容
};


const score = ref()

const userStore = useUserStore()
interface Topic{
    Title:string;
    Id:string;
}
interface Student{
    Id:string;
    UserName:string;
}
interface ReportInfo{
    Id:string;
    File:string;
    Score:string;
    Similarity:string;
    Status:string;
    Topic:Topic;
    Students:Student[]

}
let reportInfo = ref<ReportInfo>()
let mytoken = ref('')
mytoken.value = userStore.token
const route = useRoute()
const ReportId = route.query.ReportId

const topicExtension = ref('')
//const topicFilePath = ref('')
const text = ref('')
onMounted(() => {

    getReport(ReportId).then(data => {
        reportInfo.value = data.data.data
        text.value = reportInfo.value?.File || ""
        devLog("this is topicList", reportInfo.value)
        try {
            const url = new URL(text.value);
            const pathname = url.pathname;
            const parts = pathname.split('.');
            topicExtension.value = parts.pop() || '';
        } catch (error) {
            console.error('Invalid URL:', text.value);
        }
    }).catch(error => {
        console.error('获取班级列表失败', error);
    });
})

const getScore = ()=>{
    if(!score.value){
        ElMessage.error('请输入分数')
        return 
    }
    let formData = new FormData();
    formData.append("reportId", reportInfo.value?.Id||"");
    formData.append("score", score.value);
    makeScore(formData).then(() => {
        ElMessage.success('打分成功')
        
    }).catch(error => {
        ElMessage.error('打分失败')
        console.error('打分失败', error);
    });
}
</script>
<style></style>