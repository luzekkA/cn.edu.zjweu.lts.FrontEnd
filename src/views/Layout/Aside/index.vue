<template>
  <el-menu default-active="0" class="el-menu-vertical-demo" :collapse="isCollapse" background-color="#2a2e34"
    text-color="#a19e9e" active-text-color="#fff" >
    <router-link to="/User">
    <el-menu-item class="namebar">
        <div class="namebarItem">{{ name }}<span style="margin-left: 20px;"></span>{{ id }}</div>
        <el-icon><ArrowRight /></el-icon>
    </el-menu-item>
  </router-link>
    <el-menu-item class="textbar">
        <div class="textbarItem">菜单</div>
    </el-menu-item>
    <div v-for="(elment, index) in list">
      <item :route="elment" :father-route="father" :index="index.toString()"></item>

    </div>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref,defineProps } from 'vue'
import { useRoutesStore } from '../../../store/useRoutesStore'
import item from './components/item.vue'
import { RouteRecordRaw } from 'vue-router'
const father:RouteRecordRaw = {
        path: "",
        name: "",
        meta: {
            hidden: true
        },
        component: () => import('../../login.vue')
    }
defineProps({
  name:String,
  id:String
})
const routesStore = useRoutesStore()
let list = routesStore.routesList;
console.log(list, "this is list")
const isCollapse = ref(false)
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 215px;
  min-height: 100%;
}
.namebar{
  padding:0px !important;
  height:40px;
  background-color: #003667 !important;
  text-align: left;
  color:#fff;
  
}
.namebarItem{
  width: 100%;
  height: 100%;
  margin: 0px;
  margin-left: 20px;
  margin-bottom: 13px;
}
.textbar{
  padding:0px !important;
  height:40px;
  background-color: rgb(33, 36, 41) !important;
  text-align: left;
  color:#a19e9e;
  
}
.textbarItem{
  width: 100%;
  height: 100%;
  margin: 0px;
  margin-left: 20px;
  margin-bottom: 13px;
}
</style>