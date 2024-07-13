import { useState, Component, useEffect, useRef } from "react"
import styles from "@/styles/chatbox.module.scss";
import { 
    Dialog,
    DialogContent,
    DialogTitle,
    Button, 
    IconButton,
} from "@mui/material";
import Draggable from 'react-draggable';
import Paper from '@mui/material/Paper';
import {KeyboardDoubleArrowDown, KeyboardDoubleArrowUp } from "@mui/icons-material";

const SupervisorDialogWrapper = ({ children, show, handleClose }) => {
      const nodeRef = useRef(null);
      const [minimize, setMinimize] = useState(false);

      const PaperComponent = (props) => (
        <Draggable
          handle="#draggable-dialog-title"
          cancel={'[class*="MuiDialogContent-root"]'}
          nodeRef={nodeRef}
        >
          <Paper ref={nodeRef} {...props} />
        </Draggable>)

        const handleClick = () => {
            console.log("minimize", minimize)
            setMinimize(!minimize)
        }

        return (<>
                {!minimize? (<Dialog
                        hideBackdrop
                        disableScrollLock
                        disableEnforceFocus
                        open={show}
                        onClose={handleClose}
                        PaperComponent={PaperComponent}
                        aria-labelledby="draggable-dialog-title"
                    >
                        <IconButton onClick={handleClick} className="pt-2 pb-0">
                            <KeyboardDoubleArrowDown />
                        </IconButton>
                        <DialogTitle className="py-1 px-4" >  
                            <SupervisorHeader/>
                        </DialogTitle>
                        <DialogContent>
                            {children}
                        </DialogContent>
                    </Dialog>) 
                    : (
                    <Paper elevation={4} className={styles.modalMinimize}>
                            <IconButton onClick={handleClick}>
                                <KeyboardDoubleArrowUp />
                            </IconButton>
                            <SupervisorHeader/>
                        </Paper>
                    ) }
            </>)
}
  

export class SupervisorHeader extends Component {
    render() {
        return (
            <div className={styles.supervisor_container}>
                <div><img className={styles.supervisor_avatar} src="/avatar/Supervisor.png" alt={"导师头像"}/></div>
                <div className={styles.supervisor_name}>导师</div>
            </div>
        );
    }
}

export default function ChatBox(props) {

    const conversationGap = parseInt(process.env.NEXT_PUBLIC_CONVERSATION_GAP, 10) || 3000;
    const shuffleArrayFlag = process.env.NEXT_PUBLIC_SHUFFLE_ARRAY_FLAG !== 'false';

    const [showable, setShowable] = useState(false)
    const [show, setShow] = useState(false)
    const [close, setClose] = useState(false)
    const [result, setResult] = useState(null)
    const handleClose = () => setShowable(false);


    function shuffleArray(array) {
        let currentIndex = array.length;
        let temporaryValue;
        let randomIndex;

        // While there remain elements to shuffle...
        while (currentIndex !== 0) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    const choiceHandler = (event, choice) => {
        setShow(false)
        setClose(true)
        updateParentShowArr(0)
        props.elicitResponse({"choice": choice})
        console.log('choiceHandler', choice)
    }

    const transitionHandler = (event, choice) => {
        setShow(false)
        setClose(true)
        props.setShowArr([])
        props.setChat([])
        props.elicitResponse({"choice": choice})
        console.log('transitionHandler',choice)
    }

    const textModalCloseHandler = (event) => {
        setShow(false)
        setClose(true)
        updateParentShowArr(0)
    }

    const updateParentShowArr = (waitingTime) => {
        if (showable && props.index !== props.length - 1 && (props.showArr.some((value) => value === false))) {
            setTimeout(()=>{
                const arr = props.showArr.slice()
                arr[props.index + 1] = true
                console.log('finished callback')
                props.setShowArr(arr)
            }, waitingTime);
        }
    }

    const clientWrapper = (content) => {
        updateParentShowArr(conversationGap)
        return <div className={showable ? styles.clientWrapper : styles.hide}>
            <img src={`/avatar/Client ${props.displayID+1}.png`} className={styles.clientAvatar} />
                <div className={showable ? styles.clientMsg : styles.hide}>{content.text}</div>
            </div>
    }


    const userWrapper = (content) => {
        updateParentShowArr(conversationGap)
        return <div className={showable ? styles.userMsg : styles.hide}>{content.text}</div>
    }

    const supervisorWrapper = (content) => {

        const choices = JSON.parse(content.choices);
        let choicesArray = []
        let transition = false

        for (const [key, value] of Object.entries(choices)) {
            value && choicesArray.push(value)
        }

        if (choicesArray.length==1 && choicesArray[0]=="继续") {
            transition = true
        }
        else if (shuffleArrayFlag && choicesArray.length < 5 && choicesArray[0]!="1分") {
            choicesArray = shuffleArray(choicesArray);
        }

        content.text = content.text.replaceAll('//', '\n')

        return <>
            <SupervisorDialogWrapper show={show} onClose={handleClose}>
                <div className={styles.modalQuestion}>{content.text}</div>
                <div>
                    {choicesArray.map((choice, index) => {
                        return <Button onClick={transition? (e) => transitionHandler(e, choice) :(e) => choiceHandler(e, choice)} className={styles.choice} key={index}>
                                    {choice.replace(/\/\//g, "\n")}
                                </Button>
                    })}
                </div>
            </SupervisorDialogWrapper>
        </>
    }


    const supervisorTextWrapper = (content) => {

        const goHomeModal = <>
            <SupervisorDialogWrapper show={show} onClose={handleClose}>
                <div className={styles.modalQuestion}>{content.text}</div>
                <Button className={styles.choice} onClick={(e) => window.location.href='/'}>继续</Button>
            </SupervisorDialogWrapper>
        </>

        content.text = content.text.replaceAll('//', '\n')
        if (content.text.includes("游戏结束")) {
            console.log('game over')
            return goHomeModal
        }
        else if (content.text.includes("今天辛苦啦")){
            console.log('game break')
            return goHomeModal
        }

        return <>
            <SupervisorDialogWrapper show={show} onClose={handleClose}>
                <div className={styles.modalQuestion}>{content.text}</div>
                <Button className={styles.choice} onClick={(e) => textModalCloseHandler(e)}>继续</Button>
            </SupervisorDialogWrapper>
        </>
    }

    const message = props.message


    useEffect(() => {
        setShowable(props.showArr[props.index])
        if (close===true) {
            setShow(false)
        }
        else{
            setShow(showable)
        }
        if (message.speaker === "client") {
            setResult(clientWrapper(message))
        } else if (message.speaker === "supervisorText") {
            setResult(supervisorTextWrapper(message))
        } else if (message.speaker === "supervisor") {
            setResult(supervisorWrapper(message))
        } else if (message.speaker === "user") {
            setResult(userWrapper(message))
        }
        else {
            console.log("response object does not have valid speaker")
        }

    }, [showable,show,close,props.showArr[props.index]])


    return (<>{result}</>)
}