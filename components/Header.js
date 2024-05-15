import { useState, useEffect } from 'react'

import Drawer from '@mui/material/Drawer'
import Link from 'next/link'

import { getUserNameFromLocalStorage } from '@/utils'

import styles from '@/styles/header.module.scss'

export default function Header() {
    // for test purpose only
    useEffect(() => {
        window.localStorage.setItem(
            'access_token',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
        )
    }, [])

    const [open, setOpen] = useState(false)
    const [userName, setUserName] = useState('')

    const handleClick = () => {
        setOpen(!open)
    }

    useEffect(() => {
        const name = getUserNameFromLocalStorage()
        setUserName(name)
    }, [])

    const handleLogout = () => {
        window.localStorage.removeItem('access_token')
        window.location.reload()
    }

    return (
        <header className={styles.header}>
            <h1>{process.env.NEXT_PUBLIC_PROJECT_NAME}</h1>
            <img src="/category.svg" alt="logo" width={20} height={20} onClick={handleClick} />
            <Drawer open={open} onClose={handleClick} anchor="right">
                <div className={styles.drawer}>
                    <div>
                        <h2>{userName}</h2>
                        <ul>
                            <Link href="/">
                                <li>任务列表</li>
                            </Link>
                            <Link href="/about">
                                <li>项目简介</li>
                            </Link>
                            <Link href="/contact">
                                <li>联系我们</li>
                            </Link>
                            <Link href="/faq">
                                <li>常见疑问</li>
                            </Link>
                        </ul>
                    </div>
                    <div className={styles.logout} onClick={handleLogout}>
                        <span>一键登出</span>
                    </div>
                </div>
            </Drawer>
        </header>
    )
}
