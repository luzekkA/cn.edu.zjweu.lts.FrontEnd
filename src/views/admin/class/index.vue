<template>
    <el-row>
        <el-col :span="10" style="text-align: left;">
            <el-input v-model="keyword" style="width: 240px; margin-bottom: 10px; margin-top:5px;" size="large"
                placeholder="请输入要查询的班级" :prefix-icon="'Search'" />
        </el-col>
        <el-col :span="6" style="text-align: left;">
            <el-button @click="openAddClassDrawer">新建班级</el-button>
        </el-col>
    </el-row>
    <el-table :data="classList" style="width: 100%">
        <el-table-column prop="Id" label="Id" />
        <el-table-column prop="Name" label="班级名称" />
        <el-table-column label="操作">
            <template #default="scope">
                <el-button link type="primary" size="large" @click="openDetailDrawer(scope.row.Id)">
                    详情
                </el-button>
                <el-button link type="primary" size="large" @click="openEditDrawer(scope.row.Id)">
                    编辑
                </el-button>
            </template>
        </el-table-column>
    </el-table>
    <div style="display: flex; justify-content: center; position: fixed; bottom: 50px; width: 100%; left: 0; ">
        <el-pagination v-model:current-page="currentPage" background layout="prev, pager, next" :page-count="total"
            @current-change="handleCurrentChange" />
    </div>

    <!-- 班级详情抽屉 -->
    <el-drawer v-model="detailDrawerVisible" title="班级详情" direction="rtl" size="50%">
        <template v-if="classDetail.Id">
            <el-descriptions :column="1" border>
                <el-descriptions-item label="班级ID">{{ classDetail.Id }}</el-descriptions-item>
                <el-descriptions-item label="班级名称">{{ classDetail.Name }}</el-descriptions-item>
                <el-descriptions-item label="年级">{{ classDetail.Grade }}</el-descriptions-item>
                <el-descriptions-item label="学生人数">{{ classDetail.StudentCount }}</el-descriptions-item>
            </el-descriptions>
            <h4 style="margin-top: 20px;">关联课程</h4>
            <el-table :data="classDetail.Courses" style="width: 100%">
                <el-table-column prop="Id" label="课程ID" />
                <el-table-column prop="Name" label="课程名称" />
            </el-table>
        </template>
    </el-drawer>

    <!-- 新建/编辑班级抽屉 -->
    <el-drawer v-model="editDrawerVisible" :title="isNewClass ? '新建班级' : '编辑班级'" direction="rtl" size="50%">
        <el-form ref="classFormRef" :model="classForm" label-width="100px">
            <el-form-item label="班级名称" prop="Name" :rules="[{ required: true, message: '请输入班级名称' }]">
                <el-input v-model="classForm.Name" />
            </el-form-item>
            <el-form-item label="年级" prop="Grade" :rules="[{ required: true, message: '请输入年级' }]">
                <el-input-number v-model="classForm.Grade" :min="2000" :max="2100" style="width: 100%" />
            </el-form-item>
            <el-form-item v-if="!isNewClass" label="关联课程">
                <el-checkbox-group v-model="classForm.CourseIds">
                    <div v-for="course in allCourses" :key="course.Id" style="margin-bottom: 8px;">
                        <el-checkbox :label="course.Id" :value="course.Id">
                            {{ course.Name }}
                        </el-checkbox>
                    </div>
                </el-checkbox-group>
                <div v-if="allCourses.length === 0" style="color: #909399;">暂无课程数据</div>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitClassForm">保存</el-button>
                <el-button @click="editDrawerVisible = false">取消</el-button>
            </el-form-item>
        </el-form>
    </el-drawer>
</template>

<script setup lang='ts'>
import { onMounted, ref, watch } from 'vue'
import { getClass, getAllClass, getClassInfo, updateClass, addClass, getAllCourses } from '../../../api/admin';
import { devLog } from '../../../utils/devLog';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus'

let keyword = ref('')
let classList = ref([])

//分页用
const currentPage = ref(1)
const total = ref(1)

// 详情抽屉
const detailDrawerVisible = ref(false)
const classDetail = ref<any>({})

// 编辑/新建抽屉
const editDrawerVisible = ref(false)
const isNewClass = ref(false)
const classFormRef = ref<FormInstance>()
const classForm = ref({
    Id: null as number | null,
    Name: '',
    Grade: 2024,
    CourseIds: [] as number[]
})
const allCourses = ref<any[]>([])

const loadAllCourses = () => {
    getAllCourses(1, 1000).then(data => {
        allCourses.value = data.data.data?.Items || []
    }).catch(() => {})
}

const openDetailDrawer = (classId: number) => {
    getClassInfo(classId).then(data => {
        const d = data.data.data
        classDetail.value = {
            Id: d.Id ?? d.id,
            Name: d.Name ?? d.name,
            Grade: d.Grade ?? d.grade,
            StudentCount: d.StudentCount ?? d.studentCount,
            Courses: (d.Courses ?? d.courses ?? []).map((c: any) => ({
                Id: c.Id ?? c.id,
                Name: c.Name ?? c.name
            }))
        }
        detailDrawerVisible.value = true
    }).catch(() => {
        ElMessage.error('获取班级详情失败')
    })
}

const openAddClassDrawer = () => {
    isNewClass.value = true
    classForm.value = { Id: null, Name: '', Grade: 2024, CourseIds: [] }
    editDrawerVisible.value = true
}

const openEditDrawer = (classId: number) => {
    isNewClass.value = false
    getClassInfo(classId).then(data => {
        const d = data.data.data
        classForm.value = {
            Id: d.Id ?? d.id,
            Name: d.Name ?? d.name,
            Grade: d.Grade ?? d.grade,
            CourseIds: (d.Courses ?? d.courses ?? []).map((c: any) => c.Id ?? c.id ?? (typeof c === 'object' ? (c.CourseId ?? c.courseId) : c))
        }
        editDrawerVisible.value = true
    }).catch(() => {
        ElMessage.error('获取班级详情失败')
    })
}

const submitClassForm = async () => {
    if (!classFormRef.value) return
    await classFormRef.value.validate((valid: boolean) => {
        if (!valid) return
        if (isNewClass.value) {
            addClass({ name: classForm.value.Name, grade: classForm.value.Grade }).then(() => {
                ElMessage.success('新建班级成功')
                editDrawerVisible.value = false
                refreshClassList()
            }).catch(() => {
                ElMessage.error('新建班级失败')
            })
        } else {
            updateClass({
                classId: classForm.value.Id!,
                name: classForm.value.Name,
                grade: classForm.value.Grade,
                courseIds: classForm.value.CourseIds
            }).then(() => {
                ElMessage.success('修改班级成功')
                editDrawerVisible.value = false
                refreshClassList()
            }).catch(() => {
                ElMessage.error('修改班级失败')
            })
        }
    })
}

const refreshClassList = () => {
    currentPage.value = 1
    getAllClass(currentPage.value).then(data => {
        classList.value = data.data.data.Items
        total.value = data.data.data.TotalPages
        if (total.value == 0) total.value = 1
    }).catch(() => {})
}

onMounted(() => {
    getAllClass(currentPage.value).then(data => {
        classList.value = data.data.data.Items
        total.value = data.data.data.TotalPages
        devLog("this is classList", classList.value)
        if (total.value == 0) {
            total.value = 1
        }
    }).catch(error => {
        console.error('获取班级列表失败', error);
    });
    loadAllCourses()
})
const change = () => {
    currentPage.value = 1
    if (keyword.value == '') {
        getAllClass(currentPage.value).then(data => {
            classList.value = data.data.data.Items
            total.value = data.data.data.TotalPages
            devLog("this is classList", classList.value)
            if (total.value == 0) {
                total.value = 1
            }
        }).catch(error => {
            console.error('获取班级列表失败', error);
        });
    }
    else {
        getClass(keyword.value, currentPage.value).then(data => {
            classList.value = data.data.data.Items
            total.value = data.data.data.TotalPages
            devLog("this is classList", classList.value)
            if (total.value == 0) {
                total.value = 1
            }
        }).catch(error => {
            console.error('获取班级列表失败', error);
        });
    }
}

watch(keyword, () => {
    change();
})

const handleCurrentChange = () => {
    if (keyword.value == '') {
        getAllClass(currentPage.value).then(data => {
            classList.value = data.data.data.Items
            total.value = data.data.data.TotalPages
            devLog("this is classList", classList.value)
            if (total.value == 0) {
                total.value = 1
            }
        }).catch(error => {
            console.error('获取班级失败', error);
        });
    }
    else {
        getClass(keyword.value, currentPage.value).then(data => {
            classList.value = data.data.data.Items
            total.value = data.data.data.TotalPages
            devLog("this is classList", classList.value)
            if (total.value == 0) {
                total.value = 1
            }
        }).catch(error => {
            console.error('获取班级失败', error);
        });
    }
}
</script>
<style></style>