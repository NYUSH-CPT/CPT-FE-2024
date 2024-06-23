import { useEffect, useState } from 'react'
import Head from 'next/head'
import Header from '@/components/Header'

import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Link from 'next/link'
import moment from 'moment'

import styles from '@/styles/article.module.scss'

import { TASK_EXP_GRP } from '@/text'
import { requester } from '@/utils'

import { Badge } from '@mui/material'

export default function Home() {
    const [info, setInfo] = useState(null)

    const [dayRead, setDayRead] = useState({4: false, 5: false})

    useEffect(() => {
        requester.get('/info').then(res => {
            setInfo(res.data)
        })
        const days = localStorage.getItem(`__autosave-${window.location.pathname}-day-read`)
        if (days) {
            setDayRead(JSON.parse(days))
        }
    }, [])

    const Tasks = () => {
        const currentDay = info.currentDay
        const expStart = moment(info.startDate)
        const today = moment()
        const daysSinceStart = today.diff(expStart, 'days')
        const activeStep = Math.min(daysSinceStart, currentDay)

        const handleClick = (index) => {
            if ([3,4].includes(index) && index<activeStep) {
                dayRead[index+1] = true;
                localStorage.setItem(`__autosave-${window.location.pathname}-day-read`, JSON.stringify(dayRead))
                setDayRead(dayRead)
            }
        }

        console.log(currentDay, expStart, today, daysSinceStart)
        console.log(activeStep)

        return (
            <>
                <h1>任务列表</h1>
                <p>
                    这里是一些杂七杂八的文本占位符，用来展示任务列表的内容，你可以点击下方的链接来查看具体的任务详情。
                </p>
                <Stepper orientation="vertical" activeStep={activeStep}>
                    {TASK_EXP_GRP.map((item, index) => (
                        <Step key={index}>
                            <Link key={index} href={(index==3 && index<activeStep)? item.completed_url: item.url} onClick={() => handleClick(index)}>
                                <StepLabel>
                                    <h4>{item.title}</h4>
                                    <Badge variant="dot" color='primary' invisible={![3,4].includes(index) || dayRead[index+1] || index>=activeStep}>
                                        <span className="description">{(index<activeStep)? item.completed_description: item.discription}</span>
                                    </Badge>
                                </StepLabel>
                            </Link>
                        </Step>
                    ))}
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
