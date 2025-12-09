import { useEffect, useState } from "react";

import Head from "next/head";
import Header from "@/components/Header";
import Tasks from "@/components/Tasks";

import styles from "@/styles/article.module.scss";

import { useRouter } from "next/router";
import { useInfo } from "@/context/InfoContext";
import axios from "axios";


export default function Home() {

    const { info, setInfo, refresh, loading } = useInfo();
    const [processingParams, setProcessingParams] = useState(true);
    
    const router = useRouter();
    const key = router.query.key;
    const token = router.query.token;
    const from = router.query.from; 

    useEffect(() => {
        if (!router.isReady) {
            setProcessingParams(true);
            return;
        }
        
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) {
            setProcessingParams(false);
            return;
        }
        
        if (key && key !== "L3G1kl7j") {
            // 处理 key 参数
            setProcessingParams(true);
            axios
                .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/key`, { 
                    params: { key, token }
                })
                .then((res) => {
                    const nextAction = res.data?.next
                    if (nextAction === "collect") {
                        router.push(`/collect?uuid=${key}`);
                        return
                    } 
                    
                    refresh();
                    setProcessingParams(false);
                })
                .catch((err) => {   
                    if (err.response && err.response.status === 419) {
                        router.push('/error/qr_expired');
                    } else {
                        let qualtricsUrl = `https://nyu.qualtrics.com/jfe/form/SV_0VOLbB7OTrhi6ii?key=${key}`;
                        if (from) {
                            qualtricsUrl += `&from=${from}`;
                        } else {
                            qualtricsUrl += `&from=0`;
                        }
                        window.location.href = qualtricsUrl;
                    }
                });
        } else {
            // 没有有效的 key，跳转到登录页
            router.push("/login");
        }
    }, [key, token, from, router.isReady, refresh, router]);


    return (
        <>
            <Head>
                <title>{process.env.NEXT_PUBLIC_PROJECT_NAME}</title>
            </Head>
            <Header />
            <main className={styles.article}>
                {processingParams || loading ? (
                    <div>加载中......</div>
                ) : (
                    <Tasks />
                )}
            </main>
        </>
    );
}
