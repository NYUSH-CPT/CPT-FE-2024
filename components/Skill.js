import { useState, useEffect } from 'react'

import Drawer from '@mui/material/Drawer'
import Link from 'next/link'

import styles from '@/styles/header.module.scss'


import Head from "next/head";

import {
    TextField,
    Button,
    FormLabel,
    Checkbox,
    FormGroup,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Alert
} from "@mui/material";




import { CHALLENGE_WRITING_SAMPLE, CHALLENGE_WRITING_SKILLS } from "../pages/challenge_writing/text"


export default function Skill() {

    const [open, setOpen] = useState(false)

    const handleClick = () => {
        setOpen(!open)
    }

    return (
        <skill className={styles.header}>
            <h2>提示</h2>
            <Drawer open={open} onClose={handleClick} anchor="left">
                        {CHALLENGE_WRITING_SAMPLE}
                        {CHALLENGE_WRITING_SKILLS}
            
            </Drawer>
        </skill>
    )
}
