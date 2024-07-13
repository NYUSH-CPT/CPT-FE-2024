import React, { useRef, useState, useEffect } from 'react'
import styles from '@/styles/video.module.scss'
import { requester } from '@/utils'

import Head from "next/head";
import Header from '@/components/Header'

import { Button, Card } from '@mui/material';
import ReactPlayer from 'react-player';


const Video = () => {
    const videoRef = useRef(null)
    const [watched, setWatched] = useState(false)
    const [played, setPlayed] = useState(0)

    const [isClent, setIsClient] = useState(false)
    useEffect(() => {
        setIsClient(true)
        const watched = localStorage.getItem(`__autosave-${window.location.pathname}-watched`)
        if (watched) {
            setWatched(true)
            console.log("video watched from local storage")
        }
    }, [])


    return(
        <>
        <Head>
            <title>第2天 科普视频</title>
        </Head>
        <Header />

        <main className={styles.video}>
            <h1>第2天 科普视频</h1>
            <p>视频播放完毕后将自动更新首页任务列表</p>
            <Card>
                {isClent && <ReactPlayer
                    height="100%"
                    width="100%"
                    url="/video.mp4"
                    controls
                    ref={videoRef}
                    onProgress={() => {
                        videoRef.current.getCurrentTime() >= played && 
                        setPlayed(videoRef.current.getCurrentTime())
                    }}
                    onSeek={() => {
                        !watched && videoRef.current.getCurrentTime() > played && 
                        videoRef.current.seekTo(played)
                    }}
                    onEnded={() => {
                        if (videoRef.current.getCurrentTime()>=videoRef.current.getDuration()) {
                            console.log("video end")
                            requester.post('/video')
                            localStorage.setItem(`__autosave-${window.location.pathname}-watched`, true)
                        }
                    }}
                />}
            </Card>
            <div 
                className={styles.videoControl}>
                    <Button 
                        color='primary'
                        variant='contained'
                        onClick={(e) => window.location.href='/'}
                    >
                        返回
                    </Button>
                </div>
        </main>
        </>
    )
}

export default Video
