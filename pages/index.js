import { useEffect, useState } from 'react'

import Head from 'next/head'
import Header from '@/components/Header'
import Tasks from '@/components/Tasks'

import styles from '@/styles/article.module.scss'

import { requester } from '@/utils'

export default function Home() {
    const [info, setInfo] = useState(null)

    useEffect(() => {
        const token = localStorage.getItem("access_token")
        if (!token) {
            window.location.href = "/login" 
        } else {
            requester.get('/info').then(res => {
                setInfo(res.data)
                console.log(res.data)
            }).catch(err => {})
        }
    }, [])
    
    return (
        <>
            <Head>
                <title>{process.env.NEXT_PUBLIC_PROJECT_NAME}</title>
            </Head>
            <Header />
            <main className={styles.article}>
                {info ? (
                    <>
                        <Tasks info={info}/>
                    </>
                ) : (
                    '登录中...'
                )}
            </main>
        </>
    )
}
