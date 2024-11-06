import Head from 'next/head'
import Markdown from 'markdown-to-jsx'
import Accordion from '@mui/material/Accordion'
import AccordionActions from '@mui/material/AccordionActions'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import Header from '@/components/Header'

import styles from '@/styles/article.module.scss'

import { FAQ_EXP_GRP, FAQ_WL_GRP } from '@/text'
import { useState, useEffect } from 'react'
import { requester } from '@/utils'

export default function About() {

    const [group, setGroup] = useState("");
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        requester.get("/info")
            .then(res => {
                console.log(res)
                setGroup(res.data.group)
                setLoading(false)
            }).catch(() => {})
    }, [])

    return (
        <>
        {!loading? (
        <>
            <Head>
                <title>常见疑问</title>
            </Head>
            <Header />
            <div className={styles.article}>
                <h1>常见疑问</h1>
                {group === "Waitlist" ? (FAQ_WL_GRP?.map((item, index) => (
                    <Accordion key={index}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel${index + 1}-content`}
                            id={`panel${index + 1}-header`}
                            className={styles.accordionTitle}
                        >
                            {item.title}
                        </AccordionSummary>
                        <AccordionDetails>
                            <Markdown>{item.content}</Markdown>
                        </AccordionDetails>
                    </Accordion>
                ))) : FAQ_EXP_GRP?.map((item, index) => (
                    <Accordion key={index}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel${index + 1}-content`}
                            id={`panel${index + 1}-header`}
                            className={styles.accordionTitle}
                        >
                            {item.title}
                        </AccordionSummary>
                        <AccordionDetails>
                            <Markdown>{item.content}</Markdown>
                        </AccordionDetails>
                    </Accordion>
                ))} 
            </div>
        </>
        ) : ('加载中...')
        }
        </>

    )
}
