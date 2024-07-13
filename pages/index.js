import { act, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import Head from 'next/head'
import Header from '@/components/Header'

import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Link from 'next/link'
import moment from 'moment'

import Dialog from '@mui/material'

import styles from '@/styles/article.module.scss'

import { TASK_EXP_GRP } from '@/text'
import { requester } from '@/utils'

import { Badge } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StepIcon from '@mui/material'

export default function Home() {
    const [info, setInfo] = useState(null)
    const router = useRouter();
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("access_token")
        if (!token) {
            router.push('/login')
        } else {
            requester.get('/info').then(res => {
                setInfo(res.data)
                console.log(res.data)
            }).catch(error => {
                console.log(error)
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("access token")
                    router.push('/login')
                } else {
                    console.error(error)
                }
            })
        }
    }, [])


    const Tasks = () => {
        const currentDay = info.currentDay
        const expStart = moment(info.startDate)
        const today = moment()
        const daysSinceStart = today.diff(expStart, 'days')
        // const activeStep = Math.min(daysSinceStart, currentDay)
        let activeStep;
        if (currentDay >= 2) activeStep =  currentDay + 1; else activeStep = currentDay;
        const day4Viewed = info.challengeWriting1Viewed
        const day5Viewed = info.challengeWriting2Viewed
        const day6Viewed = info.feedback6Viewed
        const day8Viewed = info.feedback8Viewed

        const viewed = [day4Viewed,  day5Viewed,  day6Viewed,  day8Viewed]

        const getLink = (item, index) => {
            if (item.completed_url && index<activeStep) return item.completed_url
            else if (index<=activeStep) return item.url
            else return "/"
        }

        // const handleClick = (index) => {
        //     const views = viewed.filter(value)

        //     if (currentDay >= 8 && views < 4) setOpen(true)
        //     if (currentDay >= 7 && views < 3) setOpen(true)
        //     if (currentDay >= 5 && views < 2) setOpen(true)
        //     if (currentDay >= 4 && views < 1) setOpen(true)
            
        // }

        console.log(currentDay, expStart, today, daysSinceStart)
        console.log(activeStep)

        

        console.log(day4Viewed, day5Viewed, day6Viewed, day8Viewed)

        return (
            <>
                <h1>任务列表</h1>
                <p>
                欢迎回来！这是您参与研究的第{currentDay}天。<br/>
                您可以在完成9天的任务以及第23天、第39天与第99天的评估后分别获得补偿哦！补偿金额将由任务完成的进度和质量共同决定。金额将逐次累积并在最后一次随访评估后的三天内发放给您！
                </p>
                <Stepper orientation="vertical"  activeStep={activeStep}>
                    {TASK_EXP_GRP.map((item, index) => (
                        <Step key={index}>
                            <Link key={index} 
                                href={getLink(item, index)} 
                                // onClick={() => handleClick(index)}
                                >
                                <StepLabel className={styles.MuiStepIcon}>
                                    
                                    <h4>{item.title}</h4>
                                    <span className="description">{(index<activeStep)? item.completed_description: item.discription}</span>
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
