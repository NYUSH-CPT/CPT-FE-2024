import React, {useEffect, useState} from 'react'

import styles from "@/styles/login.module.scss"
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';

import axios from 'axios';
import { useRouter } from 'next/router';
import { useInfo } from '@/context/InfoContext';

export default function Login() {
    const [phone, setPhone] = useState('')
    const [pwd, setPwd] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const router = useRouter()
    const { info, loading, refresh } = useInfo();

    useEffect(() => {
        if (loading) return; 
        if (info) {
          router.push("/");
        }
      }, [info, loading, router]);

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

        axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login`, payload).then(async (res) => {
            localStorage.setItem("access_token", res.data.access)
            localStorage.setItem("refresh_token", res.data.refresh)
            await refresh()
            router.push("/")
        }).catch((err) => {
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
                        
                        <div className={styles.inputGroup}>
                                <KeyOutlinedIcon className='text-white'/>
                                <input
                                    type="password"
                                    placeholder="密码"
                                    className={styles.input}
                                    value={pwd}
                                    onChange={e => setPwd(e.target.value)}
                                />
                        </div>
                            
                        {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
                        <button
                            className={styles.loginButton}
                            type="submit"
                            onClick={handleSubmit}
                        >
                            登录
                        </button>
                        <div className={styles.setPwdLink}>
                            <a href="/signup">第一次登录？请设置密码</a>
                        </div>
                    </div>
                
            </div>
        </>
    )
}