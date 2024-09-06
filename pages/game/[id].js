import { useEffect, useState, useRef } from 'react'
import { useRouter } from "next/router";
import { requester } from "@/utils";
import ChatBox from "@/components/ChatBox";
import Header from "@/components/Header";
import styles from "@/styles/game.module.scss";
import Head from "next/head";


export default function Game() {

    const router = useRouter();

    const id = +router.query.id; 
    
    const [chat, setChat] = useState([])
    const [score, setScore] = useState(0);
    const [displayID, setDisplayID] = useState(null);
    const [showArr, setShowArr] = useState([]);
    const [names, setNames] = useState([]);
    const visitorCount = 8;

    const oldDisplayID = useRef(displayID);

    const [update, setUpdate] = useState(false)

    useEffect(() => {
        if (id==1 && displayID >= 8) {
            router.push("/")
        }
    }, [id]);

    const elicitResponse = async (payload = {"choice": ""}) => {

        const res = await requester.post("/game", JSON.stringify(payload))
        const response = res.data
        // console.log("payload", payload, "response", response)
        const msgs = response.responses
        const score = response.score
        const newDisplayID = response.scenario_display_id
        const name_list = response.name_list

        const newshowArr = new Array(msgs.length).fill(false)
        newshowArr[0] = true

        if (newDisplayID != oldDisplayID.current) setUpdate(true)
        else setUpdate(false)
     
        setScore(score)
        setDisplayID(oldDisplayID.current)
        oldDisplayID.current = newDisplayID;
        setShowArr((oldArr) => [...oldArr, ...newshowArr])
        setChat((chat) => [...chat, ...msgs])
        setNames(name_list)

        // console.log('elicitResponse', "chat", chat, "showArr", showArr, "msgs", msgs, "displayID", displayID)

    }

    useEffect(() => {
        const loadedData = localStorage.getItem(`__autosave-${window.location.pathname}`)
        if (loadedData) {
            const {filterChat, filterShowArr, newDisplayID} = JSON.parse(loadedData);
            console.log("autoload displayID", newDisplayID)
            if (filterChat.length>0) {
                setDisplayID(newDisplayID)
                oldDisplayID.current = newDisplayID
                setChat((oldChat) => [...oldChat, ...filterChat])
                setShowArr((oldArr) => [...oldArr, ...filterShowArr])
            }
        } else if (typeof window !== 'undefined') {
            const initialDisplayID = window.location.href.includes('game/1') ? 0 : 8;
            console.log("initialID", initialDisplayID)
            oldDisplayID.current = initialDisplayID;
        }

        const response = async () => {
            await elicitResponse()
        }

        response().catch((e) => {
            console.log(e)
        })

    }, [])


    useEffect(() => {
        setTimeout(() => {
            const element = document.getElementById('chat_content');
            element.scrollTop = element.scrollHeight;
            console.log('rerender', element.scrollHeight)
            const filterChat = chat.filter((e) => (!e.speaker.includes("supervisor")))
            const filterShowArr = new Array(filterChat.length).fill(true)
            
            let newDisplayID;
            if (!update) newDisplayID = oldDisplayID.current
            else newDisplayID = oldDisplayID.current - 1

            const data = {filterChat, filterShowArr, newDisplayID}
            localStorage.setItem(`__autosave-${window.location.pathname}`, JSON.stringify(data))
        }, 0)
    })

    return (
        <>
        <Head>
            <title>第{id+1}天 游戏</title>
        </Head>

        <div className={styles.container}>
            <Header />
            <div className={styles.fixed_header}>
                <div className={styles.score}>分数：{score}</div>
                <div className={styles.header}>
                    <span>{names[displayID]}</span>
                    <span className={styles.visitor_count}>
                        第{(displayID === 7 || displayID === 15) ? 8 : (displayID + 1) % 8}/{visitorCount}位来访者
                    </span>
                </div>
            </div>
            
            <div className={styles.content} id={'chat_content'}>
                {chat.map((c, index) => {
                    return <ChatBox showArr={showArr} setShowArr={setShowArr} setChat={setChat} length={showArr.length} elicitResponse={elicitResponse} message={c} index={index} key={index} 
                        displayID={update? oldDisplayID.current-1: oldDisplayID.current}/>
                })}
            </div>

        </div>
        </>
    )
}
