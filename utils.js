import * as jose from 'jose'
import axios from 'axios'

export function getUserNameFromLocalStorage() {
    const token = window.localStorage.getItem('access_token')
    if (!token) {
        return null
    }
    const payload = jose.decodeJwt(token, { complete: true })
    return payload.name
}

/**
 * A axios wrapper to handle the token for the request
 */
export class requester {
    static #instance = null

    static setInstance() {
        const token = window.localStorage.getItem('access_token')
        if (!token) {
            this.#instance = axios.create({
                baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
            })
        } else {
            this.#instance = axios.create({
                baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
        }
        
        this.#instance.interceptors.response.use(
            response => response,
            error => {
                console.log(error)
                if (error.response) {
                    if (error.response.status === 401) {
                        localStorage.removeItem("access_token")
                    }
                    if ([400, 401, 403].includes(error.response.status)) {
                        window.location.href = `/error/${error.response.status}`
                    }
                }
                return Promise.reject(error);
            }
        );
    }


    static get axios() {
        this.setInstance()
        return this.#instance
    }

    static get() {
        return this.axios.get(...arguments)
    }

    static post() {
        return this.axios.post(...arguments)
    }

    static put() {
        return this.axios.put(...arguments)
    }

    static delete() {
        return this.axios.delete(...arguments)
    }

    static patch() {
        return this.axios.patch(...arguments)
    }

    static head() {
        return this.axios.head(...arguments)
    }
}

export function enableAutoSave(formId) {
    const form = document.getElementById(formId)
    // try to load saved data
    const savedData = window.localStorage.getItem(`__autosave-${window.location}`)
    if (savedData) {
        const data = JSON.parse(savedData)
        for (let key in data) {
            form[key].value = data[key]
        }
    }
    form.addEventListener('input', () => {
        const formData = new FormData(form)
        const data = {}
        for (let key of formData.keys()) {
            data[key] = formData.get(key)
        }
        window.localStorage.setItem(`__autosave-${window.location}`, JSON.stringify(data))
    })

    if (savedData) {
        return JSON.parse(savedData)
    }

}