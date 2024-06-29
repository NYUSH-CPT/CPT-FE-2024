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
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiInputBase-root.Mui-disabled': {
                        backgroundColor: '#e5e5e5', 
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: '#000000'
                    }
                }
            }
        },
        MuiCheckbox: {
            styleOverrides: {
              root: {
                '&.Mui-disabled.Mui-checked + .MuiTypography-root': {
                  color: 'black',
                },
              },
            },
        }
    },
})


export default function App({ Component, pageProps }) {
    return (
        <ThemeProvider theme={theme}>
            <Component {...pageProps} />
        </ThemeProvider>
    )
}
