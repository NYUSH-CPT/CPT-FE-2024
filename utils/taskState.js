/**
 * 任务状态管理系统
 * 统一管理用户的任务进度和状态
 */

export class TaskState {
    constructor(userInfo) {
        this.info = userInfo
        this.currentDay = userInfo.currentDay
        this.banDay = userInfo.banDay
        this.banFlag = userInfo.banFlag
        this.group = userInfo.group
    }

    /**
     * 获取当前任务阶段
     * @returns {Object} { day: number, phase: string, isCompleted: boolean }
     */
    getCurrentTaskPhase() {
        const day = Math.floor(this.currentDay)
        const phase = this.getPhaseFromDay(this.currentDay)
        
        return {
            day,
            phase,
            isCompleted: this.currentDay > day
        }
    }

    /**
     * 从 currentDay 获取阶段信息
     * @param {number} currentDay 
     * @returns {string}
     */
    getPhaseFromDay(currentDay) {
        if (currentDay < 1) return 'pre_start'
        if (currentDay === 1) return 'survey'
        if (currentDay === 1.1) return 'writing'
        if (currentDay === 1.2) return 'video'
        if (currentDay === 1.3) return 'game'
        if (currentDay >= 2 && currentDay < 10) return 'intervention'
        if (currentDay === 23) return 'followup_1'
        if (currentDay === 39) return 'followup_2'
        if (currentDay === 99) return 'followup_3'
        return 'unknown'
    }

    /**
     * 检查任务是否可用
     * @param {number} targetDay 
     * @returns {Object} { isAvailable: boolean, reason: string }
     */
    isTaskAvailable(targetDay) {
        // 检查是否被ban
        if (this.banFlag) {
            return this.checkBannedTaskAvailability(targetDay)
        }

        // 检查任务是否在当前进度范围内
        if (targetDay > this.currentDay) {
            return { isAvailable: false, reason: 'task_not_started' }
        }

        // 检查时间窗口
        const timeCheck = this.checkTimeWindow(targetDay)
        if (!timeCheck.isValid) {
            return { isAvailable: false, reason: timeCheck.reason }
        }

        return { isAvailable: true, reason: null }
    }

    /**
     * 检查被ban用户的任务可用性
     * @param {number} targetDay 
     * @returns {Object}
     */
    checkBannedTaskAvailability(targetDay) {
        // 被ban用户只能访问调查问卷
        if (targetDay === 23 || targetDay === 39 || targetDay === 99) {
            return { isAvailable: true, reason: 'survey_allowed_for_banned' }
        }
        
        if (targetDay < this.banDay) {
            return { isAvailable: true, reason: 'completed_before_ban' }
        }
        
        if (targetDay === this.banDay) {
            return { isAvailable: false, reason: 'banned_at_this_day' }
        }
        
        return { isAvailable: false, reason: 'banned_after_this_day' }
    }

    /**
     * 检查时间窗口
     * @param {number} targetDay 
     * @returns {Object}
     */
    checkTimeWindow(targetDay) {
        // 这里可以添加具体的时间窗口检查逻辑
        // 暂时返回默认值
        return { isValid: true, reason: null }
    }

    /**
     * 获取任务状态描述
     * @param {number} targetDay 
     * @returns {string}
     */
    getTaskStatusDescription(targetDay) {
        const availability = this.isTaskAvailable(targetDay)
        
        if (!availability.isAvailable) {
            switch (availability.reason) {
                case 'task_not_started':
                    return '任务尚未开始'
                case 'banned_at_this_day':
                    return '抱歉！后续任务已失效。'
                case 'banned_after_this_day':
                    return '抱歉！后续干预任务已失效。参与后续随访调查仍可获得现金补偿！'
                case 'time_window_closed':
                    return '任务时间窗口已关闭'
                default:
                    return '任务不可用'
            }
        }
        
        return ''
    }

    /**
     * 检查是否为未分组用户
     * @returns {boolean}
     */
    isUngrouped() {
        return !this.group || this.group === '' || this.group === 'Null'
    }

    /**
     * 检查是否为Waitlist用户
     * @returns {boolean}
     */
    isWaitlist() {
        return this.group === 'Waitlist'
    }

    /**
     * 检查是否为实验组用户
     * @returns {boolean}
     */
    isExperimental() {
        return this.group === 'Exp1' || this.group === 'Exp2'
    }

    /**
     * 获取用户状态类型
     * @returns {string}
     */
    getUserStatusType() {
        if (this.isUngrouped()) return 'ungrouped'
        if (this.banFlag) return 'banned'
        if (this.isWaitlist()) return 'waitlist'
        if (this.isExperimental()) return 'experimental'
        return 'unknown'
    }
}

/**
 * 任务阶段常量
 */
export const TASK_PHASES = {
    PRE_START: 'pre_start',
    SURVEY: 'survey', 
    WRITING: 'writing',
    VIDEO: 'video',
    GAME: 'game',
    INTERVENTION: 'intervention',
    FOLLOWUP_1: 'followup_1',
    FOLLOWUP_2: 'followup_2', 
    FOLLOWUP_3: 'followup_3'
}

/**
 * 任务可用性原因常量
 */
export const AVAILABILITY_REASONS = {
    TASK_NOT_STARTED: 'task_not_started',
    BANNED_AT_THIS_DAY: 'banned_at_this_day',
    BANNED_AFTER_THIS_DAY: 'banned_after_this_day',
    TIME_WINDOW_CLOSED: 'time_window_closed',
    SURVEY_ALLOWED_FOR_BANNED: 'survey_allowed_for_banned',
    COMPLETED_BEFORE_BAN: 'completed_before_ban'
}
