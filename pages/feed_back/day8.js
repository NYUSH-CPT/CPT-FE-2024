import Head from 'next/head'
import Markdown from 'markdown-to-jsx'

import { Paper, Button } from '@mui/material';
import Header from '@/components/Header'

import styles from '@/styles/feedback.module.scss'

import { useInfo } from '@/context/InfoContext';
import { useRouter } from 'next/router';

export default function FeedBackDay8() {
    const { info, setInfo, refresh, loading } = useInfo();
    const content = info?.feedback6
    const router = useRouter()

    return (
        <>
            <Head>
                <title>第9天 虚拟信件反馈</title>
            </Head>
            <Header />
            <div className={styles.container}>
                <h1>第9天 虚拟信件反馈</h1>
                <Paper elevation={4} className={styles.paper}>
                    <Markdown>
                        {content || "助教还未为您提供反馈"}
                    </Markdown>
                </Paper>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={()=>{router.push("/")}}
                    type="submit"
                    sx = {{marginBottom: "2em"}}

                >
                    返回
                </Button>
                </div>
        </>
    )
}
