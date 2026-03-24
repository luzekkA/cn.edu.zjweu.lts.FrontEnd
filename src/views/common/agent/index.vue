<template>
    <div class="agent-container">
        <!-- 顶部快捷操作区 -->
        <div class="quick-actions">
            <el-button
                :type="agentStore.currentMode === 'normal' ? 'primary' : 'default'"
                @click="switchToNormalMode"
            >
                普通问答
            </el-button>
            <el-button
                :type="agentStore.currentMode === 'similarity' ? 'primary' : 'default'"
                @click="switchToSimilarityMode"
            >
                重复率分析问答
            </el-button>
            <el-button @click="clearChat" type="danger" plain>清空对话</el-button>
        </div>

        <!-- 高级筛选区（可折叠） -->
        <div class="filter-section">
            <el-collapse v-model="filterVisible">
                <el-collapse-item title="高级筛选" name="filter">
                    <el-form :inline="true" label-width="80px">
                        <el-form-item label="课程">
                            <el-select
                                v-model="agentStore.filterOptions.courseId"
                                placeholder="请选择课程"
                                clearable
                                @change="onCourseChange"
                                style="width: 200px"
                            >
                                <el-option
                                    v-for="course in coursesList"
                                    :key="course.Id"
                                    :label="course.Name"
                                    :value="course.Id"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="班级">
                            <el-select
                                v-model="agentStore.filterOptions.classId"
                                placeholder="请选择班级"
                                clearable
                                @change="onClassChange"
                                style="width: 200px"
                            >
                                <el-option
                                    v-for="cls in classList"
                                    :key="cls.Id"
                                    :label="cls.Name"
                                    :value="cls.Id"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="题目">
                            <el-select
                                v-model="agentStore.filterOptions.topicId"
                                placeholder="请选择题目"
                                clearable
                                style="width: 200px"
                            >
                                <el-option
                                    v-for="topic in topicList"
                                    :key="topic.Id"
                                    :label="topic.Title"
                                    :value="topic.Id"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="参考报告数">
                            <el-slider
                                v-model="agentStore.filterOptions.maxReportCount"
                                :min="1"
                                :max="20"
                                show-input
                                style="width: 250px"
                            />
                        </el-form-item>
                        <el-form-item label="相似度阈值">
                            <el-slider
                                v-model="agentStore.filterOptions.similarityThreshold"
                                :min="0"
                                :max="1"
                                :step="0.1"
                                show-input
                                style="width: 250px"
                            />
                        </el-form-item>
                    </el-form>
                </el-collapse-item>
            </el-collapse>
        </div>

        <!-- 聊天消息区域 -->
        <div class="chat-container" ref="chatContainer">
            <div
                v-for="message in agentStore.messages"
                :key="message.id"
                :class="['message-item', message.type]"
            >
                <!-- 用户消息 -->
                <div v-if="message.type === 'user'" class="user-message">
                    <div class="message-content">{{ message.content }}</div>
                    <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                </div>

                <!-- AI 消息 -->
                <div v-else class="assistant-message">
                    <div class="message-header">
                        <el-icon><ChatDotRound /></el-icon>
                        <span>智能助手</span>
                    </div>
                    <div class="message-content markdown-body" v-html="renderMarkdown(message.content)"></div>
                    <!-- 可信度信息 -->
                    <div v-if="message.credibility" class="credibility-info">
                        <el-tag type="info" size="small">
                            参考报告数: {{ message.credibility.referencedReportCount }}
                        </el-tag>
                        <el-tag type="warning" size="small" style="margin-left: 8px">
                            可疑对数: {{ message.credibility.suspectedPairCount }}
                        </el-tag>
                    </div>
                    <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                </div>
            </div>

            <!-- 加载状态 -->
            <div v-if="agentStore.isLoading" class="message-item assistant-message">
                <div class="message-header">
                    <el-icon><ChatDotRound /></el-icon>
                    <span>智能助手</span>
                </div>
                <div class="message-content loading">
                    <el-icon class="is-loading"><Loading /></el-icon>
                    <span>思考中...</span>
                </div>
            </div>

            <!-- 欢迎消息 -->
            <div v-if="agentStore.messages.length === 0" class="welcome-message">
                <el-icon size="60"><ChatDotRound /></el-icon>
                <h2>智能体问答助手</h2>
                <p>我可以帮助您分析报告、查找相似内容、回答问题</p>
                <div class="quick-questions">
                    <el-button
                        v-for="q in quickQuestions"
                        :key="q"
                        @click="sendQuickQuestion(q)"
                        type="primary"
                        plain
                        size="small"
                    >
                        {{ q }}
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
            <el-input
                v-model="inputMessage"
                type="textarea"
                :rows="3"
                placeholder="输入您的问题..."
                @keydown.enter.ctrl="sendMessage"
                :disabled="agentStore.isLoading"
            />
            <div class="input-actions">
                <span class="hint">Ctrl + Enter 发送</span>
                <el-button
                    type="primary"
                    @click="sendMessage"
                    :loading="agentStore.isLoading"
                    :disabled="!inputMessage.trim()"
                >
                    发送
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useAgentStore } from '../../../store/useAgentStore'
import { useUserStore } from '../../../store/useUserStore'
import { askAgent, type AgentRequest } from '../../../api/agent'
import { ElMessage } from 'element-plus'
import { ChatDotRound, Loading } from '@element-plus/icons-vue'
import { devLog } from '../../../utils/devLog'

// 简单的 Markdown 渲染函数（无需额外依赖）
const renderMarkdown = (text: string): string => {
    if (!text) return ''

    // 转义 HTML 标签防止 XSS
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

    // 标题 (H1-H6)
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')

    // 粗体和斜体
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
    html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
    html = html.replace(/_(.+?)_/g, '<em>$1</em>')

    // 删除线
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>')

    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

    // 代码块
    html = html.replace(/```(\w*)\n([\s\S]+?)```/g, '<pre><code>$2</code></pre>')

    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')

    // 无序列表
    html = html.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

    // 有序列表
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')

    // 引用
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')

    // 分隔线
    html = html.replace(/^---$/gm, '<hr>')

    // 换行转 <br>（除了在 pre 标签内的）
    html = html.replace(/\n/g, '<br>')

    // 清理 pre 标签内的 <br>
    html = html.replace(/<pre>([\s\S]*?)<\/pre>/g, (match) => {
        return match.replace(/<br>/g, '\n').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    })

    return html
}

// 根据用户角色导入不同的 API
const teacherApi = () => import('../../../api/teacher')
const adminApi = () => import('../../../api/admin')
const studentApi = () => import('../../../api/student')

const agentStore = useAgentStore()
const userStore = useUserStore()

const inputMessage = ref('')
const filterVisible = ref(['filter'])
const chatContainer = ref<HTMLElement>()

// 数据列表
const coursesList = ref<any[]>([])
const classList = ref<any[]>([])
const topicList = ref<any[]>([])

// 获取用户角色
const userRole = computed(() => userStore.role)

// 根据角色显示不同的快捷问题
const quickQuestions = computed(() => {
    if (userRole.value.includes('ADMIN')) {
        return [
            '帮我统计整个系统的报告提交情况',
            '找出全校范围内相似度最高的报告对',
            '分析各班级的报告质量分布情况'
        ]
    } else if (userRole.value.includes('TEACHER')) {
        return [
            '帮我分析这个班级的报告中是否存在抄袭',
            '哪个 topic 的报告可能有相似问题',
            '找出相似度最高的报告对'
        ]
    } else if (userRole.value.includes('STUDENT')) {
        return [
            '帮我检查我的报告是否存在格式问题',
            '我的报告和同学的报告相似度高吗',
            '帮我改进我的报告内容'
        ]
    }
    return [
        '你好，能帮我什么？',
        '如何使用这个系统'
    ]
})

// 加载课程列表
const loadCourses = async () => {
    try {
        let api: any
        if (userRole.value.includes('ADMIN')) {
            api = await adminApi()
            const res = await api.getAllCourses(1, 1000)
            coursesList.value = res.data.data?.Items || []
        } else if (userRole.value.includes('TEACHER')) {
            api = await teacherApi()
            const res = await api.getCourses(1, 1000)
            coursesList.value = res.data.data?.Items || []
        } else if (userRole.value.includes('STUDENT')) {
            api = await studentApi()
            const res = await api.getCourses(1, 1000)
            coursesList.value = res.data.data?.Items || []
        }
    } catch (error) {
        devLog('加载课程列表失败', error)
    }
}

// 加载班级列表
const loadClasses = async (courseId: number) => {
    if (!courseId) {
        classList.value = []
        return
    }
    try {
        let api: any
        if (userRole.value.includes('ADMIN')) {
            api = await adminApi()
            const res = await api.getAllClass(1, 1000)
            classList.value = res.data.data?.Items?.filter((c: any) => c.CourseId === courseId) || []
        } else if (userRole.value.includes('TEACHER')) {
            api = await teacherApi()
            const res = await api.getClassList(courseId, 1, 1000)
            classList.value = res.data.data?.Items || []
        }
    } catch (error) {
        devLog('加载班级列表失败', error)
    }
}

// 加载题目列表
const loadTopics = async (courseId: number, classId: number) => {
    if (!courseId || !classId) {
        topicList.value = []
        return
    }
    try {
        let api: any
        if (userRole.value.includes('ADMIN')) {
            api = await adminApi()
            const res = await api.getAllTopics(1, 1000)
            topicList.value = res.data.data?.Items || []
        } else if (userRole.value.includes('TEACHER')) {
            api = await teacherApi()
            const res = await api.getTopicList(courseId, classId, 1, 1000)
            topicList.value = res.data.data?.Items || []
        } else if (userRole.value.includes('STUDENT')) {
            api = await studentApi()
            const res = await api.getCourseTopic(courseId, 1, 1000)
            topicList.value = res.data.data?.Items || []
        }
    } catch (error) {
        devLog('加载题目列表失败', error)
    }
}

// 课程变化
const onCourseChange = (courseId: number) => {
    agentStore.updateFilter({ courseId, classId: null, topicId: null })
    classList.value = []
    topicList.value = []
    if (courseId) {
        loadClasses(courseId)
    }
}

// 班级变化
const onClassChange = (classId: number) => {
    agentStore.updateFilter({ classId, topicId: null })
    topicList.value = []
    if (classId && agentStore.filterOptions.courseId) {
        loadTopics(agentStore.filterOptions.courseId, classId)
    }
}

// 切换到普通模式
const switchToNormalMode = () => {
    agentStore.setMode('normal')
    ElMessage.info('已切换到普通问答模式')
}

// 切换到重复率分析模式
const switchToSimilarityMode = () => {
    agentStore.setMode('similarity')
    // 如果教师没有选择课程和班级，提示选择
    if (userRole.value.includes('TEACHER') &&
        (!agentStore.filterOptions.courseId || !agentStore.filterOptions.classId)) {
        ElMessage.warning('重复率分析模式下，建议先选择课程和班级')
        filterVisible.value = ['filter']
    } else {
        ElMessage.info('已切换到重复率分析模式')
    }
}

// 发送消息
const sendMessage = async () => {
    const question = inputMessage.value.trim()
    if (!question) return

    // 添加用户消息
    agentStore.addMessage({
        type: 'user',
        content: question
    })

    inputMessage.value = ''
    await scrollToBottom()

    // 设置加载状态
    agentStore.setLoading(true)

    try {
        // 构建请求参数
        const requestData: AgentRequest = {
            question,
            ...agentStore.filterOptions
        }

        // 移除空值
        if (!requestData.courseId) delete requestData.courseId
        if (!requestData.classId) delete requestData.classId
        if (!requestData.topicId) delete requestData.topicId

        const response = await askAgent(requestData)

        // 添加 AI 回答
        agentStore.addMessage({
            type: 'assistant',
            content: response.data.data.Answer,
            credibility: {
                referencedReportCount: response.data.data.ReferencedReportCount,
                suspectedPairCount: response.data.data.SuspectedPairCount
            }
        })
    } catch (error: any) {
        devLog('AI 问答失败', error)
        ElMessage.error(error.message || 'AI 问答失败，请稍后重试')
        agentStore.addMessage({
            type: 'assistant',
            content: '抱歉，我暂时无法回答这个问题，请稍后再试。'
        })
    } finally {
        agentStore.setLoading(false)
        await scrollToBottom()
    }
}

// 发送快捷问题
const sendQuickQuestion = (question: string) => {
    inputMessage.value = question
    sendMessage()
}

// 清空对话
const clearChat = () => {
    agentStore.clearMessages()
    ElMessage.success('对话已清空')
}

// 格式化时间
const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    return date.toLocaleTimeString()
}

// 滚动到底部
const scrollToBottom = async () => {
    await nextTick()
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
}

onMounted(() => {
    loadCourses()
})
</script>

<style scoped>
.agent-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 120px);
    padding: 20px;
    background: #f5f7fa;
}

.quick-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
}

.filter-section {
    margin-bottom: 16px;
    background: white;
    border-radius: 8px;
    padding: 8px;
}

.chat-container {
    flex: 1;
    overflow-y: auto;
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
}

.message-item {
    margin-bottom: 20px;
}

.user-message {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.user-message .message-content {
    background: #409eff;
    color: white;
    padding: 12px 16px;
    border-radius: 12px 12px 0 12px;
    max-width: 70%;
}

.assistant-message {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.assistant-message .message-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    color: #606266;
    font-size: 14px;
}

.assistant-message .message-content {
    background: #f4f4f5;
    padding: 12px 16px;
    border-radius: 12px 12px 12px 0;
    max-width: 80%;
}

.assistant-message .message-content p {
    margin: 0;
    line-height: 1.8;
}

.assistant-message .message-content.loading {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #909399;
}

.credibility-info {
    margin-top: 12px;
}

.message-time {
    font-size: 12px;
    color: #909399;
    margin-top: 6px;
}

.welcome-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #606266;
}

.welcome-message h2 {
    margin: 16px 0 8px;
}

.welcome-message p {
    color: #909399;
}

.quick-questions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 20px;
    justify-content: center;
}

.input-area {
    background: white;
    border-radius: 8px;
    padding: 16px;
}

.input-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
}

.hint {
    font-size: 12px;
    color: #909399;
}

/* Markdown 样式 */
.markdown-body {
    line-height: 1.8;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
    margin-top: 16px;
    margin-bottom: 8px;
    font-weight: 600;
    line-height: 1.25;
}

.markdown-body h1 {
    font-size: 1.5em;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 8px;
}

.markdown-body h2 {
    font-size: 1.3em;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 6px;
}

.markdown-body h3 {
    font-size: 1.15em;
}

.markdown-body p {
    margin: 8px 0;
}

.markdown-body ul,
.markdown-body ol {
    padding-left: 24px;
    margin: 8px 0;
}

.markdown-body li {
    margin: 4px 0;
}

.markdown-body code {
    background: #f5f7fa;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
}

.markdown-body pre {
    background: #f5f7fa;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 8px 0;
}

.markdown-body pre code {
    background: transparent;
    padding: 0;
}

.markdown-body strong {
    font-weight: 600;
}

.markdown-body em {
    font-style: italic;
}

.markdown-body a {
    color: #409eff;
    text-decoration: none;
}

.markdown-body a:hover {
    text-decoration: underline;
}

.markdown-body blockquote {
    border-left: 4px solid #409eff;
    padding-left: 12px;
    margin: 8px 0;
    color: #606266;
}

.markdown-body table {
    border-collapse: collapse;
    width: 100%;
    margin: 8px 0;
}

.markdown-body table th,
.markdown-body table td {
    border: 1px solid #e5e7eb;
    padding: 8px 12px;
    text-align: left;
}

.markdown-body table th {
    background: #f5f7fa;
    font-weight: 600;
}

.markdown-body hr {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 16px 0;
}
</style>
