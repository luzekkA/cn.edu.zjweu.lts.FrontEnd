<template>
    <el-col :span="6" style="text-align: left;">
        <el-button @click="rightPart = true">从题库布置题目</el-button>
    </el-col>
    <el-table :data="topicList" style="width: 100%;">
        <el-table-column prop="Id" label="Id" width="100px" />
        <el-table-column prop="Title" label="标题" />
        <el-table-column label="文件预览">
            <template #default="scope">
                <el-button  @click="preview(scope.row.Text)">
                    文件预览
                </el-button>
            </template>
        </el-table-column>
        <el-table-column label="操作">
            <template #default="scope">
                <router-link
                    :to="{ path: '/Teacher/TopicUploadDetail', query: { ClassId: ClassId, CourseId: CourseId, TopicId: scope.row.Id } }">
                    <el-button type="primary"  @click="">
                        查看提交情况
                    </el-button>
                </router-link>
            </template>
        </el-table-column>
    </el-table>
    <el-drawer v-model="rightPart" title="批量导入班级" direction="rtl" size="50%">
        <el-date-picker v-model="deadline" type="datetime" placeholder="Select date and time" />
        <el-table :data="allTopicList" style="width: 100%">
            <el-table-column prop="Id" label="Id" />
            <el-table-column prop="Title" label="标题" />
            <el-table-column label="文件预览">
                <template #default="scope">
                    <el-button size="large" @click="preview(scope.row.Text)">
                        文件预览
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button type="primary" size="large" @click="addTopicToClass(scope.row.Id)">
                        添加到班级
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-drawer>
    <el-drawer v-model="detail" title="文件预览">
        <div v-if="extension == 'xls' || extension == 'xlsx'">
            <vue-office-excel :src="filePath" :options="options" style="height: 650px; " />
        </div>
        <div v-if="extension == 'doc' || extension == 'docx'">
            <vue-office-docx :src="filePath" style="height: 650px; " />
        </div>
        <div v-if="extension == 'pdf'">
            <vue-office-pdf :src="filePath" style="height: 650px; " />
        </div>
    </el-drawer>

    <div style="display: flex; justify-content: center; position: fixed; bottom: 50px; width: 100%; left: 0; ">
        <el-pagination v-model:current-page="currentPage" background layout="prev, pager, next" :page-count="total"
            @current-change="handleCurrentChange" />
    </div>
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { getTopicList, getTopics, AddTopics } from '../../../api/teacher'
import { devLog } from '../../../utils/devLog';
import { useRoute } from 'vue-router'
import { useUserStore } from '../../../store/useUserStore';
import VueOfficeExcel from '@vue-office/excel/lib/v3/index.js'
import VueOfficeDocx from '@vue-office/docx/lib/v3/index.js'
//引入VueOfficePdf组件
import VueOfficePdf from '@vue-office/pdf/lib/v3/index.js'

import { ElMessage } from 'element-plus'


//分页用
const currentPage = ref(1)
const total = ref(1)

const userStore = useUserStore()
let topicList = ref([])
//题库题目列表
let allTopicList = ref([])
const rightPart = ref()
let mytoken = ref('')
mytoken.value = userStore.token
const route = useRoute()
const CourseId = route.query.CourseId
const ClassId = route.query.ClassId

const options = {
    xls: false, //预览xlsx文件设为false；预览xls文件设为true
    minColLength: 0, // excel最少渲染多少列，如果想实现xlsx文件内容有几列，就渲染几列，可以将此值设置为0.
    minRowLength: 0, // excel最少渲染多少行，如果想实现根据xlsx实际函数渲染，可以将此值设置为0.
    widthOffset: 10, //如果渲染出来的结果感觉单元格宽度不够，可以在默认渲染的列表宽度上再加 Npx宽
    heightOffset: 10, //在默认渲染的列表高度上再加 Npx高
    beforeTransformData: (workbookData: any) => workbookData,
    transformData: (workbookData: any) => workbookData //将获取到的excel数据进行处理之后且渲染到页面之前，可通过transformData对即将渲染的数据及样式进行修改，此时每个单元格的text值就是即将渲染到页面上的内容
};
onMounted(() => {

    getTopicList(CourseId, ClassId,currentPage.value).then(data => {
        topicList.value = data.data.data.Items
        total.value = data.data.data.TotalPages
        devLog("this is topicList", topicList.value)
    }).catch(error => {
        console.error('获取题目列表失败', error);
    });
    getTopics(CourseId).then(data => {
        allTopicList.value = data.data.data
        devLog("this is topicList", allTopicList.value)
    }).catch(error => {
        console.error('获取题目列表失败', error);
    });

})
const detail = ref()
const extension = ref('')
const filePath = ref('')
const preview = (text: string) => {
    detail.value = true
    filePath.value = text
    devLog("this is file Path", text)
    try {
        const url = new URL(text);
        const pathname = url.pathname;
        const parts = pathname.split('.');
        extension.value = parts.pop() || '';
    } catch (error) {
        console.error('Invalid URL:', text);
    }
}
const deadline = ref('')
const addTopicToClass = (topicId: string) => {
    if (deadline.value == '' || deadline.value == null) {
        ElMessage.error('请选择日期')
        devLog("this is deadline", deadline.value)
    }
    else {
        const deadlineDate = new Date(deadline.value);
        const deadlineISO = deadlineDate.toISOString();
        AddTopics(topicId, ClassId, deadlineISO).then(() => {
            location.reload()
            ElMessage.success('添加题目成功')
        }).catch(error => {
            console.error('添加题目失败', error);
        });
    }


}

const handleCurrentChange = () => {
    getTopicList(CourseId, ClassId,currentPage.value).then(data => {
        topicList.value = data.data.data.Items
        total.value = data.data.data.TotalPages
        devLog("this is topicList", topicList.value)
    }).catch(error => {
        console.error('获取题目列表失败', error);
    });
}
</script>
<style></style>