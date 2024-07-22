import { act, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import Head from 'next/head'
import Header from '@/components/Header'

import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Link from '@mui/material/Link'
import moment from 'moment'

import styles from '@/styles/article.module.scss'

import { TASK_EXP_GRP } from '@/text'
import { requester } from '@/utils'


import { Badge } from '@mui/material'

export default function Home() {
    const [info, setInfo] = useState(null)
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("access_token")
        if (!token) {
            router.push('/login')
        } else {
            requester.get('/info').then(res => {
                setInfo(res.data)
                console.log(res.data)
            }).catch(err => {})
        }
    }, [])
    

    const Tasks = () => {
        const currentDay = info.currentDay
        const expStart = moment(info.startDate)
        const today = moment().startOf('days')
        const daysSinceStart = today.diff(expStart, 'days')+1
        console.log(today, expStart)
        console.log(currentDay, daysSinceStart)

        const viewInfo = {4: info.challengeWriting1Viewed, 5: info.challengeWriting2Viewed, 7: info.feedback6Viewed, 9: info.feedback8Viewed}
        const fieldNameMap = {
            4: 'challengeWriting1Viewed',
            5: 'challengeWriting2Viewed',
            7: 'feedback6Viewed',
            9: 'feedback8Viewed'
        };

        const unViewed = (day) => {
            return ((day < currentDay) || (day == currentDay && (day==7 || day==9))) && Object.keys(viewInfo).map(Number).includes(day) && !viewInfo[day]
        }
        
        const handleClick = (stepProps, day) =>  {
            console.log("HandleClick", day)
            if (unViewed(day) && (stepProps.active||stepProps.completed)) {
                const fieldName = fieldNameMap[day];
                const payload = {[fieldName]: true}
                console.log("Update view info", payload)
                requester.post("/info", payload)
            }
        }

        return (
            <>
                <h1>任务列表</h1>
                <p>
                欢迎回来！这是您参与研究的第{daysSinceStart}天。<br/>
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
                            const latestStartDate = expStart.clone().add(day + 1, 'days').add(4, 'hours')
                            const hasViewedAll = Object.keys(viewInfo).map(Number).filter(d => d < day).every(d => viewInfo[d]); 
                            if (info.banFlag) {
                                stepProps.active = false
                                description += "后台禁止用户访问，原因 [" + info.banReason + "]。\n"
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
                            invisible = invisible || !stepProps.active
                        } else if (day > currentDay) {
                            stepProps.active = false
                            link = "/"
                        } else if (day < currentDay) {
                            stepProps.completed = true
                            link = item.completed_url || item.url
                        }


                        return (
                            
                            <Step key={index} {...stepProps} >
                                <Link
                                    href={link} 
                                    onClick={() => handleClick(stepProps, day)}
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
    return (
        <>
            <Head>
                <title>{process.env.NEXT_PUBLIC_PROJECT_NAME}</title>
            </Head>
            <Header />
            <main className={styles.article}>
                {info ? (
                    <>
                        <Tasks />
                    </>
                ) : (
                    '登录中...'
                )}
            </main>
        </>
    )
}
