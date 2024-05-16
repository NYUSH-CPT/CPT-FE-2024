import "@/styles/globals.css";
import { createTheme, ThemeProvider } from '@mui/material/styles'

const theme = createTheme({
    palette: {
        primary: {
            light: '#7d18d9',
            main: '#4f1086',
            dark: '#1f0535',
        },
    },
})
export default function App({ Component, pageProps }) {
    return (
        <ThemeProvider theme={theme}>
            <Component {...pageProps} />
        </ThemeProvider>
    )
}
