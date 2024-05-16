import Head from 'next/head'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import FormHelperText from '@mui/material/FormHelperText'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Markdown from 'markdown-to-jsx'

import Header from '@/components/Header'

import styles from '@/styles/article.module.scss'

import { CONTENT_WRITING_DAY1 } from '@/text'

export default function FreeWriting() {
    const handleSubmit = e => {
        const form = document.getElementById('myform')

        if (form.checkValidity()) {
            e.preventDefault()
            e.stopPropagation()

            const formData = new FormData(form)
            const data = {}
            for (let key of formData.keys()) {
                data[key] = formData.get(key)
            }
            console.log(data)
        }
    }
    return (
        <>
            <Head>
                <title>Day 1 自由写作</title>
            </Head>
            <Header />
            <form className={styles.article} id="myform">
                <h1>Day 1 自由写作</h1>
                <Markdown>{CONTENT_WRITING_DAY1}</Markdown>
                <hr className="my-4" />
                <div className="flex flex-col gap-6">
                    <TextField
                        name="scene"
                        multiline
                        variant="outlined"
                        minRows={5}
                        label="发生的事情"
                        required
                        inputProps={{ minLength: '300' }}
                    />
                    <TextField
                        name="feeling"
                        multiline
                        variant="outlined"
                        minRows={5}
                        label="当时的想法"
                        required
                        inputProps={{ minLength: '300' }}
                    />
                    <Button variant="contained" color="primary" onClick={handleSubmit} type="submit">
                        提交
                    </Button>
                </div>
            </form>
        </>
    )
}
