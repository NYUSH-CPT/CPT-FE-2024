import { useEffect, useState } from "react";

import Head from "next/head";
import Header from "@/components/Header";
import Tasks from "@/components/Tasks";

import styles from "@/styles/article.module.scss";

import { requester } from "@/utils";
import { useRouter } from "next/router";
import axios from "axios";

export default function Home() {
    const [info, setInfo] = useState(null);

    const router = useRouter();
    const key = router.query.key;

    useEffect(() => {
        if (typeof window !== "undefined") {
            const handler = (event) => {
                if (event.persisted) {
                    console.log("Page restored from bfcache");
                    requester
                        .get("/info")
                        .then((res) => {
                            setInfo(res.data);
                        })
                        .catch((err) => {});
                }
            };
            window.addEventListener("pageshow", handler);

            return () => {
                window.removeEventListener("pageshow", handler);
            };
        }
    }, []);

    useEffect(() => {
        if (!router.isReady) return;
        const token = localStorage.getItem("access_token");
        if (token) {
            requester
                .get("/info")
                .then((res) => {
                    setInfo(res.data);
                    console.log(res.data);
                })
                .catch((err) => {});
        } else {
            if (key && key !== "L3G1kl7j") {
                axios
                    .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/key`, {
                        params: {
                            key: key,
                        },
                    })
                    .then((res) => {
                        requester
                            .get("/info")
                            .then((res) => {
                                setInfo(res.data);
                                // console.log(res.data);
                            })
                            .catch((err) => {});
                    })
                    .catch(() => {
                        window.location.href = `https://nyu.qualtrics.com/jfe/form/SV_02IlZfVxNdMUgR0?key=${key}`;
                    });
            } else {
                router.push("/login");
                return;
            }
        }
    }, [key, router.isReady]);

    return (
        <>
            <Head>
                <title>{process.env.NEXT_PUBLIC_PROJECT_NAME}</title>
            </Head>
            <Header />
            <main className={styles.article}>
                {info ? (
                    <>
                        <Tasks info={info} />
                    </>
                ) : (
                    <div>加载中......</div>
                )}
            </main>
        </>
    );
}
