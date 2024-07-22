import { useEffect, useState } from 'react'
import { useRouter } from 'next/router';

import Head from 'next/head'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Markdown from 'markdown-to-jsx'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'

import Header from '@/components/Header'

import styles from '@/styles/article.module.scss'

import { CONTENT_WRITING_DAY8 } from '@/text'
import { requester, enableAutoSave } from '@/utils'

export default function FreeWriting() {
    const [contentExist, setContentExist] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [isSuccessDialogOpen, setSuccessDialogOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        enableAutoSave('myform')
        requester.get("/writing/8")
            .then(res => {
                setContentExist(true)
            }).catch(err => {
            })
    }, [])


    const handleCloseSuccessDialog = () => {
        setSuccessDialogOpen(false)
        router.push("/")
    }

    const handleRedirect = e => {
        e.preventDefault()
        router.push("/")
    }

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
            requester.post("/writing/8", data)
            .then(res => {
                    console.log(res)
                    setSuccessDialogOpen(true)
                })
                .catch(err => {
                    setErrorMessage(err.response? err.response.data.error: JSON.stringify(err))
                }
            )
        }
    }
    return (
        <>
            <Head>
                <title>第8天 虚拟信件</title>
            </Head>
            <Header />
            <form className={styles.article} id="myform">
                <h1>第8天 虚拟信件</h1>
                <Markdown>{CONTENT_WRITING_DAY8}</Markdown>
                <hr className="my-4" />
                <div className="flex flex-col gap-6">
                    {errorMessage && (
                        <Alert severity="error">
                            {errorMessage}
                        </Alert>
                    )}
                    <TextField
                        name="letter"
                        multiline
                        variant="outlined"
                        minRows={5}
                        required
                        disabled={contentExist}
                        inputProps={{ minLength: '300' }}
                    />
                    
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={contentExist ? handleRedirect : handleSubmit}
                        type="submit"
                    >
                        {contentExist ? "您已经提交过这次写作，返回" : "提交"}
                    </Button>
                </div>
            </form>

            <Dialog open={isSuccessDialogOpen} onClose={handleCloseSuccessDialog}>
                <DialogTitle>提交成功</DialogTitle>
                <DialogContent>
                    <DialogContentText>感谢您用写作的方式关怀自己！</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSuccessDialog} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
