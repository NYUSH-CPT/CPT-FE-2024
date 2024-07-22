import React, {useEffect, useState} from 'react'

import styles from "@/styles/login.module.scss"
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';

import axios from 'axios';

export default function Login() {
    const [phone, setPhone] = useState('')
    const [pwd, setPwd] = useState('')
    const [smsState, setSmsState] = useState(false)
    const [smsText, setSmsText] = useState('发送验证码')
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            window.location.href = "/"
        }
    }, []);

    const getSMS = async () => {
        setSmsState(true)
        setSmsText('发送中...')
        setErrorMsg('')
        const payload = {
            phoneNumber: phone,
        }
        axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/sms`, payload).then((res) => {
            console.log(res)
            const start = new Date().getTime()
            setSmsText('30秒后可重试')
            const ref = setInterval(() => {
                const remain = 30 - Math.floor((new Date().getTime() - start) / 1000)
                setSmsText(remain + '秒后可重试')
            }, 1000)
            setTimeout(() => {
                setSmsState(false)
                clearInterval(ref)
                setSmsText('发送验证码')
            }, 30000)
            }).catch((err) => {
                console.log(err)
                const start = new Date().getTime()
                setErrorMsg(err.response? err.response.data.error: JSON.stringify(err))
                const ref = setInterval(() => {
                    const remain = 15 - Math.floor((new Date().getTime() - start) / 1000)
                    setSmsText('失败!' + remain + '秒重试')
                }, 1000)

                setTimeout(() => {
                    setSmsState(false)
                    clearInterval(ref)
                    setSmsText('发送验证码')
                }, 15000)
            })
    }

    const handleSubmit = async (event) => {
        const form = event.currentTarget
        event.preventDefault()
        if (!form.checkValidity()) {
            event.stopPropagation()
        }

        const payload = {
            phoneNumber: phone,
            passcode: pwd,
        }

        axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login`, payload).then((res) => {
            console.log(res)
            localStorage.setItem("access_token", res.data.access)
            localStorage.setItem("refresh_token", res.data.refresh)
            window.location.href = "/"
        }).catch((err) => {
            console.log(err)
            setErrorMsg(err.response? err.response.data.error: JSON.stringify(err))
        })
    }


    return (
        <>
            <div className={styles.container}>
                <div className={styles.formGroup}>
                    <div className={styles.title}>上海纽约大学压力与健康研究</div>

                        <div className={styles.inputGroup}>
                            <AccountCircleOutlinedIcon className='text-white'/>
                            <input
                                type="text"
                                placeholder="手机号"
                                className={styles.input}
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                            />
                        </div>
                        
                        <div className={styles.smsGroup}>
                            <div className={styles.smsInput}>
                                <ChatBubbleOutlineOutlinedIcon className='text-white'/>
                                <input
                                    type="password"
                                    placeholder="验证码"
                                    className={styles.input}
                                    value={pwd}
                                    onChange={e => setPwd(e.target.value)}
                                />
                                
                            </div>
                            <button disabled={smsState} className={styles.smsButton} onClick={getSMS}>
                                    {smsText}
                            </button>
                        </div>
                            
                        {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
                        <button
                            className={styles.loginButton}
                            type="submit"
                            onClick={handleSubmit}
                        >
                            登录
                        </button>
                    </div>
                
            </div>
        </>
    )
}