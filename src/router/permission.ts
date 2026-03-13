import router from './index'
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import getPageTitle from '../utils/get_page_title'
import { getToken } from '../utils/auth'
import { useUserStore } from '../store/useUserStore'
import { useRoutesStore } from '../store/useRoutesStore'
import { ElMessage } from "element-plus";
import { devLog } from '../utils/devLog'

//白名单
const whiteList = ['/', '/forgot']
devLog("addroute sucsess")
//前置路由守卫
//@ts-ignore
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  devLog("before each")
  //设置页面标题
  document.title = getPageTitle(to.meta.title as string)
  const hasToken = getToken()

  if (hasToken) {
    //用户有token
    devLog("user have token")
    devLog("user go to else")
    const userStore = useUserStore()
    const routesStore = useRoutesStore()
    const hasRoles = userStore.role && userStore.role.length > 0
    if (hasRoles) {
      devLog("user have roles");
      if (to.path === '/' ||to.path === '' ) {
        if (userStore.role.includes("STUDENT")) {
          next({ path: '/Student' })
          return;
        }
        else if (userStore.role.includes("TEACHER")) {
          next({ path: '/Teacher' })
          return;
        }
        else if (userStore.role.includes("ADMIN")) {
          //next({ path: '/myCourses' })
          next({ path: '/editUser/search' })
          return;
        }
      }
      next()
    } else {
      devLog("user have no roles")
      try {
        devLog("trying get roles")
        devLog(userStore.getInfo().toString())
        //获取userInfo
        const { data }: any = await userStore.getInfo()
        const role = []
        role.push(data.role)
        devLog("this is role", role)
        //根据角色生成路由并存到pinia
        const accessRoutes = await routesStore.generateRoutes(role)
        devLog("this is accessRoutes", accessRoutes.toString())
        //添加路由
        accessRoutes.forEach(route => {
          router.addRoute(route);
        })

        next({ ...to, replace: true })
      } catch (error) {
        // remove token and go to login page to re-login
        await userStore.resetToken()
        ElMessage.error('Error')
        next('/')
        // NProgress.done()
      }
    }

  } else {
    //用户没有token
    if (whiteList.includes(to.path)) {
      //用户访问白名单
      next()
    } else {
      //访问其他页面跳转到login
      next('/')
      // NProgress.done()
    }
  }
})
//后置路由守卫
router.afterEach(() => {
  // finish progress bar
  // NProgress.done()
})
