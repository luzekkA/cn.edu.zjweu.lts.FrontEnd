<template>
  <el-col :span="1" :offset="0">
    <el-input v-model="keyword" style="width: 240px; margin-bottom: 10px; margin-top:5px;" size="large"
      placeholder="请输入要查询的课程" :prefix-icon="'Search'" />
  </el-col>
  <el-row>

    <el-col :span="5" v-for="(item, index) in CoursesList.filter(item => item.Name.includes(keyword))"
      :offset="index % 4 > 0 ? 1 : 0">
      <router-link :to="{ path: '/Teacher/ClassList', query: { CourseId: item.Id, CourseName: item.Name } }">
        <div class="myClass">
          <div style="float: left; position: absolute; top:0px; left: 20px; z-index: 2; ">
            <h3 style="color:#fff;">{{ item.Name }}</h3>
          </div>
          <div style="float: left; position: absolute; top:80px; left: 20px; z-index: 2; ">
            <h5 v-for="i in item.TeachersName" style="color:#fff;">{{ i }} <span></span></h5>
          </div>
          <el-image style=" width:280px; height:150px; border-radius: 5px;" :src="'/ClassBackGround.png'" :fit="fit"
            v-bind:style="{ backgroundColor: getColorById(item.Id) }" />
        </div>
      </router-link>
    </el-col>
  </el-row>
  <div style="display: flex; justify-content: center; position: fixed; bottom: 50px; width: 100%; left: 0; ">
    <el-pagination v-model:current-page="currentPage" background layout="prev, pager, next" :page-count="total"
      @current-change="handleCurrentChange" />
  </div>
</template>
<style>
.myClass {
  position: relative;
  margin-top: 25px;
  padding: 0px !important;
}
</style>
<script setup lang="ts">
import { getCourses } from '../../../api/teacher';
import { onMounted, ref } from 'vue'
import { devLog } from '../../../utils/devLog';
const fit = 'fill'
let CoursesList = ref([] as any[])
let keyword = ref('')

//分页用
const currentPage = ref(1)
const total = ref(1)

onMounted(() => {
  getCourses(currentPage.value).then(data => {
    CoursesList.value = data.data.data.Items
    total.value = data.data.data.TotalPages
    devLog("this is CoursesList", CoursesList.value)
  }).catch(error => {
    console.error('获取课程列表失败', error);
  });
})
// const hashString = (str: String = "") => {
//   let colorSet = ['lightseagreen', 'lightsteelblue', 'lightskyblue', 'lightslategrey']
//   let hash = 0;
//   for (let i = 0; i < str.length; i++) {
//     let char = str.charCodeAt(i);
//     hash = ((hash << 5) - hash) + char;
//     hash = hash & hash; // Convert to 32bit integer
//   }
//   return colorSet[Math.abs(hash) % 4]; // Ensure the result is a single-digit number
// }
const getColorById = (id: any) => {
  const colors = ['lightseagreen', 'lightsteelblue', 'lightskyblue', 'lightslategrey']; // Replace this with your own colors
  const index = id % colors.length;
  return colors[index];
}


const handleCurrentChange = () => {
  getCourses(currentPage.value).then(data => {
    CoursesList.value = data.data.data.Items
    total.value = data.data.data.TotalPages
    devLog("this is CoursesList", CoursesList.value)
    if (total.value == 0) {
      total.value = 1
    }
  }).catch(error => {
    console.error('获取课程列表失败', error);
  });
}
</script>