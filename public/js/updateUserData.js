import axios from 'axios'
import { showAlert } from './alerts'

export const updateUserDate = async (data, url, method, message) => {
    try {
        const res = await axios({
            method,
            url: `http://127.0.0.1:3000/api/v1/users/${url}`,
            withCredentials: true,
            data
        })
    
        if(res.data.status == 'success') {
            showAlert('success', message)
            if(url.startsWith('resetPassword')) {
                window.setTimeout(() => {
                    location.assign('/')
                }, 1500)
            }
            if(url.startsWith('signup')) {
                window.setTimeout(() => {
                    location.assign('/me')
                }, 1500)
            }
        }
    } catch (err) {
        showAlert('error', err.response.data.message)
    }
}