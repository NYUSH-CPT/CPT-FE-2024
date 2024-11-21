import { useEffect, useState } from 'react'

import Head from 'next/head'
import Header from '@/components/Header'
import Tasks from '@/components/Tasks'

import styles from '@/styles/article.module.scss'

import { requester } from '@/utils'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function Home() {
    const [info, setInfo] = useState(null)

    const router = useRouter();
    const key = router.query.key;

    useEffect(() => {
        if (typeof window !== 'undefined') {
        window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            // The page was restored from bfcache
            console.log('Page restored from bfcache');
            requester.get('/info').then(res => {
                setInfo(res.data)
                console.log(res.data)
            }).catch(err => {})
        }
        });
        }
    },[])

    useEffect(() => {
        if (!router.isReady) return;
        const token = localStorage.getItem("access_token")
        if (key) {
            if (key === "L3G1kl7j") {
                window.location.href = "/login" 
                return
            }
            console.log(key)
            axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/key`, {
                params: {
                    key: key
                }
            }).then((res) => {
                console.log(res)
                if (!token) {
                    window.location.href = "/login" 
                } else {
                    requester.get('/info').then(res => {
                        setInfo(res.data)
                        console.log(res.data)
                    }).catch(err => {})
                }
            }).catch(() => {
                router.push(`https://nyu.qualtrics.com/jfe/form/SV_0VOLbB7OTrhi6ii?key=${key}`)
            })
        } else {
            if (!token) {
                window.location.href = "/login" 
            } else {
                console.log(token)
                requester.get('/info').then(res => {
                    setInfo(res.data)
                    console.log(res.data)
                }).catch(err => {})
            }
        }
    }, [key]);


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
