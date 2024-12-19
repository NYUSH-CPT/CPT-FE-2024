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
    const [isFullScreen, setIsFullScreen] = useState(false);


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

    const handleFullScreen = () => {
        if (contRef.current.requestFullscreen) {
            contRef.current.requestFullscreen();
        } else if (contRef.current.webkitRequestFullscreen) { // Safari
            contRef.current.webkitRequestFullscreen();
        } else if (contRef.current.msRequestFullscreen) { // IE/Edge
            contRef.current.msRequestFullscreen();
        } else {
            console.log("Fullscreen API is not supported");
        }
        setIsFullScreen(true);
    };
    const handleExitFullScreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { // Safari
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
        } else {
            console.log("Fullscreen API is not supported");
        }
        setIsFullScreen(false); // Exit full-screen mode
    };

    useEffect(() => {
        const handleFullScreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullScreen(false);
            }
        };

        document.addEventListener("fullscreenchange", handleFullScreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
        document.addEventListener("msfullscreenchange", handleFullScreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
            document.removeEventListener("msfullscreenchange", handleFullScreenChange);
        };
    }, []);



    return(
        <>
        <Head>
            <title>第2天 科普视频</title>
        </Head>
        <Header />

        <main className={styles.video}>
            <h1>第2天 科普视频</h1>
            <p>视频播放完毕后将自动更新首页任务列表</p>
            <Card className={styles.container} ref={contRef}>
                <video
                    className={styles.player}
                    src="/video.mp4"
                    ref={videoRef}
                    playsInline
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

                {isFullScreen && (
                    <div 
                    className={styles.exitFullScreenButton}
                    >
                        <Button
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

                        <Button 
                        variant='contained'
                        onClick={handleExitFullScreen}
                        >
                        退出全屏
                        </Button>
                    </div>
                    

                )}
            </Card>
            <div 
                className={styles.videoControl}>
                    <span className={styles.videoTime}>{currentTime}</span>
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

                    <Button 
                        color='primary'
                        variant='contained'
                        onClick={handleFullScreen}
                    >
                        全屏
                    </Button>

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
