import Head from 'next/head'
import Header from '@/components/Header'

import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import StepContent from '@mui/material/StepContent'
import Link from 'next/link'

import styles from '@/styles/article.module.scss'

import { TASK_EXP_GRP } from '@/text'

export default function Home() {
    return (
        <>
            <Head>
                <title>{process.env.NEXT_PUBLIC_PROJECT_NAME}</title>
            </Head>
            <Header />
            <main className={styles.article}>
                <h1>任务列表</h1>
                <p>
                    这里是一些杂七杂八的文本占位符，用来展示任务列表的内容，你可以点击下方的链接来查看具体的任务详情。
                </p>
                <Stepper orientation="vertical">
                    {TASK_EXP_GRP.map((item, index) => (
                        <Step key={index}>
                            <Link key={index} href={item.url}>
                                <StepLabel>
                                    <h4>{item.title}</h4>
                                    <span className="description">{item.discription}</span>
                                </StepLabel>
                            </Link>
                        </Step>
                    ))}
                </Stepper>
            </main>
        </>
    )
}
