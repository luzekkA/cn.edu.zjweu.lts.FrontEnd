<template>
    <el-row>
        <el-col :span="6" style="text-align: left;">
            <el-button size="large" @click="changeFile = true; currentTopicId = TopicId">
                更换文件
            </el-button>
        </el-col>
        <el-col :span="6" style="text-align: left;">

            <el-button @click="calculate">计算报告相似度</el-button>

        </el-col>
    </el-row>

    <el-row>
        <el-col :span="8" style="text-align: left;">
            <canvas id="myChart" style="width: 400px; height: 400px;"></canvas>
        </el-col>
        <el-col :span="16" style="text-align: left;">
            <el-table :data="allStudentList" style="width: 100%">
                <el-table-column prop="Id" label="Id" />
                <el-table-column prop="UserName" label="用户名" />
                <el-table-column label="提交情况">
                    <template #default="scope">
                        <div v-if="reportedStudentList.some((student: any) => student.Id === scope.row.Id)">
                            {{ reportedStudentList.find((student: any) => student.Id === scope.row.Id)?.Report[reportedStudentList.find((student: any) => student.Id === scope.row.Id).Report.length-1].Status }}
                        </div>
                        <div v-else>
                            未提交
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <router-link :to="{ path: '/Teacher/ReportDetail', query: { ReportId : reportedStudentList.find((student: any) => student.Id === scope.row.Id)?.Report[reportedStudentList.find((student: any) => student.Id === scope.row.Id).Report.length-1].Id } } ">
                        <!-- <router-link :to="{ path: '/Teacher/ReportDetail', query: { TopicId: 1 } }"> -->
                            <!-- this is report {{ reportedStudentList.find((student: any) => student.Id === scope.row.Id).Report[reportedStudentList.find((student: any) => student.Id === scope.row.Id).Report.length-1].Id }} -->
                            <el-button type="primary" size="large" @click=""
                                :disabled="!reportedStudentList.some((student: any) => student.Id === scope.row.Id)">
                                获取报告详情
                            </el-button>
                        </router-link>
                    </template>
                </el-table-column>
            </el-table>


        </el-col>
    </el-row>

    <!-- <chartkick type="pie" :data="submissionData" /> -->

    <el-drawer v-model="changeFile" title="上传更换文件">
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
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { getReportList, getStudentByClassId, CaclSimilarity } from '../../../api/teacher'
import { devLog } from '../../../utils/devLog';
import { useRoute } from 'vue-router'
import { useUserStore } from '../../../store/useUserStore';
import { ElMessage } from 'element-plus';
import { UpdateTopic } from '../../../api/teacher';
import Chart from 'chart.js/auto';

const userStore = useUserStore()
let reportedStudentList = ref<any>([])
let allStudentList = ref<any>([])
const changeFile = ref()
let mytoken = ref('')
mytoken.value = userStore.token
const route = useRoute()
const CourseId = route.query.CourseId
const ClassId = route.query.ClassId
const TopicId = route.query.TopicId

// let submissionData: {
//     '已提交': 10,
//     '未提交': 20
// }
onMounted(async () => {
    await getReportList(CourseId, ClassId, TopicId).then(data => {
        reportedStudentList.value = data.data.data
        devLog("this is topicList", reportedStudentList.value)
    }).catch(error => {
        console.error('获取已提交学生列表失败', error);
    });
    await getStudentByClassId(ClassId).then(data => {
        allStudentList.value = data.data.data
        devLog("this is topicList", allStudentList.value)
        devLog("this is all student", allStudentList.value.length)
        const ctx = document.getElementById('myChart') as HTMLCanvasElement;
        devLog("reported", reportedStudentList.value.length)
        devLog("", allStudentList.value.length - reportedStudentList.value.length)
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['已提交', '未提交'],
                datasets: [{
                    data: [reportedStudentList.value.length, (allStudentList.value.length - reportedStudentList.value.length)],
                    //data: [1, 0],
                    backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)'],
                }]
            },
            options: {
                responsive: false,
            },
        });
    }).catch(error => {
        console.error('获取学生列表失败', error);
    });

})
const currentTopicId = ref()
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

const calculate = () => {
    let formData = new FormData();
    formData.append("TopicId", TopicId?.toString()||'');
    formData.append("ClassId", ClassId?.toString()||'');
    CaclSimilarity(formData).then(data => {
        devLog("this is data", data)

        if (data.data.code == 200) {
            ElMessage.success('计算相似度成功')
        }
        else {
            ElMessage.error('计算相似度失败')
        }
    }
    ).catch(error => {
        ElMessage.error('计算相似度失败')
        console.error('计算相似度失败', error);
    });
}
</script>
<style></style>