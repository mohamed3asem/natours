import axios from 'axios'
import { showAlert } from './alerts'


export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            withCredentials: true,
            data: {
                email,
                password
            }
        })

        if (res.data.status = 'success') {
            showAlert('success', 'logged in successfully!')
            window.setTimeout(() => {
                location.assign('/')
            }, 1500)
        }
    } catch (err) {
        showAlert('error', err.response.data.message)
    }
}

export const logOut = async ()=> {
    try {
        const res = await axios({
                method: 'GET',
                url: 'http://127.0.0.1:3000/api/v1/users/logout',
                withCredentials: true,
        })
        if(res.status = 'success') {
            console.log('logged out')
            location.reload(true)
        }
    } catch (err) {
        showAlert('error', 'Error logging out! Try again')
    }
}
