import React from 'react';
import Link from 'next/link';

const QRExpired = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <h1 style={{ color: '#333', marginBottom: '1rem' }}>二维码已失效</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>请刷新重试</p>
            <Link href="/" style={{ color: '#0070f3', textDecoration: 'underline' }}>
                返回首页
            </Link>
        </div>
    );
};

export default QRExpired;

