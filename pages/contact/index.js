import Head from 'next/head'
import Markdown from 'markdown-to-jsx'

import Header from '@/components/Header'

import styles from '@/styles/article.module.scss'

import { CONTACT } from '@/text'

export default function About() {
    return (
        <>
            <Head>
                <title>联系我们</title>
            </Head>
            <Header />
            <div className={styles.article}>
                <h1>联系我们</h1>
                <Markdown>{CONTACT}</Markdown>
            </div>
        </>
    )
}
