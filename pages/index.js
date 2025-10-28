import { useEffect, useState, useContext } from "react";

import Head from "next/head";
import Header from "@/components/Header";
import Tasks from "@/components/Tasks";

import styles from "@/styles/article.module.scss";

import { requester } from "@/utils";
import { useRouter } from "next/router";
import { useInfo } from "@/context/InfoContext";
import axios from "axios";


export default function Home() {

    const { info, setInfo, refresh, loading } = useInfo();
    
    const router = useRouter();
    const key = router.query.key;

    useEffect(() => {
        if (!router.isReady) return;
        const token = localStorage.getItem("access_token");
        if (token) {
          return;
        }
        if (key && key !== "L3G1kl7j") {
          axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/key`, { params: { key } })
            .then(() => {
                refresh(); 
            })
            .catch(() => {
                window.location.href = `https://nyu.qualtrics.com/jfe/form/SV_0VOLbB7OTrhi6ii?key=${key}`;
            });
        } else {
            router.push("/login");
        }
      }, [key, router.isReady, refresh]);


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
