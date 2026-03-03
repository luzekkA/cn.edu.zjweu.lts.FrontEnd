//引入路由对象
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
//定义静态路由
export const staticRoutes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "login",
        meta: {
            hidden: true
        },
        component: () => import('../views/login.vue')
    },
    // }, {
    //     path: "/register",
    //     name: "register",
    //     meta: {
    //         hidden: true
    //     },
    //     component: () => import('../views/register/index.vue')
    // },
    // {
    //     path: "/index",
    //     component: () => import('../views/Layout/index.vue'),
    //     meta: {
    //         icon: 'HomeFilled'
    //     },
    //     children: [
    //         {
    //             path: '',
    //             name: "index",
    //             component: () => import('../views/index.vue'),
    //         }
    //     ],
    // }, 
    {
        // path: '/404',
        path: '/:pathMatch(.*)*',
        meta: {
            hidden: true
        },
        component: () => import('../views/error-page/404.vue'),
    },
    {
        // path: '/404',
        path: '/forgot',
        name: "forgot",
        meta: {
            hidden: true
        },
        component: () => import('../views/forgot.vue'),
    },

]
//定义动态路由
export const asyncRoutes: Array<RouteRecordRaw> = [
    {
        path: "/editUser",
        component: () => import('../views/Layout/index.vue'),
        meta: {
            name: '搜索用户',
            roles: ['ADMIN'],
            icon: 'HomeFilled'
        },
        children: [
            {
                path: 'search',
                name: "搜索用户",
                component: () => import('../views/admin/user/index.vue'),
            },
            {
                path: 'detail',
                name: "用户详情",
                meta: {
                    hidden: true
                },
                component: () => import('../views/admin/user/detail.vue'),
            }
        ],
    },
    {
        path: "/editCourses",
        component: () => import('../views/Layout/index.vue'),
        meta: {
            name: '搜索课程',
            roles: ['ADMIN'],
            icon: 'HomeFilled'
        },
        children: [
            {
                path: 'index',
                name: "搜索课程",
                component: () => import('../views/admin/courses/index.vue'),
            }
            // {
            //     path: 'detail',
            //     name: "课程详情",
            //     meta: {
            //         hidden: true
            //     },
            //     component: () => import('../views/admin/courses/detail.vue'),
            // }
        ],
    },
    {
        path: "/editTopic",
        component: () => import('../views/Layout/index.vue'),
        meta: {
            name: '搜索题目',
            roles: ['ADMIN'],
            icon: 'HomeFilled'
        },
        children: [
            {
                path: 'search',
                name: "搜索题目",
                component: () => import('../views/admin/topic/index.vue'),
            }, {
                path: 'detail',
                name: "题目详情",
                meta: {
                    hidden: true
                },
                component: () => import('../views/admin/topic/detail.vue'),
            }
        ],
    },
    {
        path: "/editClass",
        component: () => import('../views/Layout/index.vue'),
        meta: {
            name: '搜索班级',
            roles: ['ADMIN'],
            icon: 'HomeFilled'
        },
        children: [
            {
                path: 'index',
                name: "搜索班级",
                component: () => import('../views/admin/class/index.vue'),
            }
        ],
    },

    {
        path: "/Student",
        component: () => import('../views/Layout/index.vue'),
        meta: {
            name: '我的课程',
            roles: ['STUDENT'],
            icon: 'HomeFilled'
        },
        children: [
            {
                path: '',
                name: "我的课程",
                component: () => import('../views/student/courses/index.vue'),
            }
            , {
                path: 'CourseTopic',
                name: "课程题目",
                meta: {
                    hidden: true
                },
                component: () => import('../views/student/topicList/index.vue'),
            }
            , {
                path: 'TopicDetail',
                name: "题目",
                meta: {
                    hidden: true
                },
                component: () => import('../views/student/topicDetail/index.vue'),
            }
        ]
    },
    {
        path: "/Teacher",
        component: () => import('../views/Layout/index.vue'),
        meta: {
            name: '课程列表',
            roles: ['TEACHER'],
            icon: 'HomeFilled'
        },
        children: [
            {
                path: '',
                name: "课程列表",
                component: () => import('../views/teacher/courses/index.vue'),
            },
            {
                path: 'ClassList',
                name: "课程详情",
                meta: {
                    hidden: true
                },
                component: () => import('../views/teacher/courseDetail/index.vue'),
            },
            {
                path: 'ClassDetail',
                name: "班级详情",
                meta: {
                    hidden: true
                },
                component: () => import('../views/teacher/classDetail/index.vue'),
            },
            {
                path: 'TopicUploadDetail',
                name: "题目提交详情",
                meta: {
                    hidden: true
                },
                component: () => import('../views/teacher/topicUploadDetail/index.vue'),
            }
            ,
            {
                path: 'ReportDetail',
                name: "报告详情",
                meta: {
                    hidden: true
                },
                component: () => import('../views/teacher/reportDetail/index.vue'),
            },
            {
                path: 'Topics',
                name: "题库",
                meta: {
                    hidden: true
                },
                component: () => import('../views/teacher/topics/index.vue'),
            }
            // {
            //     path: 'TopicDetail',
            //     name: "题目详情",
            //     meta: {
            //         hidden: true
            //     },
            //     component: () => import('../views/teacher/topics/detail.vue'),
            // }


        ]
    }
    , {
        path: "/User",
        component: () => import('../views/Layout/index.vue'),
        meta: {
            name: '用户信息',
            icon: 'HomeFilled',
            hidden: true
        },
        children: [
            {
                path: '',
                name: "用户信息",
                component: () => import('../views/userInfo.vue'),
            },]
    }
]
//静态路由直接添加到router
let router = createRouter({
    history: createWebHistory(),
    routes: staticRoutes
})
//重置路由
export function resetRouter() {
    const newRouter = createRouter({
        history: createWebHistory(),
        routes: [],  // 如果routes是undefined，使用空数组
    });
    router = newRouter;
}

//导出router
export default router