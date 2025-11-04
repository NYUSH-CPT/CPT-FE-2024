import { INFORMED_CONSENT } from "@/components/text";

import MentalHealthResources from "@/components/MentalHealthResources";

import { Button, ToggleButton, TextField, Alert } from "@mui/material";

import { useRouter } from "next/router";

import { useEffect, useState } from "react";

import { ArrowForward } from "@mui/icons-material";

import axios from "axios";

import styles from "@/styles/collect.module.scss";

import { 
    Dialog,
    DialogContent,
} from "@mui/material";

export default function Collect() {
    const router = useRouter();

    const [metadata, setMetadata] = useState({});
    const [uuid, setUuid] = useState(null);
    const [exist, setExist] = useState(false);
    const [inviteCPT, setInviteCPT] = useState(null);
    const [notAllowed, setNotAllowed] = useState(false);

    useEffect(() => {
        if (!router.isReady) return;
        const { uuid } = router.query;
        setUuid(uuid);
        axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/screen_record`, {
                params: {
                    uuid: uuid,
                },
            })
            .then((res) => {
                console.log(res.data);
                setMetadata(res.data);
                setAskConsent(res.data.eligible);
                setExist(res.data.submitted)
            })
            .catch((err) => {
                setNotAllowed(true)
            });
    }, [router.isReady, router.query]);

    const [warn, setWarn] = useState(true)

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = "";
        };

        if (warn) {
            window.addEventListener("beforeunload", handleBeforeUnload);
        }

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [warn]);

    const [understand, setUnderstand] = useState(false);
    const [participate, setParticipate] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [WeChat, setWeChat] = useState("");
    const [QQ, setQQ] = useState("");
    const [askConsent, setAskConsent] = useState(true);

    const [complete, setComplete] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    
    const [remind, setRemind] = useState(true)
    const [popUp, setPopUp] = useState(false)

    const [decline, setDecline] = useState(false)

    const handleContinue = () => {
        const inviteCPT = metadata.eligible && understand && participate;
        setInviteCPT(inviteCPT);
        if (!inviteCPT && remind && !decline) {
            setPopUp(true)
            setRemind(false)
            return
        }
        setAskConsent(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");

        const isValidPhoneNumber = (num) => /^\d{9,}$/.test(num);         // 至少9位数字
        const isValidQQ = (qq) => /^[1-9]\d{4,10}$/.test(qq);              // 5到11位数字，不能以0开头

        if (inviteCPT) {
            if (!isValidPhoneNumber(phoneNumber) || WeChat.trim() === "") {
                setErrorMessage("请输入合法的手机号和微信号");
                return;
            }
        } else {
            if (!isValidPhoneNumber(phoneNumber) || !isValidQQ(QQ)) {
                setErrorMessage("请输入合法的手机号和 QQ 号");
                return;
            }
        }

        const payload = { uuid, phoneNumber, WeChat, QQ, responseId: metadata.responseId };
        console.log(payload);

        axios
            .post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/collect_info`,
                payload
            )
            .then((res) => {
                setComplete(true);
                setWarn(false)
            })
            .catch((err) => {
                console.log(err);
                setErrorMessage(
                    err.response ? err.response.data.message : err.message
                );
            });
    };

    return (
        <>
            <header className={styles.header}>
                <img src="logo.png" alt="logo" />
            </header>

            <div className={styles.container}>
                {notAllowed ? (
                    <> 抱歉，您没有权限访问此页面。</>
                ) : !complete && !exist ? (
                    <>
                        {askConsent && (
                            <div>
                                {INFORMED_CONSENT}
                                <div className={styles.buttonContainer}>
                                    <ToggleButton
                                        className={styles.toggleButton}
                                        color="primary"
                                        selected={understand}
                                        onChange={() => {
                                            setUnderstand(
                                                (prevUnderstand) =>
                                                    !prevUnderstand
                                            )
                                            setDecline(false);
                                        }
                                            
                                        }
                                    >
                                        我已经阅读了知情书并且理解以上的信息
                                    </ToggleButton>
                                    <ToggleButton
                                        className={styles.toggleButton}
                                        color="primary"
                                        selected={participate}
                                        onChange={() =>
                                            {setParticipate(
                                                (prevParticipate) =>
                                                    !prevParticipate
                                            )
                                            setDecline(false);

                                        }
                                        }
                                    >
                                        我自愿参加本研究
                                    </ToggleButton>


                                    <ToggleButton
                                        className={styles.toggleButton}
                                        value="decline"
                                        color="primary"
                                        selected={decline}
                                        onChange={() => {
                                            setDecline((prev) => !prev);
                                            if (!decline) {
                                            setUnderstand(false);
                                            setParticipate(false);
                                            }
                                        }}
                                        >
                                        我不想参与研究
                                    </ToggleButton>

                                    <Button
                                        className={styles.actionButton}
                                        variant="contained"
                                        onClick={handleContinue}
                                    >
                                        <ArrowForward />
                                    </Button>

                                    <Dialog
                                        open={popUp}
                                        onClose={() => {setPopUp(false)}}
                                    >
                                        <DialogContent>
                                           请选择所有选项以表示您知情并同意参与本研究。
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        )}
                        {inviteCPT && (
                            <div>
                                <p>
                                    感谢您的回答！我们十分荣幸能邀请您参与这个项目！我们将收集您的手机号和微信账号等信息。您的信息将会全程采取严格的保密措施。在项目开始前，我们的研究小助理将会添加您的微信，正式向您发出邀请并说明研究具体事项。期待您的参与！
                                </p>
                                <div className={styles.form}>
                                    <TextField
                                        value={phoneNumber}
                                        onChange={(e) =>
                                            setPhoneNumber(e.target.value)
                                        }
                                        fullWidth
                                        label={"您的电话号码："}
                                    ></TextField>
                                    <TextField
                                        value={WeChat}
                                        onChange={(e) =>
                                            setWeChat(e.target.value)
                                        }
                                        fullWidth
                                        label={"您的微信账号："}
                                    ></TextField>
                                    <Button
                                        className={styles.actionButton}
                                        variant="contained"
                                        onClick={handleSubmit}
                                    >
                                        提交
                                    </Button>
                                </div>
                            </div>
                        )}
                        {!askConsent && !inviteCPT && (
                            <div>
                                <p>
                                    感谢您的回答！我们十分荣幸能邀请您参与这个项目！我们将收集您的手机号和QQ账号等信息。您的信息将会全程采取严格的保密措施。在项目开始前，我们的研究小助理将会添加您的QQ，正式向您发出邀请并说明研究具体事项。期待您的参与！
                                </p>
                                <div className={styles.form}>
                                    <TextField
                                        value={phoneNumber}
                                        onChange={(e) =>
                                            setPhoneNumber(e.target.value)
                                        }
                                        fullWidth
                                        label={"您的电话号码："}
                                    />
                                    <TextField
                                        value={QQ}
                                        onChange={(e) => setQQ(e.target.value)}
                                        fullWidth
                                        label={"您的QQ账号："}
                                    />
                                    <Button
                                        className={styles.actionButton}
                                        variant="contained"
                                        onClick={handleSubmit}
                                    >
                                        提交
                                    </Button>
                                </div>
                            </div>
                        )}
                        {errorMessage && (
                            <Alert severity="error">{errorMessage}</Alert>
                        )}

                        {!askConsent && !inviteCPT && metadata.valid && (
                                <div className="flex justify-center items-center py-4">
                                    <Button
                                        variant="contained"
                                        onClick={() =>
                                            router.push(
                                                `https://danlangongyi.wjx.cn/vm/Yu8MAp9.aspx?sojumpparm=${uuid}`
                                            )
                                        }
                                          sx={{
                                            backgroundColor: '#9e9e9e', 
                                            color: '#ffffff',          
                                            '&:hover': {
                                            backgroundColor: '#7e7e7e', 
                                            },
                                        }}
                                    >
                                        不想参与研究
                                    </Button>
                                </div>
                        )}

                        {metadata.service && (
                            <>
                                <MentalHealthResources />
                            </>
                        )}
                    </>
                ) : (
                    <>
                        
                        <h3>您的作答已被记录。感谢您的参与！祝您⽣活愉快！</h3>

                        {metadata.valid ? (
                            <>
                                <div className="flex justify-center items-center pb-4">
                                    <Button
                                        variant="contained"
                                        onClick={() =>
                                            router.push(
                                                `https://danlangongyi.wjx.cn/vm/tUsFDcM.aspx?sojumpparm=${uuid}`
                                            )
                                        }
                                    >
                                        点击此处跳转至问卷星领取奖励
                                    </Button>
                                </div>
                            </>
                        ): (
                            <h3>
                                很抱歉！您未能通过问卷中的注意力检测题，故问卷被判定为无效。失去您的参与我们感到很遗憾！期待与您再次相遇！
                            </h3>
                        )}

                        {metadata.service && (
                            <>
                                <MentalHealthResources />
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
