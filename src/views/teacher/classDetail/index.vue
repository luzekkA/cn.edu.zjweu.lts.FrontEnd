<template>
    <el-col :span="6" style="text-align: left;">
        <el-button @click="rightPart = true">从题库布置题</el-button>
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
                <router-link :to="{
                    path: '/Teacher/TopicUploadDetail',
                    query: {
                        ClassId: ClassId,
                        CourseId: CourseId,
                        TopicId: scope.row.Id,
                        TopicName: scope.row.Title,
                        CourseName: CourseName
                    }
                }">
                    <el-button type="primary"  @click="">
                        查看提交情况
                    </el-button>
                </router-link>
                <el-button
                    style="margin-left: 8px;"
                    :loading="downloadingTopicId === scope.row.Id"
                    :disabled="downloadingTopicId === scope.row.Id"
                    @click="handleDownloadTopicArchive(scope.row.Id, scope.row.Title)"
                >
                    下载题目附件
                </el-button>
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
                        添加到班�?
                    </el-button>
            </template>
            </el-table-column>
        </el-table>
    </el-drawer>
    <el-drawer v-model="detail" title="文件预览">
        <div v-if="extension == 'xls' || extension == 'xlsx'" style="width: 100%; height: 650px; overflow: auto;">
            <vue-office-excel :src="filePath" :options="options" style="height: 100%;" />
        </div>
        <div v-if="extension == 'doc' || extension == 'docx'" style="width: 100%; height: 650px; overflow: auto;">
            <vue-office-docx :src="filePath" style="height: 100%;" />
        </div>
        <div v-if="extension == 'pdf'" style="width: 100%; height: 650px; overflow: auto;">
            <vue-office-pdf :src="filePath" style="height: 100%;" />
        </div>
    </el-drawer>

    <div style="display: flex; justify-content: center; position: fixed; bottom: 50px; width: 100%; left: 0; ">
        <el-pagination v-model:current-page="currentPage" background layout="prev, pager, next" :page-count="total"
            @current-change="handleCurrentChange" />
    </div>
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { getTopicList, getTopics, AddTopics, downloadTopicArchive } from '../../../api/teacher'
import { devLog } from '../../../utils/devLog';
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../../store/useUserStore';
import VueOfficeExcel from '@vue-office/excel/lib/v3/index.js'
import VueOfficeDocx from '@vue-office/docx/lib/v3/index.js'
//引入VueOfficePdf组件
import VueOfficePdf from '@vue-office/pdf/lib/v3/index.js'

import { ElMessage } from 'element-plus'


//分页�?
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
const router = useRouter()
const CourseId = route.query.CourseId
const ClassId = route.query.ClassId
const CourseName = route.query.CourseName
const downloadingTopicId = ref<number | string | null>(null)

const options = {
    xls: false, //预览xlsx文件设为false；预览xls文件设为true
    minColLength: 3, // excel最少渲染多少列
    minRowLength: 10, // excel最少渲染多少行
    widthOffset: 0, //移除额外宽度
    heightOffset: 0, //移除额外高度
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

const parseDownloadError = async (errorData: any) => {
    try {
        const text = await errorData?.text?.();
        if (!text) return '下载失败';
        const json = JSON.parse(text);
        return json?.msg || '下载失败';
    } catch {
        return '下载失败';
    }
}

const getFileNameFromDisposition = (disposition: string) => {
    const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i);
    const rawName = match?.[1] || match?.[2];
    if (!rawName) return '';
    try {
        return decodeURIComponent(rawName);
    } catch {
        return rawName;
    }
}

const buildFallbackArchiveName = (topicTitle?: string) => {
    const safeCourseName = String(CourseName || '').trim().replace(/[\\/:*?"<>|]/g, '_');
    const safeClassId = String(ClassId || '').trim().replace(/[\\/:*?"<>|]/g, '_');
    const safeTopicTitle = String(topicTitle || '').trim().replace(/[\\/:*?"<>|]/g, '_');
    const parts = [safeCourseName, safeClassId, safeTopicTitle].filter(Boolean);
    const prefix = parts.join('_');
    return `${prefix || 'archive'}_archive.zip`;
}

const handleDownloadTopicArchive = async (topicId: number | string, topicTitle?: string) => {
    if (downloadingTopicId.value === topicId) return;
    downloadingTopicId.value = topicId;

    try {
        const res = await downloadTopicArchive(CourseId, ClassId, topicId);
        const contentType = String(res?.headers?.['content-type'] || '').toLowerCase();

        if (contentType.includes('application/json')) {
            const message = await parseDownloadError(res.data);
            throw new Error(message);
        }

        const disposition = String(
            res?.headers?.['content-disposition']
            || res?.headers?.['Content-Disposition']
            || ''
        );
        const fileName = getFileNameFromDisposition(disposition) || buildFallbackArchiveName(topicTitle);

        const blobUrl = URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);

        ElMessage.success('下载成功');
    } catch (error: any) {
        if (error?.response?.status === 401) {
            ElMessage.error('登录状态失效，请重新登录');
            router.push('/');
            return;
        }

        if (error?.response?.data instanceof Blob) {
            const message = await parseDownloadError(error.response.data);
            ElMessage.error(message);
            return;
        }

        ElMessage.error(error?.message || '下载失败');
    } finally {
        downloadingTopicId.value = null;
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




