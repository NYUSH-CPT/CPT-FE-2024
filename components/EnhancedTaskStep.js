import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Link from '@mui/material/Link'
import { Badge } from '@mui/material'
import moment from 'moment'
import styles from '@/styles/article.module.scss'
import { EnhancedTaskState, TASK_STATUS } from '@/utils/enhancedTaskState'

export default function EnhancedTaskStep({ 
    item, 
    userInfo, 
    uuid, 
    onTaskClick,
    viewInfo = {},
    fieldNameMap = {},
    expStart
}) {
    const taskState = new EnhancedTaskState(userInfo)
    const day = item.day
    
    // 获取任务状态
    const taskStatus = taskState.getTaskStatus(day)
    
    // 计算步骤属性
    const stepProps = calculateStepProps(taskStatus)
    
    // 计算链接
    const link = calculateLink(day, item, uuid, taskStatus, userInfo)
    
    // 计算可见性
    const invisible = !taskState.shouldShowBadge(day, viewInfo)
    
    // 处理点击事件
    const handleClick = async (e) => {
        e.preventDefault()
        if (onTaskClick) {
            await onTaskClick(e, link, stepProps, day)
        } else {
            window.location.href = link
        }
    }

    return (
        <Step {...stepProps}>
            <Link onClick={handleClick} href={link}>
                <StepLabel className={styles.stepLabel}>
                    <Badge color='primary' variant='dot' invisible={invisible}>
                        <h4>{item.title}&nbsp;</h4>
                    </Badge>
                    <br/>
                    <span className={styles.description}>
                        {getTaskDescription(item, taskStatus, userInfo)}
                    </span>
                    <br/>
                    <span className={styles.inactiveReason}>
                        {getInactiveReason(taskStatus, day, expStart)}
                    </span>
                </StepLabel>
            </Link>
        </Step>
    )
}

/**
 * 计算步骤属性
 */
function calculateStepProps(taskStatus) {
    const stepProps = { completed: false, active: false }
    
    switch (taskStatus.status) {
        case TASK_STATUS.COMPLETED:
        case TASK_STATUS.SURVEY_COMPLETED:
            stepProps.completed = true
            break
        case TASK_STATUS.CURRENT:
        case TASK_STATUS.SURVEY_AVAILABLE:
            stepProps.active = taskStatus.canAccess
            break
        case TASK_STATUS.BANNED_AT_THIS_DAY:
        case TASK_STATUS.DISABLED:
        case TASK_STATUS.SURVEY_INVALID:
        case TASK_STATUS.SURVEY_TIMEOUT:
            stepProps.active = false
            break
        default:
            stepProps.active = false
    }
    
    return stepProps
}

/**
 * 计算链接
 */
function calculateLink(day, item, uuid, taskStatus, userInfo) {
    if (!taskStatus.canAccess) {
        return "/"
    }
    
    let link = item.url || "/"
    
    // 为调查问卷添加uuid参数
    if ([1, 23, 39, 99].includes(day)) {
        link += `?uuid=${uuid}`
    }
    
    return link
}

/**
 * 获取任务描述
 */
function getTaskDescription(item, taskStatus, userInfo) {
    if (taskStatus.status === TASK_STATUS.COMPLETED || 
        taskStatus.status === TASK_STATUS.SURVEY_COMPLETED) {
        return item.completed_description || "已完成"
    }
    
    if (taskStatus.status === TASK_STATUS.DISABLED ||
        taskStatus.status === TASK_STATUS.BANNED_AT_THIS_DAY) {
        return "已失效"
    }
    
    if (taskStatus.status === TASK_STATUS.SURVEY_INVALID ||
        taskStatus.status === TASK_STATUS.SURVEY_TIMEOUT) {
        return "问卷无效"
    }
    
    return item.description || "预计时间：30分钟"
}

/**
 * 获取非活跃原因
 */
function getInactiveReason(taskStatus, day, expStart) {
    if (taskStatus.reason && taskStatus.reason !== '已完成' && taskStatus.reason !== '当前任务') {
        return taskStatus.reason
    }
    
    // 检查时间窗口
    if (taskStatus.status === TASK_STATUS.CURRENT) {
        const earlistStartDate = expStart.clone().add(day - 1, 'days').add(4, 'hours')
        const latestStartDate = expStart.clone().add(day + (day === 23 ? 6 : 1), 'days').add(4, 'hours')
        
        if (!moment().isBetween(earlistStartDate, latestStartDate) && day !== 39) {
            return `开启时间：${earlistStartDate.format('YYYY-MM-DD hh:mm A')}，结束时间：${latestStartDate.format('YYYY-MM-DD hh:mm A')}`
        }
    }
    
    return ""
}
