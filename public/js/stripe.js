import axios from 'axios'
import { showAlert } from './alerts'
const stripe = Stripe('pk_test_zxQ98SvhhSlTstCf5sY06w5k00VUN0ykId')

export const bookTour =async tourId => {
    try {
        // 1) get the session from the API
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`)
        // 2) create checkout form + charge the credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch (err) {
        showAlert('error', err)
    }
}