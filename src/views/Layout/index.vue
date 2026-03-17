<template>
    <el-container class="container">
      <el-header id="header">
        <Navbar />
      </el-header>
      <el-container>
        <el-aside id="aside">
        <Aside :name="userStore.name" :id="userStore.id"/>
        </el-aside>
        <el-main>
          <!-- 面包屑导航 -->
          <div class="breadcrumb-container">
            <Breadcrumb />
          </div>
          <!-- 路由视图 -->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
</template>
<script setup lang='ts'>
import Aside from "./Aside/index.vue"
import Navbar from "./Navbar/Navbar.vue"
import Breadcrumb from "../../components/Breadcrumb.vue"
import {useUserStore} from "../../store/useUserStore"
const userStore = useUserStore()
</script>
<style>
#header{
  padding: 0px;
  height: 55px;
}
#aside{
  width:215px;
}
.container{
  width: 100%;
  height: 100%;
  margin:0px;
  padding: 0px;
  border: 0px;
}

.breadcrumb-container {
  background-color: #fff;
  padding: 0 15px;
  height: 40px;
  line-height: 40px;
  border-bottom: 1px solid #e6e6e6;
  margin-bottom: 10px;
  border-radius: 4px;
}

</style>
