import { useState, useEffect } from 'react'
import { useInfo } from '@/context/InfoContext'

import Drawer from '@mui/material/Drawer'
import Link from 'next/link'

import styles from '@/styles/header.module.scss'

export default function Header() {

    const [open, setOpen] = useState(false)
    const { info } = useInfo()
    const group = info?.group

    const handleClick = () => {
        setOpen(!open)
    }

    const handleLogout = () => {
        window.localStorage.removeItem('access_token')
        window.localStorage.removeItem("group")
        window.location.reload()
    }
    
    return (
        <header className={styles.header}>
            <h1>{process.env.NEXT_PUBLIC_PROJECT_NAME}</h1>
            <img src="/category.svg" alt="logo" width={20} height={20} onClick={handleClick} />
            <Drawer open={open} onClose={handleClick} anchor="right">
                <div className={styles.drawer}>
                    <div>
                        <h2></h2>
                        <ul>
                            <Link href="/">
                                <li>任务列表</li>
                            </Link>
                            {(group === "Exp1" || group === "Exp2" || group == "Waitlist") && 
                                <>
                                    <Link href="/about">
                                        <li>项目简介</li>
                                    </Link>
                                    <Link href="/contact">
                                        <li>联系我们</li>
                                    </Link>
                                    <Link href="/faq">
                                        <li>常见疑问</li>
                                    </Link>
                                </>
                            }
                            
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
