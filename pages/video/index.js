import React, { useRef, useState, useEffect } from 'react'
import styles from '@/styles/video.module.scss'
import { requester } from '@/utils'

import Head from "next/head";
import Header from '@/components/Header'

import { Button, Card } from '@mui/material';
import moment from 'moment'


const Video = () => {
    const videoRef = useRef(null)
    const contRef = useRef(null)
    const [watched, setWatched] = useState(false)
    const [currentTime, setCurrentTime] = useState('')
    const [playPauseText, setPlayPauseText] = useState('播放')


    useEffect(() => {
        requester.get("/info").then((res) => {
            const currentDay = res.data.currentDay
            console.log("currentDay", currentDay)
            if (currentDay >= 2.1) {
                setWatched(true)
            }
        }).catch((err) => {
            console.log(err)
        })
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
            <p>为便于复习，首次观看完成后即可自由拖动进度条。</p>
            <Card className={styles.container} ref={contRef}>
                <video
                    className={`${watched? styles.watchedPlayer : styles.player}`}
                    src="/video.mp4"
                    ref={videoRef}
                    playsInline
                    controls={watched}
                    poster="/video.jpg"
                    onEnded={async () => {
                        if (!watched && videoRef.current.currentTime >= videoRef.current.duration) {
                            console.log("video end");
                            await requester.post('/video');
                            setWatched(true);
                        }
                        setPlayPauseText('重新播放')
                    }}
                    onTimeUpdate={() => {
                        const currentMoment = moment.duration(videoRef.current.currentTime, 'seconds')
                        const durationMoment = moment.duration(videoRef.current.duration, 'seconds')
                        setCurrentTime(
                            `${currentMoment.minutes() + ':' + currentMoment.seconds()}/${
                                durationMoment.minutes() + ':' + durationMoment.seconds()
                            }`
                        )
                    }}
                />
            </Card>
            <div 
                className={styles.videoControl}>
                    <span className={styles.videoTime}>{currentTime}</span>
                    {!watched && 
                        <Button
                            color='primary'
                            variant='contained'
                            onClick={() => {
                                if (videoRef.current.paused) {
                                    videoRef.current.play()
                                    setPlayPauseText('暂停')
                                } else {
                                    videoRef.current.pause()
                                    setPlayPauseText('播放')
                                }
                            }}
                        >
                            {playPauseText}
                        </Button>
                    }
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
