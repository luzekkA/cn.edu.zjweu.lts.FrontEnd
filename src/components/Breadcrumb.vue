<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <span
          v-if="item.redirect === 'noRedirect' || index == levelList.length - 1"
          class="no-redirect"
        >
          {{ item.meta.name }}
        </span>
        <a v-else @click.prevent="handleLink(item)">
          {{ item.meta.name }}
        </a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter, RouteLocationMatched } from 'vue-router'

const route = useRoute()
const router = useRouter()
const levelList = ref<RouteLocationMatched[]>([])

const getBreadcrumb = () => {
  // 获取所有匹配的路由
  let matched = route.matched.filter(item => item.meta && item.meta.name)

  // 手动构造完整的导航路径
  matched = constructFullPath(matched)

  // 如果第一个不是首页，添加首页
  const first = matched[0]
  if (first && first.path !== '/' && first.path !== '/Student' && first.path !== '/Teacher') {
    // 找到当前角色对应的首页路由
    const homeRoute = findHomeRoute()
    if (homeRoute) {
      matched = [{ path: '/', meta: { name: '首页' }, redirect: homeRoute.path } as any, ...matched]
    }
  }

  // 不过滤 hidden 的路由，因为面包屑需要显示完整的路径层级
  levelList.value = matched
}

// 根据当前路径和 query 参数构造完整的导航路径
const constructFullPath = (matched: any[]) => {
  const currentPath = route.path
  const query = route.query

  // 教师路由的特殊处理
  if (currentPath.includes('/Teacher/')) {
    // 课程详情、题库、题目提交详情和报告详情需要完整重建路径
    if (currentPath.includes('/ClassList') || currentPath.includes('/Topics') || currentPath.includes('/TopicUploadDetail') || currentPath.includes('/ReportDetail')) {
      // 清空现有的匹配路由，重新构建完整的导航路径
      const newMatched: any[] = []

      // 1. 添加首页
      newMatched.push({
        path: '/Teacher',
        meta: { name: '课程列表' }
      })

      // 2. 添加课程详情（如果是课程详情页面或更深层级）
      if (query.CourseId) {
        const courseName = query.CourseName || '课程'
        newMatched.push({
          path: '/Teacher/ClassList',
          meta: { name: `${courseName}详情` },
          query: { CourseId: query.CourseId, CourseName: courseName }
        })
      }

      // 3. 添加题库（如果当前是题库页面）
      if (currentPath.includes('/Topics')) {
        const courseName = query.CourseName || '课程'
        newMatched.push({
          path: '/Teacher/Topics',
          meta: { name: '题库' },
          query: { CourseId: query.CourseId, CourseName: courseName }
        })
      }

      // 4. 添加班级详情
      if (query.ClassId) {
        const courseName = query.CourseName || '课程'
        newMatched.push({
          path: '/Teacher/ClassDetail',
          meta: { name: '班级详情' },
          query: { CourseId: query.CourseId, ClassId: query.ClassId, CourseName: courseName }
        })
      }

      // 5. 添加题目提交详情
      if (currentPath.includes('/TopicUploadDetail')) {
        const topicName = query.TopicName || '题目'
        const courseName = query.CourseName || '课程'
        newMatched.push({
          path: '/Teacher/TopicUploadDetail',
          meta: { name: `${topicName}提交详情` },
          query: {
            CourseId: query.CourseId,
            CourseName: courseName,
            ClassId: query.ClassId,
            TopicId: query.TopicId,
            TopicName: topicName
          }
        })
      }

      // 6. 添加报告详情
      if (currentPath.includes('/ReportDetail')) {
        const topicName = query.TopicName || '题目'
        const userName = query.UserName || '用户'
        const courseName = query.CourseName || '课程'

        // 先添加题目提交详情
        newMatched.push({
          path: '/Teacher/TopicUploadDetail',
          meta: { name: `${topicName}提交详情` },
          query: {
            CourseId: query.CourseId,
            CourseName: courseName,
            ClassId: query.ClassId,
            TopicId: query.TopicId,
            TopicName: topicName
          }
        })

        // 再添加报告详情
        newMatched.push({
          path: '/Teacher/ReportDetail',
          meta: { name: `${userName}报告详情` },
          query: {
            ReportId: query.ReportId,
            CourseId: query.CourseId,
            CourseName: courseName,
            ClassId: query.ClassId,
            TopicId: query.TopicId,
            TopicName: topicName,
            UserName: userName
          }
        })
      }

      return newMatched
    }

    // 如果是班级详情页，手动插入课程详情页
    if (currentPath.includes('/ClassDetail')) {
      const classDetailRoute = matched.find(item => item.path.includes('/ClassDetail'))

      if (classDetailRoute && !matched.some(item => item.path.includes('/ClassList'))) {
        const courseName = query.CourseName || '课程'
        // 手动构造课程详情路由对象
        const classListRoute = {
          path: '/Teacher/ClassList',
          meta: { name: `${courseName}详情` },
          query: { CourseId: query.CourseId, CourseName: courseName }
        }

        // 在班级详情之前插入课程详情
        const classDetailIndex = matched.indexOf(classDetailRoute)
        matched.splice(classDetailIndex, 0, classListRoute)
      }
    }
  }

  // 学生路由的特殊处理
  if (currentPath.includes('/Student/')) {
    // 如果是题目详情页，手动插入课程题目页
    if (currentPath.includes('/TopicDetail')) {
      const topicDetailRoute = matched.find(item => item.path.includes('/TopicDetail'))

      if (topicDetailRoute && !matched.some(item => item.path.includes('/CourseTopic'))) {
        // 手动构造课程题目路由对象
        const courseTopicRoute = {
          path: '/Student/CourseTopic',
          meta: { name: '课程题目' },
          query: { CourseId: query.CourseId }
        }

        // 在题目详情之前插入课程题目
        const topicDetailIndex = matched.indexOf(topicDetailRoute)
        matched.splice(topicDetailIndex, 0, courseTopicRoute)
      }
    }
  }

  return matched
}

const findHomeRoute = () => {
  // 根据当前路由判断首页
  const path = route.path
  if (path.startsWith('/editUser') || path.startsWith('/editCourses') ||
      path.startsWith('/editTopic') || path.startsWith('/editClass')) {
    return { path: '/editUser/search', name: '搜索用户' }
  } else if (path.startsWith('/Student')) {
    return { path: '/Student', name: '我的课程' }
  } else if (path.startsWith('/Teacher')) {
    return { path: '/Teacher', name: '课程列表' }
  }
  return null
}

const handleLink = (item: any) => {
  const { redirect, path, query } = item
  if (redirect) {
    router.push(redirect)
    return
  }

  // 如果路由有 query 参数，使用 query 参数跳转
  if (query) {
    router.push({ path, query })
  } else {
    router.push(path)
  }
}

watch(
  () => route.path,
  () => {
    getBreadcrumb()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }

  a {
    color: #409eff;
    cursor: pointer;

    &:hover {
      color: #66b1ff;
    }
  }
}
</style>
