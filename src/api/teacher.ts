import request from '../utils/request'
// export const AddTopicURL = 'http://127.0.0.1:5223/api/Student/AddReport'

export function getCourses(pageNumber:any,pageSize = 10) {
    return request({
        url: 'Teacher/GetCourseList',
        method: 'get',
        params:{pageNumber,pageSize}
    })
}


export function getClassList(CourseId: any,pageNumber:any,pageSize = 10) {
    return request({
        url: 'Teacher/GetClassListByCourseId',
        method: 'get',
        params: { CourseId,pageNumber,pageSize }
    })
}

export function getTopicList(courseId: any, classId: any,pageNumber:any,pageSize = 10) {
    return request({
        url: '/Teacher/GetTopicListByClassIdAndCourseId',
        method: 'get',
        params: { courseId, classId,pageNumber,pageSize }
    })
}

export function getReportList(courseId: any, classId: any, topicId: any) {
    return request({
        url: '/Teacher/GetReportList',
        method: 'get',
        params: { courseId, classId, topicId }
    })
}
export function getReport(reportId: any) {
    return request({
        url: '/Teacher/GetReport',
        method: 'get',
        params: { reportId }
    })
}

export function AddTopicToCourse(formData: any) {
    return request({
        url: '/Teacher/AddTopicToCourse',
        method: 'post',
        data: formData,
    })
}

//获取题目
export function getTopics(CourseId: any) {
    return request({
        url: '/Teacher/GetTopicListByCourseId',
        method: 'get',
        params: { CourseId }
    })
}

export function UpdateTopic(formData: any) {
    return request({
        url: '/Teacher/UpdateTopic',
        method: 'patch',
        data: formData,
        // headers: {
        //     'Content-Type': 'multipart/form-data'
        //   }
    })
}
// 计算相似度
export function CaclSimilarity(formData: any) {
    return request({
        url: '/Teacher/CaclSimilarity',
        method: 'patch',
        data:formData,
        // headers: {
        //     'Content-Type': 'multipart/form-data'
        //   }
    })
}


//添加题目到班级
export function AddTopics(TopicId: any, ClassId: any, Deadline: any) {
    const formData = new FormData();
    formData.append('TopicId', TopicId);
    formData.append('ClassId', ClassId);
    formData.append('Deadline', Deadline);
    return request({
        url: '/Teacher/AddTopicToClass',
        method: 'post',
        data: formData
    })
}

//获取学生
export function getStudentByClassId(classId: any) {
    return request({
        url: '/Teacher/GetStudentByClassId',
        method: 'get',
        params: { classId }
    })
}

export function makeScore(formData:any) {
    return request({
        url: '/Teacher/SetReportScore',
        method: 'patch',
        data:formData
    })
}