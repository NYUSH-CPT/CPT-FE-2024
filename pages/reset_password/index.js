import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/router";

import styles from "@/styles/login.module.scss";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const schema = yup.object({
    password: yup
        .string()
        .min(8, "至少8位")
        .matches(/[a-z]/, "需要小写字母")
        .matches(/[A-Z]/, "需要大写字母")
        .matches(/\d/, "需要数字")
        .matches(/[^a-zA-Z0-9]/, "需要特殊字符")
        .required("密码为必填项"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "两次输入的密码不一致")
        .required("请重复输入密码"),
});

export default function Signup() {
    const router = useRouter()
    const token = router.query.token
    const uuid = router.query.uuid

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

    const [submitMessage, setSubmitMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const onSubmit = async (data) => {
        try {
            console.log(uuid, token, `${process.env.NEXT_PUBLIC_BACKEND_URL}/reset_password`)
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/reset_password`,
                {   
                    uuid: uuid, 
                    token: token,
                    password: data.password
                }
            );
            setSubmitMessage("密码重置成功！现在可以去登录页面了。");
            setErrorMessage("")
        } catch (err) {
            setErrorMessage(err.response?.data?.error || "密码重置失败");
        }
    };

    return (
        <div className={styles.container}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ width: "100%" }}
                className={styles.formGroup}
            >
                <div className={styles.title}>上海纽约大学压力与健康研究</div>

                <div className={styles.inputGroup}>
                    <KeyOutlinedIcon className="text-white" />
                    <input
                        type="password"
                        placeholder="新密码"
                        className={styles.input}
                        {...register("password")}
                    />
                </div>

                <div className="text-white">
                    <h3>
                        {" "}
                        密码要求：至少8位，包含大写、小写字母、数字和特殊字符{" "}
                    </h3>
                </div>

                {errors.password?.message && (
                    <div className={styles.errorMsg}>
                        {errors.password?.message}
                    </div>
                )}

                <div className={styles.inputGroup}>
                    <LockOutlinedIcon className="text-white" />
                    <input
                        type="password"
                        placeholder="重复密码"
                        className={styles.input}
                        {...register("confirmPassword")}
                    />
                </div>
                {errors.confirmPassword && (
                    <div className={styles.errorMsg}>
                        {errors.confirmPassword.message}
                    </div>
                )}

                <button type="submit" className={styles.loginButton}>
                    重置密码
                </button>

                {submitMessage && (
                    <div
                        className={styles.errorMsg}
                        style={{ color: "lightgreen" }}
                    >
                        {submitMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className={styles.errorMsg}>{errorMessage}</div>
                )}

                <div className={styles.setPwdLink}>
                    <a href="/login">已经有账号了？登录</a>
                </div>
            </form>
        </div>
    );
}
