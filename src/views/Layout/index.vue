<template>
    <el-container class="container">
      <el-header id="header" class="fixed-header">
        <Navbar />
      </el-header>
      <el-container class="main-container">
        <el-aside id="aside" class="fixed-aside">
        <Aside :name="userStore.name" :id="userStore.id"/>
        </el-aside>
        <el-main class="scrollable-main">
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

.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

#aside{
  width: 215px;
}

.fixed-aside {
  position: fixed;
  top: 55px;
  left: 0;
  bottom: 0;
  z-index: 999;
  overflow-y: auto;
  background-color: #fff;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
}

.container{
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
  border: 0px;
}

.main-container {
  margin-top: 55px;
  margin-left: 215px;
  min-height: calc(100vh - 55px);
}

.scrollable-main {
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f5f5;
  min-height: calc(100vh - 55px);
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
