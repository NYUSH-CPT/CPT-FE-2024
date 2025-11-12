import { useEffect } from "react";

import Head from "next/head";
import Header from "@/components/Header";
import Tasks from "@/components/Tasks";

import styles from "@/styles/article.module.scss";

import { useRouter } from "next/router";
import { useInfo } from "@/context/InfoContext";
import axios from "axios";


export default function Home() {

    const { info, setInfo, refresh, loading } = useInfo();
    
    const router = useRouter();
    const key = router.query.key;
    const token = router.query.token;
    const from = router.query.from; // 获取机构参数

    useEffect(() => {
        if (!router.isReady) return;
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) {
          return;
        }
        if (key && key !== "L3G1kl7j") {
          axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/key`, { 
                params: { key, token }
            })
            .then(() => {
                refresh(); 
            })
            .catch((err) => {   
                if (err.response && err.response.status === 419) {
                    router.push('/error/qr_expired');
                } else {
                    let qualtricsUrl = `https://nyu.qualtrics.com/jfe/form/SV_0VOLbB7OTrhi6ii?key=${key}`;
                    if (from) {
                        qualtricsUrl += `&from=${encodeURIComponent(from)}`;
                    } else {
                        qualtricsUrl += `&from=${encodeURIComponent('线上')}`;
                    }
                    window.location.href = qualtricsUrl;
                }
            });
        } else {
            router.push("/login");
        }
      }, [key, token, from, router.isReady, refresh]);


      return (
        <>
            <Head>
                <title>{process.env.NEXT_PUBLIC_PROJECT_NAME}</title>
            </Head>
            <Header />
            <main className={styles.article}>
                {loading? (
                    <div>加载中......</div>
                ):  (
                    <Tasks />
                )}
            </main>
        </>
    );
}
