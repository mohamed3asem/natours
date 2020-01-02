const nodemailer = require('nodemailer')
const pug = require('pug')
const htmlToText = require('html-to-text')

module.exports = class Email {
  constructor (user, url) {
    this.to= user.email,
    this.firstName = user.name.split(' ')[0],
    this.url = url,
    this.from ='Mohamed Asem <hello@asem.io>'
  }

  newTransport () {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: "SendGrid",
        secure: false,
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      })
  }
    return nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD
      }
    })
  }

  async send (template, subject) {
    // create html to send
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      url: this.url,
      name: this.firstName,
      subject
    })
    // define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    }
    // create transport
    await this.newTransport().sendMail(mailOptions)

  }

  async sendWelcome () {
    await this.send('welcome', 'Welcome to natours family')
  }

  async sendPasswordReset () {
    await this.send('passwordReset', 'Your password reset token (valid only for 20 mins)')
  }
}

