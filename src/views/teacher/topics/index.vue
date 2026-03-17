<template>

    <el-col :span="1" :offset="0">
        <el-input v-model="keyword" style="width: 240px; margin-bottom: 10px; margin-top:5px;" size="large"
            placeholder="请输入要查询的题目" :prefix-icon="'Search'" />
    </el-col>



    <el-table :data="List" style="width: 100%">
        <el-table-column prop="Id" label="Id" />
        <el-table-column prop="Title" label="标题" />
        <el-table-column label="文件预览">
            <template #default="scope">
                <el-button size="large" @click="preview(scope.row.Text)">
                    文件预览
                </el-button>
            </template>
        </el-table-column>
        <el-table-column label="更换文件">
            <template #default="scope">
                <el-button size="large" @click="changeFile = true;currentTopicId = scope.row.Id">
                    更换文件
                </el-button>
            </template>
        </el-table-column>
    </el-table>

    <el-drawer v-model="changeFile" title="上传更换文件" >
        <el-upload class="upload-demo" drag :http-request="upload" multiple name="file">
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
    </el-drawer>
    <el-drawer v-model="detail" title="文件预览" >
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
    <!-- <div style="display: flex; justify-content: center; position: fixed; bottom: 50px; width: 100%; left: 0; ">
        <el-pagination v-model:current-page="currentPage" background layout="prev, pager, next" :page-count="total"
            @current-change="handleCurrentChange" />
    </div> -->
</template>

<script setup lang='ts'>
import { onMounted, ref, watch } from 'vue'
import { getTopics, UpdateTopic } from '../../../api/teacher';
import { devLog } from '../../../utils/devLog';
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus';
import VueOfficeExcel from '@vue-office/excel/lib/v3/index.js'
import VueOfficeDocx from '@vue-office/docx/lib/v3/index.js'
//引入VueOfficePdf组件
import VueOfficePdf from '@vue-office/pdf/lib/v3/index.js'
const options = {
    xls: false, //预览xlsx文件设为false；预览xls文件设为true
    minColLength: 3, // excel最少渲染多少列
    minRowLength: 10, // excel最少渲染多少行
    widthOffset: 0, //移除额外宽度
    heightOffset: 0, //移除额外高度
    beforeTransformData: (workbookData: any) => workbookData,
    transformData: (workbookData: any) => workbookData //将获取到的excel数据进行处理之后且渲染到页面之前，可通过transformData对即将渲染的数据及样式进行修改，此时每个单元格的text值就是即将渲染到页面上的内容
};
let keyword = ref('')
let topicList = ref<any>([])
let List = ref<any>([])
const route = useRoute()

const changeFile = ref(false)
const detail = ref(false)
//分页用
// const currentPage = ref(1)
// const total = ref(1)
const currentTopicId = ref('')
const CourseId = route.query.CourseId
onMounted(() => {
    getTopics(CourseId).then(data => {
        topicList.value = data.data.data
        List.value = data.data.data
        // total.value = data.data.data.TotalPages
        devLog("this is topicList", topicList.value)

        // if (total.value == 0) {
        //     total.value = 1
        // }
    }).catch(error => {
        console.error('获取题目列表失败', error);
    });
})
const change = () => {
    List.value = topicList.value.filter((topic: any) => topic.Title.includes(keyword.value));
}

watch(keyword, () => {
    change();
})
const extension = ref('')
const filePath = ref('')
const preview = (text: string) => {
    detail.value = true
    filePath.value = text
    devLog("this is file Path",text)
    try {
        const url = new URL(text);
        const pathname = url.pathname;
        const parts = pathname.split('.');
        extension.value = parts.pop() || '';
    } catch (error) {
        console.error('Invalid URL:', text);
    }
}

const upload = (uploadInfo: any) => {
    const { file } = uploadInfo;
    let formData = new FormData();
    formData.append("file", file);
    formData.append("topicId", currentTopicId.value);
    UpdateTopic(formData).then(data => {
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
</script>
<style></style>