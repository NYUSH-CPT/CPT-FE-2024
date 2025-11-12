import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Link from '@mui/material/Link'
import moment from 'moment'

import styles from '@/styles/article.module.scss'

import { TASK_EXP_GRP, TASK_WL_GRP } from '@/text'
import { requester } from '@/utils'
import { useInfo } from '@/context/InfoContext'

import { Badge } from '@mui/material'

import { useRouter } from 'next/router'

export default function Tasks() {

    const { info, refresh, loading } = useInfo()

    const router = useRouter()

    if (loading) {
        return <>加载中......</>;
    }

    if (!info || info.survey1IsValid === "False") {
        return <>抱歉，您没有权限访问此页面。</>;
    }

    const {
        currentDay,
        startDate,
        group,
        uuid,
        banFlag,
        banDay,
    } = info;

    const now = moment();
    const expStart = moment(startDate)
    const today = moment().startOf('days')
    const daysSinceStart = today.diff(expStart, 'days')+1
    const surveyDays = [23, 39, 99]

    if (group == "Null") {
        return (
        <>
            <h1>任务列表</h1>
            <p>
                {`参与者您好！感谢参与我们的研究。我们邀请您完成该研究的第一项任务——一份问卷调查。您需要在${expStart.format('YYYY-MM-DD')}凌晨4点前完成该问卷，否则您将无法继续参与后续研究并获得相应报酬。期待您的参与！`}
                <br/><br/>
                温馨提示：为保护您的个人隐私，请勿将链接分享给他人。期待您的参与，祝您生活愉快！
           </p>
            <Stepper orientation="vertical" >
                <Step completed={false}>
                    <Link
                        href={`https://nyu.qualtrics.com/jfe/form/SV_6FIG6R7YKjvBn14?uuid=${uuid}`}
                    >
                        <StepLabel className={styles.stepLabel}>
                            <h4>第0天：调查问卷&nbsp;</h4>
                            <span className={styles.description}>预计时间：30分钟</span><br/>
                        </StepLabel>
                    </Link>
                </Step>
            </Stepper>
        </>
        )
    }

    const windowForDay = (day) => {
        const earliest = expStart.clone().add(day - 1, "days").add(4, "hours");
        const latest = expStart
          .clone()
          .add(day + (surveyDays.includes(day) ? 6 : 1), "days")
          .add(4, "hours");
        return { earliest, latest };
      };
    
    const formatWindow = (earliest, latest) =>
    `开启时间：${earliest.format("YYYY-MM-DD hh:mm A")}，结束时间：${latest.format("YYYY-MM-DD hh:mm A")}。\n`;
    

    if (group == 'Waitlist') {
        return (
            <>
            <h1>任务列表</h1>
            <p>
            {daysSinceStart > 0 ? 
                (`欢迎回来！这是您参与研究的第 ${daysSinceStart} 天。`) : 
                (`您的实验将于 ${expStart.format('YYYY-MM-DD')} 开始。`)
            }<br/>
            您可以在完成后续的随访评估后获得补偿哦！补偿金额将由任务完成的进度和质量共同决定，并将在最后一次随访评估后的三天内发放给您！此外，您还将获得一次免费参与心理干预项目的机会！项目将在您完成上述任务后自动开放，欢迎您的参与～
            </p>
            <Stepper orientation="vertical" >
                {TASK_WL_GRP.map((item, index) => {
                    const day = item.day;
                    const stepProps = {completed: false, active: false};
                    const { earliest, latest } = windowForDay(day);
                    let link = "/", description = "";
                    
                    if (day == currentDay) {
                        stepProps.active = true
                        if (!now.isBetween(earliest, latest) && day != 100) {
                            stepProps.active = false
                            description += formatWindow(earliest, latest)
                        }
                        link = stepProps.active? item.url + `?uuid=${uuid}`: "/"
                    } else if (day > currentDay) {
                        stepProps.active = false
                        link = "/"
                    } else if (day < currentDay) {
                        stepProps.completed = true
                        link = "/"
                        if (day == 100) {
                            stepProps.active = true
                            stepProps.completed = false
                        }
                        if (surveyDays.includes(day) && info[`survey${day}IsValid`] === "False") {
                            stepProps.completed = false
                            stepProps.active = false
                            item.completed_description = "问卷无效"
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
    } 

    const viewInfo = {4: info.writing4Viewed, 5: info.writing5Viewed, 7: info.feedback6Viewed, 9: info.feedback8Viewed}
    const fieldNameMap = {
        4: 'writing4Viewed',
        5: 'writing5Viewed',
        7: 'feedback6Viewed',
        9: 'feedback8Viewed'
    };

    const gateDays = Object.keys(viewInfo).map(Number);

    const unViewed = (day) => {
      if (!gateDays.includes(day)) return false;
      const isGateWindow =
        (!banFlag && day < currentDay) || (!banFlag && (day === 7 || day === 9) && day === currentDay);
      return isGateWindow && !viewInfo[day];
    }
    
    const handleClick = async (e, link, stepProps, day) =>  {
        e.preventDefault()
        console.log("HandleClick", day)
        try {
            if (unViewed(day) && (stepProps.active||stepProps.completed)) {
                const fieldName = fieldNameMap[day];
                const payload = {[fieldName]: true}
                viewInfo[day] = true
                console.log("Update view info", payload)
                await requester.post("/info", payload)
                await refresh()
            } 
        } catch (_) {
        } finally {
            router.push(link)
        }
    }

    return (<>
        <h1>任务列表</h1>
        <p>
        {daysSinceStart > 0 ? 
            (`欢迎回来！这是您参与研究的第 ${daysSinceStart} 天。`) : 
            (`您的实验将于 ${expStart.format('YYYY-MM-DD')} 开始。`)
        }<br/>

        您可以在完成9天的任务以及后续评估后分别获得补偿哦！补偿金额将由任务完成的进度和质量共同决定。金额将逐次累积并在最后一次随访评估后的三天内发放给您！
        </p>
        <Stepper orientation="vertical" >
            {TASK_EXP_GRP.map((item, index) => {
                const day = item.day;
                const stepProps = {completed: false, active: false};
                const { earliest, latest } = windowForDay(day);
                let link = "/", description = "", invisible = true;
                invisible = !(unViewed(day))

                if (!banFlag) {
                    if (day == currentDay) {
                        stepProps.active = true
                        const hasViewedAll = Object.keys(viewInfo).map(Number).filter(d => d < day).every(d => viewInfo[d]); 
                        if (!now.isBetween(earliest, latest)) {
                            stepProps.active = false
                            description += formatWindow(earliest, latest)
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
                        link = stepProps.active? item.url: "/"
                        if (stepProps.active && surveyDays.includes(day)) {
                            link += `?uuid=${uuid}`
                        }
                        invisible = invisible || !stepProps.active
                    } else if (day > currentDay) {
                        stepProps.active = false
                        link = "/"
                    } else if (day < currentDay) {
                        stepProps.completed = true
                        link = item.completed_url || item.url
                        if (surveyDays.includes(day) && info[`survey${day}IsValid`] === "False") {
                            stepProps.completed = false
                            stepProps.active = false
                            item.completed_description = "问卷无效"
                        } 
                    }
                } else {
                    if (day == banDay) {
                        description += "抱歉！后续干预任务已失效。参与后续随访调查仍可获得现金补偿！\n"
                    } else if (day > banDay) {
                        stepProps.active = false
                        link = "/"
                        if (surveyDays.includes(day)) {
                            if (info[`survey${day}IsValid`] === "False") {
                                stepProps.completed = false
                                item.description = "问卷无效"
                            } else if (info[`survey${day}IsValid`] === "True") {
                                stepProps.completed = true
                                item.description = "已完成"
                            } else {
                                if (now.isBetween(earliest, latest)) {
                                    stepProps.active = true
                                    link = item.url + `?uuid=${uuid}`
                                } else if (moment().isAfter(latest)) {
                                    item.description = "问卷无效"
                                } else {
                                    description += formatWindow(earliest, latest)
                                }
                            }
                        } else {
                            item.description = "已失效"
                        }
                    } else if (day < banDay) {
                        stepProps.completed = true
                        stepProps.active = true
                        if (surveyDays.includes(day) && info[`survey${day}IsValid`] === "False") {
                            stepProps.active = false
                            item.completed_description = "问卷无效"
                        } else {
                            item.description = "已失效"
                        }
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
                                <span className={styles.description}>{(day<currentDay&&!banFlag) || (day<banDay && banFlag)? item.completed_description: item.description}</span><br/>
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
