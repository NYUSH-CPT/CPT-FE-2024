import { useEffect, useState } from "react";
import { useRouter } from "next/router";

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
    Alert,
    Typography
} from "@mui/material";

import Header from "@/components/Header";
import Skill from "@/components/Skill";

import styles from "@/styles/challenge.module.scss";

import { requester } from "@/utils";

import { CHALLENGE_WRITING_INTRO, CHALLENGE_WRITING_PROMPT, CHALLENGE_WRITING_REFERENCE } from "@/components/text";

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

    const [day6Prompt, setDay6Prompt] = useState({});
    const [day6ContentExist, setDay6ContentExist] = useState(false);
    const [day6ExtraContent, setDay6ExtraContent] = useState("");

    useEffect(() => {
        const loadedData = localStorage.getItem(`__autosave-${window.location.pathname}`);
        if (loadedData) {
            const { biasState, questionState, q1Content, q4Content, day6ExtraContent } = JSON.parse(loadedData);
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
                console.log(updatedState)
                return updatedState;
            });
            setQ1Content(q1Content);
            setQ4Content(q4Content);
            if (day===6) setDay6ExtraContent(day6ExtraContent);
        } else {
            setBiasState(q2Biases);
            setQuestionState(q3Questions);
        }
    }, []);


    useEffect(() => {
        if (day) {
            if (![4, 5, 6].includes(day)) {
                router.push("/error")
            }
            requester.get(`/writing/${day}`)
                .then((res) => {
                    console.log(res)
                    setReference(res.data.reference);
                    if (day !== 6) setContentExist(true);
                    const { q2: biasState, q3: questionState, q1: q1Content, q4: q4Content, day6ExtraContent: day6ExtraContent } = res.data.answer;
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
                    setQ1Content(q1Content);
                    setQ4Content(q4Content);
                    setReferenceDialogOpen(true);
                    if (day == 6) {
                        setDay6Prompt(res.data.prompt)
                        setDay6ContentExist(true);
                        setDay6ExtraContent(day6ExtraContent);
                    }
                    setLoading(false)
                })
                .catch((err) => {
                    if (day == 6) {
                        setDay6Prompt(err.response.data.prompt)
                    }
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
                q4Content,
                day6ExtraContent
            });
            const dataToSave = getDataToSave();
            localStorage.setItem(`__autosave-${window.location.pathname}`, JSON.stringify(dataToSave));
        }, 0);
    }, [biasState, questionState, q1Content, q4Content, day6ExtraContent]);


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

            const q2Data = Object.keys(biasState)
                .filter(key => biasState[key].checked) 
                .map(key => biasState[key]);
            
            const q3Data = Object.keys(questionState)
                .filter(key => questionState[key].checked)
                .map(key => questionState[key]);
        
            const payload = {
                q1: q1Content,
                q2: q2Data,
                q3: q3Data,
                q4: q4Content,
            };

            if (day==6) payload.day6ExtraContent = day6ExtraContent

            requester.post(`writing/${day}`, payload)
                .then((res) => {
                    console.log(res);
                    setSuccessDialogOpen(true);
                })
                .catch((err) => {
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
            <hr/>
            <Skill />

            <form className={styles.container} id="myform">
            <h1>Day {day} 挑战性写作</h1>
                {day != 4 && CHALLENGE_WRITING_INTRO[day]}
                {day == 4 && (<p>换您来试试吧！下面是一位性少数男性针对最近的苦恼写下的一段话。您能识别并挑战其中所体现的非适应性思维吗？</p>)}
                    {day != 6? (
                        CHALLENGE_WRITING_PROMPT[day]
                    ) : <div className="flex flex-col gap-1"> 
                            <FormLabel>
                                1）发生了什么事情？
                            </FormLabel>
                            <TextField
                                name="scene"
                                multiline
                                variant="outlined"
                                minRows={5}
                                value={day6Prompt.scene}
                                disabled
                                label="发生的事情"
                            /> 
                            <br/>
                            <FormLabel>
                                2）您当时有什么想法？
                            </FormLabel>
                            <TextField
                                name="feeling"
                                multiline
                                variant="outlined"
                                minRows={5}
                                value={day6Prompt.feeling}
                                disabled
                                label="当时的想法"
                            />
                             <br/>
                        </div>}

                    <div className="flex flex-col gap-6">

                    {day!=6 && <h2>请尝试回答以下问题</h2>}
                    <FormLabel>
                        {day!=6? ("1）在这份写作中您看到了TA的哪些非适应性思维？") : ("3）退后一步，您在您之前的写作中看到了哪些非适应性的思维？")}
                    </FormLabel>
                    <TextField
                        name="q1"
                        multiline
                        variant="outlined"
                        minRows={5}
                        required
                        value={q1Content}
                        onChange={e => setQ1Content(e.target.value)}
                        disabled={contentExist || (day == 6 && day6ContentExist)}
                        label="您的回答"
                    />

                    {contentExist && day!=6 && 
                       
                    <Typography
                        fontSize='0.8em'
                        sx = {{whiteSpace: 'pre-line'}}
                        color='primary'
                    > 咨询师的回答：<br/>{reference.q1}</Typography>

                    }

                    {day==6 && <>
                    <FormLabel>
                        4）在学习了非适应性思维相关的知识以后，回想一下当时的场景，有没有哪些想法是您在上次写作中没有提及的呢？
                        </FormLabel>
                        <TextField
                            name="day6_extra_thought"
                            multiline
                            variant="outlined"
                            minRows={5}
                            required
                            value={day6ExtraContent}
                            onChange={e => setDay6ExtraContent(e.target.value)}
                            disabled={day6ContentExist}
                            label="您的回答"
                        />
                    </>}

                    <FormLabel>
                        {day!=6? ("2）在以上您列出的所有想法里，您看到了哪些类型的非适应性思维？[多选题]"): ("5）在以上您列出的所有想法里，您看到了哪些类型的非适应性思维？[多选题]")}
                    </FormLabel>
                    <FormGroup>
                        {Object.entries(biasState).map(([key, {prompt, checked, text}]) => (
                            <div key={`q2_${key}`}>
                                {(contentExist && day!=6)? (<>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={checked}  
                                                disabled
                                                name={key}
                                            />
                                        }
                                        label={prompt}
                                    />
                            
                                    {key !== '7' && (
                                    <>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            margin="dense"
                                            label="您的回答"
                                            value={text || "您的回答为空。"}
                                            disabled
                                            multiline
                                        />

                                        <Typography 
                                            color='primary'
                                            fontSize='0.8em'
                                            > 
                                            咨询师的回答：{reference.q2[key].text ? 
                                                `我们发现了“${prompt}”的思维方式，因为TA提到：“${reference.q2[key].text}”`
                                                : "我们没有发现这种非适应性思维。"}
                                        </Typography>
                                    </>
                                    )}
                                </> ) : ( <>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={(key!=='7' && biasState[7].checked)? false: checked}  
                                                onChange={handleCheckboxChange(key, setBiasState)}
                                                name={key}
                                                disabled={key!=='7' && biasState[7].checked || ((day == 6 && day6ContentExist))}
                                            />
                                        }
                                        label={day==6 && key=='7'? "我没有发现自己的非适应性思维。": prompt}
                                    />
                                    
                                    {((key!=='7' && biasState[7].checked)? false: checked) && key !== '7' && (
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            margin="dense"
                                            label="对应的想法"
                                            required
                                            value={text}
                                            onChange={handleTextChange(key, setBiasState)} 
                                            multiline
                                            disabled={key!=='7' && biasState[7].checked || (day == 6 && day6ContentExist)}
                                        />
                                    )}
                                </>)
                            }

                            </div>
                        ))}
                    </FormGroup>

                    <FormLabel>                    
                        {day!=6? ("3）接下来，让我们通过问问题来帮助TA寻找更灵活的思维方式。针对您所找到的这些非适应性思维，您会问以下哪几种问题呢？试想一下TA又会怎样回答这些问题呢？您可以结合个人经历使用第一人称回答。[多选题]") :
                            ("6）接下来，让我们通过问问题来帮助自己寻找更灵活的思维方式。针对您所找到的这些非适应性思维，您会问以下哪几种问题呢？又会怎样回答这些问题呢？[多选题]")}
                    </FormLabel>
                    <FormGroup>
                        {Object.entries(questionState).map(([key, { prompt, checked, text }]) => (
                            <div key={`q3_${key}`}> 
                                {(contentExist && day!=6)? (<>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={checked} 
                                                name={key} 
                                                disabled
                                            />
                                        }
                                        label={prompt}
                                    />
                                    
                                    {key !== '7' && (
                                    <>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            margin="dense"
                                            label="您的回答"
                                            value={text || "您的回答为空。"}  
                                            disabled
                                            multiline
                                        />
                        
                                        <Typography color='primary' fontSize='0.8em'>
                                            咨询师的回答：{reference.q3[key].text}
                                        </Typography>
                                    </>
                                    )}
                                </>) : (<>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={(key!=='7' && questionState[7].checked)? false: checked} 
                                                onChange={handleCheckboxChange(key, setQuestionState)}  
                                                name={key} 
                                                disabled={(key!=='7' && questionState[7].checked) || (day == 6 && day6ContentExist)}
                                            />
                                        }
                                        label={day==6 && key=='7'? "我没有发现自己的非适应性思维，所以我不需要提问。": prompt}
                                    />
                                    
                                    {(key!=='7' && questionState[7].checked)? false: checked && key !== '7' && (
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            margin="dense"
                                            label="对应的想法"
                                            required
                                            value={text}  
                                            onChange={handleTextChange(key, setQuestionState)}
                                            multiline 
                                            disabled={(key!=='7' && questionState[7].checked) || (day == 6 && day6ContentExist)}
                                        />
                                    )}
                                </>)}
                            </div>
                        ))}
                    </FormGroup>

                    <FormLabel>   
                        {day!=6? ("4）在思考完以上问题之后，您认为TA可以如何更灵活、全面地看待当时的处境？您可以结合个人经历使用第一人称写作。（字数要求：≥300字）")
                        : ("7）在思考完以上问题之后，您认为自己可以如何更灵活、全面地看待当时的处境？（字数要求：≥300字）")}              
                    </FormLabel>
                    <TextField
                        name="q4"
                        multiline
                        variant="outlined"
                        minRows={5}
                        required
                        value={q4Content}
                        onChange={e => setQ4Content(e.target.value)}
                        disabled={contentExist || (day == 6 && day6ContentExist)}
                        inputProps={{
                            minLength: "300",
                        }}
                        label="您的回答"
                        
                    />

                    {contentExist && day!=6 &&
                        <Typography
                        fontSize='0.8em'
                        color='primary'
                        sx = {{whiteSpace: 'pre-line'}}
                        > 咨询师的回答：<br/>{reference.q4}</Typography>
                    }
                    
                    {errorMessage && (
                        <Alert severity="error">{errorMessage}</Alert>
                    )}

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={(contentExist || (day == 6 && day6ContentExist)) ? handleRedirect : handleSubmit}
                        type="submit"
                        sx = {{marginBottom: "2em"}}
                    >
                        {(contentExist || (day == 6 && day6ContentExist)) ? "您已经提交过这次写作，返回" : "提交"}
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
                    <Button 
                        sx = {{marginBottom: "0.5em", marginRight: "0.5em"}}
                        onClick={handleCloseSuccessDialog} color="primary" variant="contained">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            {contentExist && 
                <Dialog
                    open={isReferenceDialogOpen}
                    onClose={handleCloseReferenceDialog}
                >
                    <DialogTitle>咨询师的回答</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {CHALLENGE_WRITING_REFERENCE[day]}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                        sx = {{marginBottom: "0.5em", marginRight: "0.5em"}}
                        onClick={handleCloseReferenceDialog} color="primary" variant="contained">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            }
        </>
        )
    );
}
