import '@babel/polyfill'
import { login, logOut } from './login'
import { updateUserDate } from './updateUserData'
import { displayMap } from './mapbox'
import { bookTour } from './stripe'

// DOM elements
const mapBox = document.getElementById('map')
const bookBtn = document.getElementById('book-tour')
const resetPassBtn = document.getElementById('reset_password_btn')
const forgetPassBtn = document.getElementById('forget-password-btn')
const signupBtn = document.getElementById('signup-btn')
const loginForm = document.querySelector('.form--login')
const signupForm = document.querySelector('.form--signup')
const userDataForm = document.querySelector('.form-user-data')
const updatePassForm = document.querySelector('.form-user-settings')
const logOutBtn =document.querySelector('.nav__el--logout')


if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        login(email, password)
    })
}

if (mapBox)  {
    const locations = JSON.parse(mapBox.dataset.locations)
    displayMap(locations)
}

if(logOutBtn) {
    logOutBtn.addEventListener('click', logOut)
}

if(userDataForm) {
    userDataForm.addEventListener('submit', e => {
        e.preventDefault()
        const form = new FormData()
        form.append('email', document.getElementById('email').value)
        form.append('name', document.getElementById('name').value)
        form.append('photo', document.getElementById('photo').files[0])
        
        updateUserDate(form, 'updateMe', 'PATCH', 'Data updated successfully')
    })
}

if(updatePassForm) {
    updatePassForm.addEventListener('submit',async e => {
        e.preventDefault()
        document.querySelector('.btn--save-password').textContent= 'Updating...'

        const currentPassword = document.getElementById('password-current').value
        const newPassword = document.getElementById('password2').value
        const newPasswordConfirm = document.getElementById('password-confirm').value
        
        await updateUserDate({
            currentPassword, newPassword, newPasswordConfirm},
            'updatePassword',
            'PATCH',
            'Password updates successfully')
        
        document.querySelector('.btn--save-password').textContent ='Save password'
        document.getElementById('password-current').value= ''
        document.getElementById('password2').value= ''
        document.getElementById('password-confirm').value= ''
    })
}

if(bookBtn) {
    bookBtn.addEventListener('click', e => {
        console.log('pass')
        bookBtn.textContent= 'Proceeding...'
        const { tourId } = e.target.dataset
        console.log(tourId)
        bookTour(tourId)
    })
}

if(resetPassBtn) {
    resetPassBtn.addEventListener('click',async e=> {
        e.preventDefault()
        const {token} = e.target.dataset
        const password = document.getElementById('rest_password').value
        const passwordConfirm = document.getElementById('reset_password_confirm').value
        await updateUserDate({password, passwordConfirm}, `resetPassword/${token}`, 'PATCH', 'Password updated successfully')
    })
}

if(forgetPassBtn) {
    forgetPassBtn.addEventListener('click',async e=> {
        e.preventDefault()
        forgetPassBtn.textContent= 'Sending...'
        const email = document.getElementById('reset-email').value
        await updateUserDate({email}, 'forgotPassword', 'POST', 'Email sent successfully. please check your email to reset password')
        forgetPassBtn.textContent= 'sent'
        forgetPassBtn.disabled = true
    })
}

if(signupForm) {
    signupForm.addEventListener('submit', async e => {
        e.preventDefault()
        signupBtn.textContent = 'Signing up...'
        const email = document.getElementById('signup-email').value
        const name = document.getElementById('sigup-name').value
        const password = document.getElementById('password').value
        const passwordConfirm = document.getElementById('password-confirm').value
        console.log(name)
        await updateUserDate({email, name, password, passwordConfirm},
            'signup',
            'POST',
            `Welcome ${name} to natours family`
        )
        signupBtn.textContent = 'Signed up'
        signupBtn.disabled = true
    })
    
}