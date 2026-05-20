<template>
    <el-row>
        <el-col :span="10" style="text-align: left;">
            <el-input v-model="keyword" style="width: 240px; margin-bottom: 10px; margin-top:5px;" size="large"
                placeholder="请输入要查询的课程" :prefix-icon="'Search'" />
        </el-col>
        <el-col :span="10" style="text-align: left;">
            <el-button @click="openAddCourseDrawer">新建课程</el-button>
            <el-button @click="rightPart = true">批量导入课程</el-button>
        </el-col>
    </el-row>
    <el-drawer v-model="rightPart" title="批量导入课程" direction="rtl" size="50%">
        <el-upload class="upload-demo" drag :http-request="upload" multiple name="excel">
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
    <el-table :data="coursesList" style="width: 100%">
        <el-table-column prop="Id" label="Id"  />
        <el-table-column prop="Name" label="课程名称" />
        <el-table-column label="操作">
            <template #default="scope">
                <el-button link type="primary" size="large" @click="openCourseDetailDrawer(scope.row.Id)">
                    详情
                </el-button>
                <el-button link type="primary" size="large" @click="openCourseEditDrawer(scope.row.Id)">
                    编辑
                </el-button>
            </template>
        </el-table-column>
    </el-table>
    <div style="display: flex; justify-content: center; position: fixed; bottom: 50px; width: 100%; left: 0; ">
        <el-pagination v-model:current-page="currentPage" background layout="prev, pager, next" :page-count="total"
            @current-change="handleCurrentChange" />
    </div>

    <!-- 课程详情抽屉 -->
    <el-drawer v-model="courseDetailDrawerVisible" title="课程详情" direction="rtl" size="50%">
        <template v-if="courseDetail.Id">
            <el-descriptions :column="1" border>
                <el-descriptions-item label="课程ID">{{ courseDetail.Id }}</el-descriptions-item>
                <el-descriptions-item label="课程名称">{{ courseDetail.Name }}</el-descriptions-item>
            </el-descriptions>
            <h4 style="margin-top: 20px;">授课教师</h4>
            <el-table :data="courseDetail.Teachers" style="width: 100%">
                <el-table-column prop="Id" label="教师ID" />
                <el-table-column prop="UserName" label="教师姓名" />
            </el-table>
            <div v-if="courseDetail.Teachers.length === 0" style="color: #909399;">暂无授课教师</div>
            <h4 style="margin-top: 20px;">参与班级</h4>
            <el-table :data="courseDetail.Classes" style="width: 100%">
                <el-table-column prop="Id" label="班级ID" />
                <el-table-column prop="Name" label="班级名称" />
            </el-table>
            <div v-if="courseDetail.Classes.length === 0" style="color: #909399;">暂无参与班级</div>
        </template>
    </el-drawer>

    <!-- 新建/编辑课程抽屉 -->
    <el-drawer v-model="courseEditDrawerVisible" :title="isNewCourse ? '新建课程' : '编辑课程'" direction="rtl" size="50%">
        <el-form ref="courseFormRef" :model="courseForm" label-width="100px">
            <el-form-item label="课程名称" prop="Name" :rules="[{ required: true, message: '请输入课程名称' }]">
                <el-input v-model="courseForm.Name" />
            </el-form-item>
            <el-form-item label="授课教师">
                <el-select
                    v-model="courseForm.TeacherIds"
                    multiple
                    filterable
                    placeholder="请选择教师"
                    style="width: 100%"
                >
                    <el-option
                        v-for="teacher in teacherList"
                        :key="teacher.Id"
                        :label="teacher.UserName"
                        :value="teacher.Id"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="参与班级">
                <el-select
                    v-model="courseForm.ClassIds"
                    multiple
                    filterable
                    placeholder="请选择班级"
                    style="width: 100%"
                >
                    <el-option
                        v-for="cls in allClassList"
                        :key="cls.Id"
                        :label="cls.Name"
                        :value="cls.Id"
                    />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitCourseForm">保存</el-button>
                <el-button @click="courseEditDrawerVisible = false">取消</el-button>
            </el-form-item>
        </el-form>
    </el-drawer>
</template>

<script setup lang='ts'>
import { onMounted, ref, watch } from 'vue'
import { getCourses, getAllCourses, upLoadCourses, getCourseInfo, addCourse, updateCourse, getAllTeachers, getAllClass } from '../../../api/admin';
import { devLog } from '../../../utils/devLog';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus'

let rightPart = ref(false)
let keyword = ref('')
let coursesList = ref([])

//分页用
const currentPage = ref(1)
const total = ref(1)

// 课程详情抽屉
const courseDetailDrawerVisible = ref(false)
const courseDetail = ref<any>({})

// 新建/编辑课程抽屉
const courseEditDrawerVisible = ref(false)
const isNewCourse = ref(false)
const courseFormRef = ref<FormInstance>()
const courseForm = ref({
    Id: null as number | null,
    Name: '',
    TeacherIds: [] as string[],
    ClassIds: [] as number[]
})

// 教师和班级下拉数据
const teacherList = ref<any[]>([])
const allClassList = ref<any[]>([])

const loadTeachers = () => {
    getAllTeachers(1, 10000).then(data => {
        const items = data.data.data?.items ?? data.data.data?.Items ?? []
        teacherList.value = items.map((t: any) => ({
            Id: t.id ?? t.Id,
            UserName: t.userName ?? t.UserName
        }))
    }).catch(() => {})
}

const loadAllClasses = () => {
    getAllClass(1, 10000).then(data => {
        allClassList.value = data.data.data?.Items || []
    }).catch(() => {})
}

const openCourseDetailDrawer = (courseId: number) => {
    getCourseInfo(courseId).then(data => {
        const d = data.data.data
        courseDetail.value = {
            Id: d.Id ?? d.id,
            Name: d.Name ?? d.name,
            Teachers: (d.Teachers ?? d.teachers ?? []).map((t: any) => ({
                Id: t.Id ?? t.id,
                UserName: t.UserName ?? t.userName ?? t.Name ?? t.name
            })),
            Classes: (d.Classes ?? d.classes ?? []).map((c: any) => ({
                Id: c.Id ?? c.id,
                Name: c.Name ?? c.name
            }))
        }
        courseDetailDrawerVisible.value = true
    }).catch(() => {
        ElMessage.error('获取课程详情失败')
    })
}

const openAddCourseDrawer = () => {
    isNewCourse.value = true
    courseForm.value = { Id: null, Name: '', TeacherIds: [], ClassIds: [] }
    courseEditDrawerVisible.value = true
}

const openCourseEditDrawer = (courseId: number) => {
    isNewCourse.value = false
    getCourseInfo(courseId).then(data => {
        const d = data.data.data
        courseForm.value = {
            Id: d.Id ?? d.id,
            Name: d.Name ?? d.name,
            TeacherIds: (d.Teachers ?? d.teachers ?? []).map((t: any) => String(t.Id ?? t.id)),
            ClassIds: (d.Classes ?? d.classes ?? []).map((c: any) => Number(c.Id ?? c.id))
        }
        courseEditDrawerVisible.value = true
    }).catch(() => {
        ElMessage.error('获取课程详情失败')
    })
}

const submitCourseForm = async () => {
    if (!courseFormRef.value) return
    await courseFormRef.value.validate((valid: boolean) => {
        if (!valid) return
        if (isNewCourse.value) {
            addCourse({
                name: courseForm.value.Name,
                teacherIds: courseForm.value.TeacherIds,
                classIds: courseForm.value.ClassIds
            }).then(() => {
                ElMessage.success('新建课程成功')
                courseEditDrawerVisible.value = false
                refreshCoursesList()
            }).catch(() => {
                ElMessage.error('新建课程失败')
            })
        } else {
            updateCourse({
                courseId: courseForm.value.Id!,
                name: courseForm.value.Name,
                teacherIds: courseForm.value.TeacherIds,
                classIds: courseForm.value.ClassIds
            }).then(() => {
                ElMessage.success('修改课程成功')
                courseEditDrawerVisible.value = false
                refreshCoursesList()
            }).catch(() => {
                ElMessage.error('修改课程失败')
            })
        }
    })
}

const refreshCoursesList = () => {
    currentPage.value = 1
    getAllCourses(currentPage.value).then(data => {
        coursesList.value = data.data.data.Items
        total.value = data.data.data.TotalPages
        if (total.value == 0) total.value = 1
    }).catch(() => {})
}

const upload = (uploadInfo: any) => {
    const { file } = uploadInfo;
    let formData = new FormData();
    formData.append("excel", file);
    upLoadCourses(formData).then(data => {
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


onMounted(() => {
    getAllCourses(currentPage.value).then(data => {
        coursesList.value = data.data.data.Items
        total.value = data.data.data.TotalPages
        devLog("this is coursesList", coursesList.value)
        if(total.value == 0){
                total.value =1
            }

    }).catch(error => {
        console.error('获取课程列表失败', error);
    });
    loadTeachers()
    loadAllClasses()
})
const change = () => {
    currentPage.value = 1
    if (keyword.value == '') {
        getAllCourses(currentPage.value).then(data => {
            coursesList.value = data.data.data.Items
            total.value = data.data.data.TotalPages
            devLog("this is coursesList", coursesList.value)
            if(total.value == 0){
                total.value =1
            }
        }).catch(error => {
            console.error('获取课程列表失败', error);
        });
    }
    else {
        getCourses(keyword.value, currentPage.value).then(data => {
            coursesList.value = data.data.data.Items
            total.value = data.data.data.TotalPages
            devLog("this is classList", coursesList.value)
            if(total.value == 0){
                total.value =1
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
        getAllCourses(currentPage.value).then(data => {
            coursesList.value = data.data.data.Items
            total.value = data.data.data.TotalPages
            devLog("this is coursesList", coursesList.value)
            if (total.value == 0) {
                total.value = 1
            }
        }).catch(error => {
            console.error('获取课程失败', error);
        });
    }
    else {
        getCourses(keyword.value, currentPage.value).then(data => {
            coursesList.value = data.data.data.Items
            total.value = data.data.data.TotalPages
            devLog("this is coursesList", coursesList.value)
            if (total.value == 0) {
                total.value = 1
            }
        }).catch(error => {
            console.error('获取课程失败', error);
        });
    }
}
</script>
<style></style>