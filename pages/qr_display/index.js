import { useEffect, useState, useRef } from 'react';
import { SignJWT } from 'jose';
import { QRCodeSVG } from 'qrcode.react';
import styles from '@/styles/qr_display.module.scss';

export default function QRDisplay() {
    const [qrUrl, setQrUrl] = useState('');
    const [error, setError] = useState('');
    const refreshTimerRef = useRef(null); // 存储定时器 ID

    const generateToken = async () => {
        try {
            // 清除之前的定时器（如果存在）
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
                refreshTimerRef.current = null;
            }

            // 使用前后端共享的密钥（从环境变量获取）
            const secret = process.env.NEXT_PUBLIC_QR_JWT_SECRET;
            if (!secret) {
                throw new Error('NEXT_PUBLIC_QR_JWT_SECRET not configured');
            }

            const now = Math.floor(Date.now() / 1000);
            const exp = now + 30; // 30秒有效期

            // 生成 JWT token
            const secretKey = new TextEncoder().encode(secret);
            const token = await new SignJWT({ iat: now, exp })
                .setProtectedHeader({ alg: 'HS256' })
                .sign(secretKey);

            // 生成二维码 URL
            const url = `https://activity.bluedhealth.com/weal/shnyu/redirect?token=${token}`;
            setQrUrl(url);
            setError('');
            console.log("token generated", "now:", now, "exp:", exp);

            const nextRefresh = 30000;
            refreshTimerRef.current = setTimeout(() => {
                generateToken();
            }, nextRefresh);
        } catch (error) {
            console.error('Failed to generate QR token:', error);
            setError('生成二维码失败，5秒后重试');
            
            // 清除之前的定时器
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
                refreshTimerRef.current = null;
            }
            
            // 出错时快速重试
            refreshTimerRef.current = setTimeout(() => {
                generateToken();
            }, 5000);
        }
    };

    useEffect(() => {
        // 页面加载时立即生成
        generateToken();

        // 组件卸载时清理定时器
        return () => {
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
                refreshTimerRef.current = null;
            }
        };
    }, []);

    return (
        <>
            <header className={styles.header}>
                <img src="/logo.png" alt="logo" />
            </header>
            <div className={styles.container}>
                <h2 className={styles.subtitle}>请使用 Blued App 扫描二维码</h2>
                
                {qrUrl ? (
                    <div className={styles.qrContainer}>
                        <div className={styles.qrWrapper}>
                            <QRCodeSVG 
                                value={qrUrl}
                                size={400} 
                                level="H" 
                                className={styles.qrCode}
                            />
                        </div>
                    </div>
                ) : (
                    <div className={styles.loading}>加载中...</div>
                )}
                
                {error && <p className={styles.error}>{error}</p>}
            </div>
        </>
    );
}

