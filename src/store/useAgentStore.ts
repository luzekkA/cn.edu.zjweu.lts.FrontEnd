import { defineStore } from 'pinia'
import { Names } from './store-name'

interface Message {
    id: string
    type: 'user' | 'assistant'
    content: string
    timestamp: Date
    credibility?: {
        referencedReportCount: number
        suspectedPairCount: number
    }
}

interface FilterOptions {
    courseId: number | null
    classId: number | null
    topicId: number | null
    maxReportCount: number
    similarityThreshold: number
}

export const useAgentStore = defineStore(Names.AGENTSTORE, {
    state: () => ({
        messages: [] as Message[],
        currentMode: 'normal' as 'normal' | 'similarity',
        isLoading: false,
        filterOptions: {
            courseId: null,
            classId: null,
            topicId: null,
            maxReportCount: 8,
            similarityThreshold: 0.7
        } as FilterOptions
    }),

    actions: {
        addMessage(message: Omit<Message, 'id' | 'timestamp'>) {
            const newMessage: Message = {
                ...message,
                id: Date.now().toString(),
                timestamp: new Date()
            }
            this.messages.push(newMessage)
        },
        setMode(mode: 'normal' | 'similarity') {
            this.currentMode = mode
        },
        updateFilter(options: Partial<FilterOptions>) {
            this.filterOptions = { ...this.filterOptions, ...options }
        },
        clearMessages() {
            this.messages = []
        },
        setLoading(loading: boolean) {
            this.isLoading = loading
        }
    },

    getters: {
        lastMessage: (state) => state.messages[state.messages.length - 1] || null,
        messageCount: (state) => state.messages.length
    }
})
