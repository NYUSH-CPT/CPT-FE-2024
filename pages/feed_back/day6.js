import { useEffect, useState } from 'react'

import Head from 'next/head'
import Markdown from 'markdown-to-jsx'

import { Paper, Button } from '@mui/material';
import Header from '@/components/Header'

import styles from '@/styles/feedback.module.scss'

import { requester } from '@/utils'

import { useRouter } from 'next/router';

export default function FeedBackDay6() {
    const [content, setContent] = useState("")

    const router = useRouter(); 

    useEffect(() => {
        requester.get("/info")
            .then(res => {
                console.log(res)
                setContent(res.data.feedback6)
            }).catch(() => {})
    }, [])


    return (
        <>
            <Head>
                <title>第7天 挑战性写作3反馈</title>
            </Head>
            <Header />
            <div className={styles.container}>
                <h1>第7天 挑战性写作3反馈</h1>
                <Paper elevation={4} className={styles.paper}>
                    <Markdown>
                        {content}
                    </Markdown>
                </Paper>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={()=>{window.location.href="/"}}
                    type="submit"
                    sx = {{marginBottom: "2em"}}

                >
                    返回
                </Button>
                </div>
        </>
    )
}
