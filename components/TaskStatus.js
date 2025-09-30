import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Link from '@mui/material/Link'
import { Badge } from '@mui/material'
import moment from 'moment'
import styles from '@/styles/article.module.scss'
import { TaskState } from '@/utils/taskState'

export default function TaskStatus({ 
    item, 
    userInfo, 
    uuid, 
    onTaskClick,
    viewInfo = {},
    fieldNameMap = {}
}) {
    const taskState = new TaskState(userInfo)
    const day = item.day
    
    // 获取任务可用性
    const availability = taskState.isTaskAvailable(day)
    const statusDescription = taskState.getTaskStatusDescription(day)
    
    // 计算步骤属性
    const stepProps = calculateStepProps(day, userInfo, availability)
    
    // 计算链接
    const link = calculateLink(day, item, uuid, availability, userInfo)
    
    // 计算可见性（用于Badge）
    const invisible = calculateInvisible(day, userInfo, viewInfo)
    
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
                        {getTaskDescription(day, item, userInfo, availability)}
                    </span>
                    <br/>
                    <span className={styles.inactiveReason}>{statusDescription}</span>
                </StepLabel>
            </Link>
        </Step>
    )
}

/**
 * 计算步骤属性
 */
function calculateStepProps(day, userInfo, availability) {
    const stepProps = { completed: false, active: false }
    
    if (userInfo.banFlag) {
        // 被ban用户的逻辑
        if (day < userInfo.banDay) {
            stepProps.completed = true
        } else if (day === userInfo.banDay) {
            // 在ban的那一天，任务失效
        } else if (day > userInfo.banDay) {
            // ban之后的干预任务失效，但调查问卷可能仍然可用
            if (availability.isAvailable) {
                stepProps.active = true
            }
        }
    } else {
        // 正常用户的逻辑
        if (day < userInfo.currentDay) {
            stepProps.completed = true
        } else if (day === userInfo.currentDay) {
            stepProps.active = availability.isAvailable
        }
    }
    
    return stepProps
}

/**
 * 计算链接
 */
function calculateLink(day, item, uuid, availability, userInfo) {
    if (!availability.isAvailable) {
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
 * 计算Badge可见性
 */
function calculateInvisible(day, userInfo, viewInfo) {
    if (userInfo.group === 'Waitlist') {
        return true // Waitlist用户不显示Badge
    }
    
    // 检查是否未查看
    const unViewed = (day) => {
        return ((day < userInfo.currentDay) || (day === userInfo.currentDay && (day === 7 || day === 9))) && 
               Object.keys(viewInfo).map(Number).includes(day) && 
               !viewInfo[day]
    }
    
    return !unViewed(day)
}

/**
 * 获取任务描述
 */
function getTaskDescription(day, item, userInfo, availability) {
    if (userInfo.banFlag) {
        if (day < userInfo.banDay) {
            return item.completed_description || "已完成"
        } else if (day === userInfo.banDay) {
            return "已失效"
        } else if (day > userInfo.banDay) {
            if (availability.isAvailable) {
                return item.description
            } else {
                return "已失效"
            }
        }
    } else {
        if (day < userInfo.currentDay) {
            return item.completed_description || "已完成"
        } else {
            return item.description
        }
    }
    
    return item.description
}
