import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";

import Head from "next/head";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Markdown from "markdown-to-jsx";

import {
    FormLabel,
    Checkbox,
    FormGroup,
    FormControlLabel,
} from "@mui/material";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";

import Header from "@/components/Header";

import styles from "@/styles/article.module.scss";

import { CONTENT_WRITING_DAY4, REFERENCE_WRITING_DAY4 } from "@/text";
import { requester } from "@/utils";


export default function ChallengeWriting() {
    const q2Biases = {
        0: { prompt: "非黑即白", checked: false, text: "" },
        1: { prompt: "以偏概全", checked: false, text: "" },
        2: { prompt: "灾难化思维", checked: false, text: "" },
        3: { prompt: "揣摩人心", checked: false, text: "" },
        4: { prompt: "过分自责", checked: false, text: "" },
        5: { prompt: "对号入座", checked: false, text: "" },
        6: { prompt: "其它", checked: false, text: "" },
        7: { prompt: "我没有发现TA的非适应性思维。", checked: false, text: "" },
    };

    const q3Questions = {
        0: { prompt: '有什么证据可以支持这些想法吗？', checked: false, text: "" },
        1: { prompt: '有什么证据可以反驳这些想法吗？', checked: false, text: "" },
        2: { prompt: '这些想法是不是过于极端或者夸张了？', checked: false, text: ""},
        3: { prompt: '这些想法是不是只关注了事情的一面？', checked: false, text: "" },
        4: { prompt: '这些想法的产生是基于您的感受还是基于事实？', checked: false, text: "" },
        5: { prompt: '这些想法是否高估了事情发生的概率？', checked: false, text: "" },
        6: { prompt: '这些想法的信息来源可靠吗？', checked: false, text: "" },
        7: { prompt: '我没有发现TA的非适应性思维，所以我不需要提问。', checked: false, text: "" },
    };


    const handleCheckboxChange = (key, updater) => (event) => {
        updater(prevState => ({
            ...prevState,
            [key]: { ...prevState[key], checked: event.target.checked }
        }));
    };

    const handleTextChange = (key, updater) => (event) => {
        updater(prevState => ({
            ...prevState,
            [key]: { ...prevState[key], text: event.target.value }
        }));
    };

    const [biasState, setBiasState] = useState(q2Biases);
    const [questionState, setQuestionState] = useState(q3Questions);
    const [q1Content, setQ1Content] = useState("");
    const [q4Content, setQ4Content] = useState("");

    const [contentExist, setContentExist] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSuccessDialogOpen, setSuccessDialogOpen] = useState(false);
    const router = useRouter();
    const day = +router.query.id + 3;

    const [reference, setReference] = useState({});
    const [isReferenceDialogOpen, setReferenceDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadedData = localStorage.getItem(`__autosave-${window.location.pathname}`);
        if (loadedData) {
            const { biasState, questionState, q1Content, q4Content } = JSON.parse(loadedData);
            setBiasState(prev => {
                const updatedState = {
                    ...q2Biases,  
                    ...biasState 
                };
                return updatedState;
            });
            setQuestionState(prev => {
                const updatedState = {
                    ...q3Questions,  
                    ...questionState 
                };
                return updatedState;
            });
            setQ1Content(q1Content || "");
            setQ4Content(q4Content || "");
        } else {
            setBiasState(q2Biases);
            setQuestionState(q3Questions);
            setQ1Content("");
            setQ4Content("");
        }
    }, []);


    useEffect(() => {
        if (day) {
            requester
                .get(`/writing/${day}`)
                .then((res) => {
                    setContentExist(true);
                    console.log(res)
                    setReference(res.data.reference);
                    setReferenceDialogOpen(true);
                    setLoading(false)
                })
                .catch((err) => {
                    console.log(err.response);
                    setLoading(false)
                });
        }
    }, [day])

    
    useEffect(() => {
        setTimeout(() => {
            const getDataToSave = () => ({
                biasState,
                questionState,
                q1Content,
                q4Content
            });
            const dataToSave = getDataToSave();
            localStorage.setItem(`__autosave-${window.location.pathname}`, JSON.stringify(dataToSave));
        }, 0);
    }, [biasState, questionState, q1Content, q4Content]);


    const handleCloseSuccessDialog = () => {
        setSuccessDialogOpen(false);
        router.push("/");
    };

    const handleRedirect = (e) => {
        e.preventDefault();
        router.push("/");
    };

    const handleCloseReferenceDialog = () => {
        setReferenceDialogOpen(false);
    };

    const handleSubmit = (e) => {
        const form = document.getElementById("myform");

        if (form.checkValidity()) {
            e.preventDefault();
            e.stopPropagation();
            const biasIsChecked = Object.values(biasState).some(key => key.checked);
            const questionIsChecked = Object.values(questionState).some(key => key.checked);
            if (!biasIsChecked) {
                setErrorMessage("第二题必须至少选择一项。")
                return
            }
            else if (!questionIsChecked) {
                setErrorMessage("第三题必须至少选择一项。")
                return
            }

            const q2Data = Object.entries(biasState)
            .filter(([key, { checked }]) => checked) 
            .map(([key, { text }]) => ({id: key, bias: q2Biases[key].prompt, text: text }));
    
            const q3Data = Object.entries(questionState)
                .filter(([key, { checked }]) => checked)
                .map(([key, { text }]) => ({id: key, question: q3Questions[key].prompt, text: text }));
        
            const payload = {
                q1: q1Content,
                q2: q2Data,
                q3: q3Data,
                q4: q4Content
            };

            requester
                .post(`writing/${day}`, payload)
                .then((res) => {
                    console.log(res);
                    setSuccessDialogOpen(true);
                })
                .catch((err) => {
                    console.error(err.response);
                    setErrorMessage(err.response.data.error);
                });
        }
    };

    return (
        (!loading &&
        <>
            <Head>
                <title>Day {day} 挑战性写作</title>
            </Head>
            <Header />
            <form className={styles.article} id="myform">
                <h1>Day {day} 挑战性写作</h1>
                <Markdown>{CONTENT_WRITING_DAY4}</Markdown>

                <hr className="my-4" />
                <div className="flex flex-col gap-6">
                    <h2>请尝试回答以下问题</h2>
                    <FormLabel>
                        1）在这份写作中您看到了TA的哪些非适应性思维？
                    </FormLabel>
                    <TextField
                        name="q1"
                        multiline
                        variant="outlined"
                        minRows={5}
                        required
                        value={q1Content}
                        onChange={e => setQ1Content(e.target.value)}
                        inputProps={{
                            readOnly: contentExist,
                        }}
                        label="您的回答"
                    />

                    {contentExist && <TextField
                        color="secondary"
                        name="q1_ref"
                        multiline
                        variant="outlined"
                        minRows={5}
                        value={reference.q1}
                        readOnly
                        label="参考答案"
                    />}

                    <FormLabel>
                        2）在以上您列出的所有想法里，您看到了哪些类型的非适应性思维？[多选题]
                    </FormLabel>
                    <FormGroup>
                        {Object.entries(biasState).map(([key, {prompt, checked, text}]) => (
                            <div key={`q2_${key}`}>
                                {!contentExist? ( <>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={checked}  
                                                onChange={handleCheckboxChange(key, setBiasState)}
                                                name={key}
                                            />
                                        }
                                        label={prompt}
                                    />
                                    
                                    {checked && key !== '7' && (
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            margin="dense"
                                            label="对应的想法"
                                            required
                                            value={text}
                                            onChange={handleTextChange(key, setBiasState)} 
                                        />
                                    )}
                                </>) : (<>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={reference.q2[key].checked}  
                                                readOnly
                                                name={key}
                                            />
                                        }
                                        label={prompt}
                                    />
                            
                                    {reference.q2[key].checked && key !== '7' && (
                                    <>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            margin="dense"
                                            label="您的回答"
                                            value={text}
                                            readOnly
                                        />

                                        <TextField
                                            color="secondary"
                                            fullWidth
                                            variant="outlined"
                                            margin="dense"
                                            label="参考答案"
                                            value={reference.q2[key].text}
                                            readOnly
                                        />
                                    </>
                                    )}
                                </> )
                            }

                            </div>
                        ))}
                    </FormGroup>

                    <FormLabel>                    
                        3）接下来，让我们通过问问题来帮助TA寻找更灵活的思维方式。针对您所找到的这些非适应性思维，您会问以下哪几种问题呢？试想一下TA又会怎样回答这些问题呢？您可以结合个人经历使用第一人称回答。[多选题]
                    </FormLabel>
                    <FormGroup>
                        {Object.entries(questionState).map(([key, { prompt, checked, text }]) => (
                            <div key={`q3_${key}`}> 
                                {!contentExist? (<>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={checked} 
                                                onChange={handleCheckboxChange(key, setQuestionState)}  
                                                name={key} 
                                            />
                                        }
                                        label={prompt}
                                    />
                                    
                                    {checked && key !== '7' && (
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            margin="dense"
                                            label="对应的想法"
                                            required
                                            value={text}  
                                            onChange={handleTextChange(key, setQuestionState)} 
                                        />
                                    )}
                                </>) : (<>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={reference.q3[key].checked} 
                                                name={key} 
                                                readOnly
                                            />
                                        }
                                        label={prompt}
                                    />
                                    
                                    {reference.q3[key].checked && key !== '7' && (
                                    <>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            margin="dense"
                                            label="您的回答"
                                            value={text}  
                                            readOnly
                                        />
                                        <TextField
                                            color="secondary"
                                            fullWidth
                                            variant="outlined"
                                            margin="dense"
                                            value={reference.q3[key].text}  
                                            label="参考答案"
                                            readOnly
                                        />
                                    </>
                                    )}
                                </>)}
                            </div>
                        ))}
                    </FormGroup>

                    
                    <FormLabel>   
                        4）在思考完以上问题之后，您认为TA可以如何更灵活、全面地看待当时的处境？您可以结合个人经历使用第一人称写作。（字数要求：≥300字）                 
                    </FormLabel>
                    <TextField
                        name="q4"
                        multiline
                        variant="outlined"
                        minRows={5}
                        required
                        value={q4Content}
                        onChange={e => setQ4Content(e.target.value)}
                        inputProps={{
                            minLength: "300",
                            readOnly: contentExist,
                        }}
                        
                    />

                    {contentExist &&
                        <TextField
                            name="q4_ref"
                            multiline
                            variant="outlined"
                            minRows={5}
                            value={reference.q1}
                            readOnly
                        />
                    }
                    
                    {errorMessage && (
                        <Alert severity="error">{errorMessage}</Alert>
                    )}

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

            <Dialog
                open={isSuccessDialogOpen}
                onClose={handleCloseSuccessDialog}
            >
                <DialogTitle>提交成功</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        感谢您用写作的方式关怀自己！
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSuccessDialog} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            {contentExist && 
                <Dialog
                    open={isReferenceDialogOpen}
                    onClose={handleCloseReferenceDialog}
                >
                    <DialogTitle>参考答案</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {REFERENCE_WRITING_DAY4}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseReferenceDialog} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            }
        </>
        )
    );
}
