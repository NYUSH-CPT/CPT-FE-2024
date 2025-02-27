import { INFORMED_CONSENT } from "@/components/text";

import { Button, ToggleButton, TextField, Alert } from "@mui/material";

import { useRouter } from "next/router";

import { useEffect, useState } from "react";

import { ArrowForward } from "@mui/icons-material";

import axios from "axios";

import styles from "@/styles/collect.module.scss";

export default function Collect() {
    const router = useRouter();

    const [uuid, setUuid] = useState(null);
    const [invalid, setInvalid] = useState(null);
    const [responseId, setResponseId] = useState(null);
    const [exist, setExist] = useState(false);
    const [inviteCPT, setInviteCPT] = useState(null);

    useEffect(() => {
        if (!router.isReady) return;
        const { uuid, invalid, responseId } = router.query;
        const data = localStorage.getItem(
            `__autosave--${window.location.pathname}`
        );
        let loadedInviteCPT, loadedUuid, loadedInvalid, loadedResponseID;
        if (data) {
            const parsedData = JSON.parse(data);
            loadedInviteCPT = parsedData.loadedInviteCPT;
            loadedUuid = parsedData.loadedUuid;
            loadedInvalid = parsedData.loadedInvalid;
            loadedResponseID = parsedData.loadedResponseID;
            console.log(data)
        } 
        if (loadedUuid == uuid) {
            setUuid(uuid);
            setInvalid(loadedInvalid);
            setResponseId(loadedResponseID);
            setInviteCPT(loadedInviteCPT);
            setAskConsent(loadedInviteCPT == null && loadedInvalid != 1);
        } else {
            setUuid(uuid);
            setInvalid(invalid);
            setResponseId(responseId);
            setAskConsent(invalid == 0);
            const data = {
                loadedInviteCPT: inviteCPT,
                loadedUuid: uuid,
                loadedInvalid: invalid,
                loadedResponseID: responseId,
            };
            localStorage.setItem(
                `__autosave--${window.location.pathname}`,
                JSON.stringify(data)
            );
        }
        axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/key`, {
                params: {
                    key: uuid,
                },
            })
            .then((res) => {
                setExist(true);
            })
            .catch((err) => {});
    }, [router.isReady, router.query]);

    const [understand, setUnderstand] = useState(false);
    const [participate, setParticipate] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [WeChat, setWeChat] = useState("");
    const [QQ, setQQ] = useState("");
    const [askConsent, setAskConsent] = useState(true);

    const [complete, setComplete] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");

    const handleContinue = () => {
        const rand = Math.random();
        console.log(rand);
        const inviteCPT =
            invalid == 0 && rand >= 1 / 3 && understand && participate;
        setInviteCPT(inviteCPT);
        setAskConsent(false);
        const data = {
            loadedInviteCPT: inviteCPT,
            loadedUuid: uuid,
            loadedInvalid: invalid,
            loadedResponseID: responseId,
        };
        localStorage.setItem(
            `__autosave--${window.location.pathname}`,
            JSON.stringify(data)
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");

        if (inviteCPT && (phoneNumber == "" || WeChat == "")) {
            setErrorMessage("无效的回答");
            return;
        }

        if (!inviteCPT && (phoneNumber == "" || QQ == "")) {
            setErrorMessage("无效的回答");
            return;
        }

        const payload = { uuid, phoneNumber, WeChat, QQ, responseId };
        console.log(payload);

        axios
            .post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/collect_info`,
                payload
            )
            .then((res) => {
                setComplete(true);
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
                {uuid == null || invalid == null || responseId == null ? (
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
                                        onChange={() =>
                                            setUnderstand(
                                                (prevUnderstand) =>
                                                    !prevUnderstand
                                            )
                                        }
                                    >
                                        我已经阅读了知情书并且理解以上的信息
                                    </ToggleButton>
                                    <ToggleButton
                                        className={styles.toggleButton}
                                        color="primary"
                                        selected={participate}
                                        onChange={() =>
                                            setParticipate(
                                                (prevParticipate) =>
                                                    !prevParticipate
                                            )
                                        }
                                    >
                                        我自愿参加本研究
                                    </ToggleButton>

                                    <Button
                                        className={styles.actionButton}
                                        variant="contained"
                                        onClick={handleContinue}
                                    >
                                        <ArrowForward />
                                    </Button>
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
                    </>
                ) : (
                    <div>您的作答已被记录。感谢您的参与！祝您⽣活愉快！</div>
                )}
            </div>
        </>
    );
}
