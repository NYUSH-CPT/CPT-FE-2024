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
            })
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
        


        const handleClick = (day) =>  {
            if (Object.keys(viewInfo).map(Number).includes(day)) {
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
                        const stepProps = {completed: false, active: false};
                        let link = "/", description = "";
                        if (item.day == currentDay) {
                            stepProps.active = true
                            link = item.url
                            const earlistStartDate = expStart.clone().add(item.day - 1, 'days').add(4, 'hours')
                            const latestStartDate = expStart.clone().add(item.day + 1, 'days').add(4, 'hours')
                            const hasViewedAll = Object.keys(viewInfo).map(Number).filter(day => day < item.day).every(day => viewInfo[day]); 
                            if (info.banFlag) {
                                stepProps.active = false
                                description += "后台禁止用户访问，原因 [" + info.banReason + "]。\n"
                            } else {
                                if (!moment().isBetween(earlistStartDate, latestStartDate)) {
                                    stepProps.active = false
                                    description += "开启时间：" + earlistStartDate.format('YYYY-MM-DD hh:mm A') + "，结束时间：" + latestStartDate.format('YYYY-MM-DD hh:mm A') + "。\n"
                                } else if (item.day === 7) {
                                    if (!info.feedback6) {
                                        stepProps.active = false
                                        description += "管理员还未为您提供第6天的反馈。\n"
                                    }
                                } else if (item.day === 9) {
                                    if (!info.feedback8) {
                                        stepProps.active = false
                                        description += "管理员还未为您提供第8天的反馈。\n"
                                    }
                                }
                                if (!hasViewedAll) {
                                    stepProps.active = false
                                    const dayToRead = Object.keys(viewInfo).map(Number).filter(day => (!viewInfo[day] && day < item.day)).reduce((max, day) => Math.max(max, day), -Infinity);
                                    description += `请先查看第${dayToRead}天的反馈。\n`
                                } 
                            }
                        } else if (item.day > currentDay) {
                            stepProps.active = false
                            link = "/"
                        } else if (item.day < currentDay) {
                            stepProps.completed = true
                            link = item.completed_url || item.url
                        }

                        return (
                            <Step key={index} {...stepProps} >
                                <Link
                                    href={link} 
                                    onClick={() => handleClick(item.day)}
                                >
                                    <StepLabel className={styles.stepLabel}>
                                        <h4>{item.title}</h4>
                                        <span className={styles.description}>{item.day<currentDay? item.completed_description: item.description}</span><br/>
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
