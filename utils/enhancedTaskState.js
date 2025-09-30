/**
 * 增强的任务状态管理系统
 * 支持小数进度、自动ban检测、不同状态显示
 */

import moment from 'moment'

export class EnhancedTaskState {
    constructor(userInfo) {
        this.info = userInfo
        this.currentDay = userInfo.currentDay
        this.banDay = userInfo.banDay
        this.banFlag = userInfo.banFlag
        this.banTags = userInfo.banTags || []
        this.group = userInfo.group
    }

    /**
     * 获取任务进度信息
     * @returns {Object} { day: number, phase: number, isCompleted: boolean }
     */
    getTaskProgress() {
        const day = Math.floor(this.currentDay)
        const phase = this.currentDay - day
        
        return {
            day,
            phase,
            isCompleted: phase > 0,
            currentDay: this.currentDay
        }
    }

    /**
     * 获取任务状态
     * @param {number} targetDay 
     * @returns {Object} { status: string, canAccess: boolean, reason: string }
     */
    getTaskStatus(targetDay) {
        if (this.banFlag) {
            return this.getBannedTaskStatus(targetDay)
        } else {
            return this.getNormalTaskStatus(targetDay)
        }
    }

    /**
     * 获取被ban用户的任务状态
     * @param {number} targetDay 
     * @returns {Object}
     */
    getBannedTaskStatus(targetDay) {
        if (targetDay < this.banDay) {
            return {
                status: 'completed',
                canAccess: true,
                reason: 'ban前已完成',
                description: '已完成'
            }
        } else if (targetDay === this.banDay) {
            return {
                status: 'banned_at_this_day',
                canAccess: false,
                reason: '在此任务被ban',
                description: '已失效'
            }
        } else if (targetDay > this.banDay) {
            // 检查是否为调查问卷
            if (this.isSurveyDay(targetDay)) {
                return this.getSurveyStatus(targetDay)
            } else {
                return {
                    status: 'disabled',
                    canAccess: false,
                    reason: 'ban后任务已禁用',
                    description: '已失效'
                }
            }
        }
    }

    /**
     * 获取正常用户的任务状态
     * @param {number} targetDay 
     * @returns {Object}
     */
    getNormalTaskStatus(targetDay) {
        if (targetDay < this.currentDay) {
            return {
                status: 'completed',
                canAccess: true,
                reason: '已完成',
                description: '已完成'
            }
        } else if (targetDay === this.currentDay) {
            return {
                status: 'current',
                canAccess: true,
                reason: '当前任务',
                description: this.getTaskDescription(targetDay)
            }
        } else {
            return {
                status: 'upcoming',
                canAccess: false,
                reason: '尚未开始',
                description: this.getTaskDescription(targetDay)
            }
        }
    }

    /**
     * 检查是否为调查问卷日
     * @param {number} day 
     * @returns {boolean}
     */
    isSurveyDay(day) {
        return [1, 23, 39, 99].includes(day)
    }

    /**
     * 获取调查问卷状态
     * @param {number} surveyDay 
     * @returns {Object}
     */
    getSurveyStatus(surveyDay) {
        const surveyKey = `survey${surveyDay}IsValid`
        const surveyValue = this.info[surveyKey]
        
        if (surveyValue === "True") {
            return {
                status: 'survey_completed',
                canAccess: true,
                reason: '调查问卷已完成',
                description: '已完成'
            }
        } else if (surveyValue === "False") {
            return {
                status: 'survey_invalid',
                canAccess: false,
                reason: '调查问卷无效',
                description: '问卷无效'
            }
        } else {
            // 检查时间窗口
            const timeCheck = this.checkSurveyTimeWindow(surveyDay)
            if (timeCheck.isValid) {
                return {
                    status: 'survey_available',
                    canAccess: true,
                    reason: '可做调查问卷',
                    description: this.getTaskDescription(surveyDay)
                }
            } else {
                return {
                    status: 'survey_timeout',
                    canAccess: false,
                    reason: timeCheck.reason,
                    description: '问卷无效'
                }
            }
        }
    }

    /**
     * 检查调查问卷时间窗口
     * @param {number} surveyDay 
     * @returns {Object}
     */
    checkSurveyTimeWindow(surveyDay) {
        // 这里可以根据实际需求实现时间窗口检查
        // 暂时返回默认值
        return { isValid: true, reason: null }
    }

    /**
     * 获取任务描述
     * @param {number} day 
     * @returns {string}
     */
    getTaskDescription(day) {
        // 这里可以根据day返回具体的任务描述
        // 暂时返回默认值
        return "预计时间：30分钟"
    }

    /**
     * 检查任务是否在时间窗口内
     * @param {number} day 
     * @param {moment} expStart 
     * @returns {Object}
     */
    checkTimeWindow(day, expStart) {
        const earlistStartDate = expStart.clone().add(day - 1, 'days').add(4, 'hours')
        const latestStartDate = expStart.clone().add(day + (day === 23 ? 6 : 1), 'days').add(4, 'hours')
        
        if (!moment().isBetween(earlistStartDate, latestStartDate) && day !== 39) {
            return {
                isValid: false,
                reason: `开启时间：${earlistStartDate.format('YYYY-MM-DD hh:mm A')}，结束时间：${latestStartDate.format('YYYY-MM-DD hh:mm A')}`
            }
        }
        
        return { isValid: true, reason: null }
    }

    /**
     * 获取用户状态类型
     * @returns {string}
     */
    getUserStatusType() {
        if (!this.group || this.group === '') return 'ungrouped'
        if (this.banFlag) return 'banned'
        if (this.group === 'Waitlist') return 'waitlist'
        if (this.group === 'Exp1' || this.group === 'Exp2') return 'experimental'
        return 'unknown'
    }

    /**
     * 获取ban标签对应的消息类型
     * @returns {string}
     */
    getBanMessageType() {
        if (this.banTags.includes('pre_survey_invalid')) return 'pre_survey_invalid'
        if (this.banTags.includes('post_survey_invalid')) return 'post_survey_invalid'
        if (this.banTags.includes('task1_not_done')) return 'task1_not_done'
        if (this.banTags.includes('task_not_done')) return 'task_not_done'
        if (this.banTags.includes('writing_quality_fail')) return 'writing_quality_fail'
        if (this.banTags.includes('game_score_low')) return 'game_score_low'
        return 'general_ban'
    }

    /**
     * 检查是否需要显示Badge
     * @param {number} day 
     * @param {Object} viewInfo 
     * @returns {boolean}
     */
    shouldShowBadge(day, viewInfo) {
        if (this.group === 'Waitlist') return false
        
        const unViewed = (day) => {
            return ((day < this.currentDay) || (day === this.currentDay && (day === 7 || day === 9))) && 
                   Object.keys(viewInfo).map(Number).includes(day) && 
                   !viewInfo[day]
        }
        
        return unViewed(day)
    }
}

/**
 * 任务状态常量
 */
export const TASK_STATUS = {
    COMPLETED: 'completed',
    CURRENT: 'current',
    UPCOMING: 'upcoming',
    BANNED_AT_THIS_DAY: 'banned_at_this_day',
    DISABLED: 'disabled',
    SURVEY_AVAILABLE: 'survey_available',
    SURVEY_COMPLETED: 'survey_completed',
    SURVEY_INVALID: 'survey_invalid',
    SURVEY_TIMEOUT: 'survey_timeout'
}

/**
 * Ban消息类型常量
 */
export const BAN_MESSAGE_TYPES = {
    PRE_SURVEY_INVALID: 'pre_survey_invalid',
    POST_SURVEY_INVALID: 'post_survey_invalid',
    TASK1_NOT_DONE: 'task1_not_done',
    TASK_NOT_DONE: 'task_not_done',
    WRITING_QUALITY_FAIL: 'writing_quality_fail',
    GAME_SCORE_LOW: 'game_score_low',
    GENERAL_BAN: 'general_ban'
}
