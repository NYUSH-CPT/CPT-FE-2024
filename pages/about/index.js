import Head from 'next/head'
import Markdown from 'markdown-to-jsx'

import Header from '@/components/Header'

import styles from '@/styles/article.module.scss'

import { ABOUT } from '@/text'

export default function About() {
    return (
        <>
            <Head>
                <title>项目简介</title>
            </Head>
            <Header />
            <div className={styles.article}>
                <h1>项目简介</h1>
                <Markdown>{ABOUT}</Markdown>
            </div>
        </>
    )
}
