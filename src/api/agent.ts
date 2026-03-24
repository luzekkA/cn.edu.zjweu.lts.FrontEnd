import request from '../utils/request'

export interface AgentRequest {
    question: string
    courseId?: number
    classId?: number
    topicId?: number
    maxReportCount?: number
    similarityThreshold?: number
}

export interface AgentResponse {
    Answer: string
    Role: string
    ResourceScope: {
        Courses: Array<{ Id: number, Name: string }>
        Classes: Array<{ Id: number, Name: string, Grade: number }>
    }
    ReferencedReportCount: number
    SuspectedPairCount: number
}

export function askAgent(data: AgentRequest) {
    return request({
        url: '/Agent/Ask',
        method: 'post',
        data
    })
}
