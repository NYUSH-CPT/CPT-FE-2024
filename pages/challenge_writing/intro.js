
import Head from "next/head";

import {
    Button,
} from "@mui/material";

import Header from "@/components/Header";

import styles from "@/styles/article.module.scss";

import { CHALLENGE_WRITING_INTRO,  CHALLENGE_WRITING_SAMPLE } from "@/components/text";

import { useRouter } from "next/router";

export default function ChallengeWritingIntro() {

    const router = useRouter()

    return (
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
                    onClick={() => {router.push("/challenge_writing/1")}}
                    type="submit"
                >
                    继续
                </Button>
            </div>  
        </>
        )
}