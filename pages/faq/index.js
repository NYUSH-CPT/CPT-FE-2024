import Head from 'next/head'
import Markdown from 'markdown-to-jsx'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import Header from '@/components/Header'

import styles from '@/styles/info.module.scss'

import { FAQ_EXP_GRP, FAQ_WL_GRP } from '@/text'
import { useInfo } from '@/context/InfoContext'

export default function About() {

    const { info, loading } = useInfo();
    const group = info?.group
    let content;

    if (loading) {
        content = <>加载中...</>;
    } else if (!(group === "Exp1" || group === "Exp2" || group === "Waitlist")) {
        content = <>抱歉，您没有权限访问此页面。</>;
    } else {
        content = (
            <>
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
            </>
        )
    }

    return ( 
        <>
            <Head>
                <title>常见疑问</title>
            </Head>
            <Header />
            <div className={styles.article}>
            {content}
            </div>
        </>
    )
}
