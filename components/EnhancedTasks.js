import Stepper from '@mui/material/Stepper'
import moment from 'moment'
import { TASK_EXP_GRP, TASK_WL_GRP } from '@/text'
import { requester } from '@/utils'
import EnhancedTaskStep from './EnhancedTaskStep'

export default function EnhancedTasks(props) {
    const info = props.info
    const currentDay = info.currentDay
    const expStart = moment(info.startDate)
    const today = moment().startOf('days')
    const daysSinceStart = today.diff(expStart, 'days') + 1
    const group = info.group
    const uuid = info.uuid

    // 根据用户分组选择任务列表和显示内容
    if (group === "") {
        return renderUngroupedUser(info, uuid)
    } else if (group === 'Waitlist') {
        return renderWaitlistUser(info, daysSinceStart, expStart, uuid)
    } else {
        return renderExperimentalUser(info, daysSinceStart, expStart, uuid)
    }
}

/**
 * 渲染未分组用户界面
 */
function renderUngroupedUser(info, uuid) {
    const tasks = [{
        day: 1,
        title: '第1天：前测问卷调查',
        description: '预计时间：30分钟',
        completed_description: '已完成',
        url: 'https://nyu.qualtrics.com/jfe/form/SV_bfqaJJoB84pUy4C',
        completed_url: '/'
    }]

    return (
        <>
            <h1>任务列表</h1>
            <p>请先完成前测问卷调查，完成后系统将自动为您分配实验组别。</p>
            <Stepper orientation="vertical">
                {tasks.map((item, index) => (
                    <EnhancedTaskStep
                        key={index}
                        item={item}
                        userInfo={info}
                        uuid={uuid}
                        expStart={moment(info.startDate)}
                    />
                ))}
            </Stepper>
        </>
    )
}

/**
 * 渲染Waitlist用户界面
 */
function renderWaitlistUser(info, daysSinceStart, expStart, uuid) {
    const viewInfo = {}
    const fieldNameMap = {}

    const handleTaskClick = async (e, link, stepProps, day) => {
        e.preventDefault()
        window.location.href = link
    }

    return (
        <>
            <h1>任务列表</h1>
            <p>
                {daysSinceStart > 0 ? 
                    (`欢迎回来！这是您参与研究的第 ${daysSinceStart} 天。`) : 
                    (`您的实验将于 ${expStart.format('YYYY-MM-DD')} 开始。`)
                }<br/>
                您可以在完成第1天的调查问卷以及第23天的随访评估后获得补偿哦！补偿金额将由任务完成的进度和质量共同决定，并将在最后一次随访评估后的三天内发放给您！此外，您还将获得一次免费参与心理干预项目的机会！项目将在您完成上述任务后自动开放，欢迎您的参与～
            </p>
            <Stepper orientation="vertical">
                {TASK_WL_GRP.map((item, index) => (
                    <EnhancedTaskStep
                        key={index}
                        item={item}
                        userInfo={info}
                        uuid={uuid}
                        onTaskClick={handleTaskClick}
                        viewInfo={viewInfo}
                        fieldNameMap={fieldNameMap}
                        expStart={expStart}
                    />
                ))}
            </Stepper>
        </>
    )
}

/**
 * 渲染实验组用户界面
 */
function renderExperimentalUser(info, daysSinceStart, expStart, uuid) {
    const viewInfo = {
        4: info.writing4Viewed, 
        5: info.writing5Viewed, 
        7: info.feedback6Viewed, 
        9: info.feedback8Viewed
    }
    const fieldNameMap = {
        4: 'writing4Viewed',
        5: 'writing5Viewed',
        7: 'feedback6Viewed',
        9: 'feedback8Viewed'
    }

    const handleTaskClick = async (e, link, stepProps, day) => {
        e.preventDefault()
        console.log("HandleClick", day)
        
        const unViewed = (day) => {
            return ((day < info.currentDay) || (day === info.currentDay && (day === 7 || day === 9))) && 
                   Object.keys(viewInfo).map(Number).includes(day) && 
                   !viewInfo[day]
        }
        
        if (unViewed(day) && (stepProps.active || stepProps.completed)) {
            const fieldName = fieldNameMap[day]
            const payload = {[fieldName]: true}
            viewInfo[day] = true
            console.log("Update view info", payload)
            await requester.post("/info", payload)
        }
        window.location.href = link
    }

    return (
        <>
            <h1>任务列表</h1>
            <p>
                {daysSinceStart > 0 ? 
                    (`欢迎回来！这是您参与研究的第 ${daysSinceStart} 天。`) : 
                    (`您的实验将于 ${expStart.format('YYYY-MM-DD')} 开始。`)
                }<br/>
                您可以在完成9天的任务以及第23天的评估后分别获得补偿哦！补偿金额将由任务完成的进度和质量共同决定。金额将逐次累积并在最后一次随访评估后的三天内发放给您！
            </p>
            <Stepper orientation="vertical">
                {TASK_EXP_GRP.map((item, index) => (
                    <EnhancedTaskStep
                        key={index}
                        item={item}
                        userInfo={info}
                        uuid={uuid}
                        onTaskClick={handleTaskClick}
                        viewInfo={viewInfo}
                        fieldNameMap={fieldNameMap}
                        expStart={expStart}
                    />
                ))}
            </Stepper>
        </>
    )
}
