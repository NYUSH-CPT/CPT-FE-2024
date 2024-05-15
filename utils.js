import * as jose from 'jose'

export function getUserNameFromLocalStorage() {
    const token = window.localStorage.getItem('access_token')
    console.log(token)
    if (!token) {
        return null
    }
    const payload = jose.decodeJwt(token, { complete: true })
    console.log(payload)
    return payload.name
}
