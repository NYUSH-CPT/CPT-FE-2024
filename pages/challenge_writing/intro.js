import { useRouter } from "next/router";

import Head from "next/head";

import {
    Button,
} from "@mui/material";

import Header from "@/components/Header";

import styles from "@/styles/article.module.scss";


import { CHALLENGE_WRITING_INTRO,  CHALLENGE_WRITING_SAMPLE } from "./text";

export default function ChallengeWritingIntro() {

    const router = useRouter();

    const handleRedirect = (e) => {
        e.preventDefault();
        router.push(`/challenge_writing/1`);
    };

    return (
    (day && <>
    <Head>
        <title>Day 4 挑战性写作</title>
    </Head>
    <Header />
    <div className={`flex flex-col gap-1 ${styles.article}`}>
        <h1>Day 4 挑战性写作</h1>
        {CHALLENGE_WRITING_INTRO[4]}
    </div>  
    {CHALLENGE_WRITING_SAMPLE}
    <div className={`flex flex-col gap-1 ${styles.article}`}>

                <Button
        variant="contained"
        color="primary"
        onClick={handleRedirect}
        type="submit"
        >
            继续
        </Button>
    </div>  

    </>
    ))

}