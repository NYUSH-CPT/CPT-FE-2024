
import Head from "next/head";

import {
    Button,
} from "@mui/material";

import Header from "@/components/Header";

import styles from "@/styles/article.module.scss";

import { requester } from "@/utils";

import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import { CHALLENGE_WRITING_INTRO,  CHALLENGE_WRITING_SAMPLE } from "@/components/text";

export default function ChallengeWritingIntro() {

    const router = useRouter();

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        requester.get('/info').then(
            setLoading(false)
        ).catch((err) => {})
    }, [])


    return (
        <>
            {!loading ? (
            <>
                <Head>
                    <title>第4天 挑战性写作</title>
                </Head>
                <Header />
                
                <div className={`flex flex-col gap-1 ${styles.article}`}>
                    <h1>第4天 挑战性写作</h1>
                    {CHALLENGE_WRITING_INTRO[4]}
                </div>  
                {CHALLENGE_WRITING_SAMPLE}
                <div className={`flex flex-col p-4`}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {window.location.href = "/challenge_writing/1"}}
                        type="submit"
                    >
                        继续
                    </Button>
                </div>  
            </>
            ) : (
                '加载中...'
            )}
        </>
        )
}