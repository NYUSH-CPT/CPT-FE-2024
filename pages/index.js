import Head from 'next/head'
import Header from '@/components/Header'

export default function Home() {
    return (
        <>
            <Head>
                <title>{process.env.NEXT_PUBLIC_PROJECT_NAME}</title>
            </Head>
            <Header />
            <p>这是正文内容</p>
        </>
    )
}
