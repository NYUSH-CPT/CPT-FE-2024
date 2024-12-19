import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Link from '@mui/material/Link'
import moment from 'moment'

import styles from '@/styles/article.module.scss'

import { TASK_EXP_GRP, TASK_WL_GRP } from '@/text'
import { requester } from '@/utils'

import { Badge } from '@mui/material'

export default function Tasks(props) {

    const info = props.info
    const currentDay = info.currentDay
    const expStart = moment(info.startDate)
    const today = moment().startOf('days')
    const daysSinceStart = today.diff(expStart, 'days')+1
    const group = info.group
    const uuid = info.uuid
    const banDay = info.banDay

    if (group == 'Waitlist') {
        return (
            <>
            <h1>任务列表</h1>
            <p>
            {daysSinceStart > 0 ? 
                (`欢迎回来！这是您参与研究的第 ${daysSinceStart} 天。`) : 
                (`您的实验将于 ${expStart.format('YYYY-MM-DD')} 开始。`)
            }<br/>
            您可以在完成第1天的调查问卷以及第23天、第39天与第99天的随访评估后分别获得补偿哦！补偿金额将由任务完成的进度和质量共同决定。金额将逐次累积并在最后一次随访评估后的三天内发放给您！此外，您还将获得一次免费参与心理干预项目的机会！项目将在您完成上述任务后自动开放，欢迎您的参与～
            </p>
            <Stepper orientation="vertical" >
                {TASK_WL_GRP.map((item, index) => {
                    const day = item.day;
                    const stepProps = {completed: false, active: false};
                    let link = "/", description = "";
    
                    if (day == currentDay) {
                        stepProps.active = true
                        const earlistStartDate = expStart.clone().add(day - 1, 'days').add(4, 'hours')
                        const latestStartDate = expStart.clone().add(day + ([23, 39, 99].includes(day)? 6 : 1), 'days').add(4, 'hours')
                        if (info.banFlag && ![23, 39, 99].includes(day)) {
                            stepProps.active = false
                            description += "抱歉！后续干预任务已失效。参与后续随访调查仍可获得现金补偿！\n"
                        } else {
                            if (!moment().isBetween(earlistStartDate, latestStartDate) && day!==100) {
                                stepProps.active = false
                                description += "开启时间：" + earlistStartDate.format('YYYY-MM-DD hh:mm A') + "，结束时间：" + latestStartDate.format('YYYY-MM-DD hh:mm A') + "。\n"
                            }
                        }
                        link = stepProps.active? item.url + `?uuid=${uuid}`: "/"
                    } else if (day > currentDay) {
                        stepProps.active = false
                        link = "/"
                        if (info.banFlag && day > banDay && daysSinceStart > currentDay) {
                            const latestStartDate = expStart.clone().add(day + ([23, 39, 99].includes(day)? 6 : 1), 'days').add(4, 'hours')
                            if (moment().isBetween(expStart, latestStartDate)) {
                                stepProps.active = true
                                link = item.url + `?uuid=${uuid}`
                            } else {
                                item.description = "已逾期"
                            }
                        }
                    } else if (day < currentDay) {
                        stepProps.completed = true
                        link = item.completed_url || item.url
                        if ([23, 39, 99].includes(day) && info[`survey${day}IsValid`] === "False") {
                            stepProps.completed = false
                            stepProps.active = false
                            item.completed_description = "已逾期"
                        }
                    }
    
                    return (
                        <Step key={index} {...stepProps} >
                            <Link
                                href={link} 
                            >
                                <StepLabel className={styles.stepLabel}>
                                    <h4>{item.title}&nbsp;</h4>
                                    <span className={styles.description}>{day<currentDay? item.completed_description: item.description}</span><br/>
                                    <span className={styles.inactiveReason}>{description}</span>
                                </StepLabel>
                            </Link>
                        </Step>
                    )
                })}
            </Stepper>
            </>
        )
    } else {
        const viewInfo = {4: info.writing4Viewed, 5: info.writing5Viewed, 7: info.feedback6Viewed, 9: info.feedback8Viewed}
        const fieldNameMap = {
            4: 'writing4Viewed',
            5: 'writing5Viewed',
            7: 'feedback6Viewed',
            9: 'feedback8Viewed'
        };

        const unViewed = (day) => {
            return ((day < currentDay) || (day == currentDay && (day==7 || day==9))) && Object.keys(viewInfo).map(Number).includes(day) && !viewInfo[day]
        }
        
        const handleClick = async (e, link, stepProps, day) =>  {
            e.preventDefault()
            console.log("HandleClick", day)
            if (unViewed(day) && (stepProps.active||stepProps.completed)) {
                const fieldName = fieldNameMap[day];
                const payload = {[fieldName]: true}
                viewInfo[day] = true
                console.log("Update view info", payload)
                await requester.post("/info", payload)
            }
            window.location.href = link
        }

        return (<>
            <h1>任务列表</h1>
            <p>
            {daysSinceStart > 0 ? 
                (`欢迎回来！这是您参与研究的第 ${daysSinceStart} 天。`) : 
                (`您的实验将于 ${expStart.format('YYYY-MM-DD')} 开始。`)
            }<br/>

            您可以在完成9天的任务以及第23天、第39天与第99天的评估后分别获得补偿哦！补偿金额将由任务完成的进度和质量共同决定。金额将逐次累积并在最后一次随访评估后的三天内发放给您！
            </p>
            <Stepper orientation="vertical" >
                {TASK_EXP_GRP.map((item, index) => {
                    const day = item.day;
                    const stepProps = {completed: false, active: false};
                    let link = "/", description = "", invisible = true;
                    invisible = !(unViewed(day))
    
                    if (day == currentDay) {
                        stepProps.active = true
                        const earlistStartDate = expStart.clone().add(day - 1, 'days').add(4, 'hours')
                        const latestStartDate = expStart.clone().add(day + ([23, 39, 99].includes(day)? 6 : 1), 'days').add(4, 'hours')
                        const hasViewedAll = Object.keys(viewInfo).map(Number).filter(d => d < day).every(d => viewInfo[d]); 
                        if (info.banFlag && ![23, 39, 99].includes(day)) {
                            stepProps.active = false
                            description += "抱歉！后续干预任务已失效。参与后续随访调查仍可获得现金补偿！\n"
                        } else {
                            if (!moment().isBetween(earlistStartDate, latestStartDate)) {
                                stepProps.active = false
                                description += "开启时间：" + earlistStartDate.format('YYYY-MM-DD hh:mm A') + "，结束时间：" + latestStartDate.format('YYYY-MM-DD hh:mm A') + "。\n"
                            } else if (day === 7) {
                                if (!info.feedback6) {
                                    stepProps.active = false
                                    description += "请耐心等待第6天的反馈\n"
                                }
                            } else if (day === 9) {
                                if (!info.feedback8) {
                                    stepProps.active = false
                                    description += "请耐心等待第8天的反馈\n"
                                }
                            }
                            if (!hasViewedAll) {
                                stepProps.active = false
                                const dayToRead = Object.keys(viewInfo).map(Number).filter(d => (!viewInfo[d] && d < day)).reduce((max, day) => Math.max(max, day), -Infinity);
                                description += `请先查看第${dayToRead}天的反馈。\n`
                            } 
                        }
                        link = stepProps.active? item.url: "/"
                        if (stepProps.active && [1, 23, 39, 99].includes(day)) {
                            link += `?uuid=${uuid}`
                        }
                        invisible = invisible || !stepProps.active
                    } else if (day > currentDay) {
                        stepProps.active = false
                        link = "/"
                        if (info.banFlag && [23, 39, 99].includes(day) && day > banDay && daysSinceStart > currentDay) {
                            const earlistStartDate = expStart.clone().add(day - 1, 'days').add(4, 'hours')
                            const latestStartDate = expStart.clone().add(day + 6, 'days').add(4, 'hours')
                            if (moment().isBetween(earlistStartDate, latestStartDate)) {
                                stepProps.active = true
                                link = item.url + `?uuid=${uuid}`
                            } else if (moment().isAfter(latestStartDate)) {
                                item.description = "已逾期"
                            } else {
                                description += "开启时间：" + earlistStartDate.format('YYYY-MM-DD hh:mm A') + "，结束时间：" + latestStartDate.format('YYYY-MM-DD hh:mm A') + "。\n"
                            }
                        } else if (info.banFlag && ![23, 39, 99].includes(day)) {
                            item.description = "已失效"
                        }
                    } else if (day < currentDay) {
                        stepProps.completed = true
                        link = item.completed_url || item.url
                        if ([23, 39, 99].includes(day) && info[`survey${day}IsValid`] === "False") {
                            stepProps.completed = false
                            stepProps.active = false
                            item.completed_description = "已逾期"
                        }
                    }
    
    
                    return (
                        
                        <Step key={index} {...stepProps} >
                            <Link
                                onClick={(e) => handleClick(e, link, stepProps, day)}
                            >
                                <StepLabel className={styles.stepLabel}>
                                    <Badge color='primary' variant='dot' invisible={invisible}>
                                        <h4>{item.title}&nbsp;</h4>
                                    </Badge>
                                    <br/>
                                    <span className={styles.description}>{day<currentDay? item.completed_description: item.description}</span><br/>
                                    <span className={styles.inactiveReason}>{description}</span>
                                </StepLabel>
                                
                            </Link>
                        </Step>
                    )
                })}
            </Stepper>
            </>
        )
    }
}
