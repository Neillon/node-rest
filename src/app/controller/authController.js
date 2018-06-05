const express = require('express')
const User = require('../model/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth')
const crypto = require('crypto')
const mailer = require('../../modules/mailer')

const router = express.Router();

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    })
}


router.post('/register', async (req, res) => {
    const { email } = req.body
    try {
        if (await User.findOne({ email })) {
            return res.status(400).send({ error: "User already exists"})
        }

        const user = await User.create(req.body)
        user.password = undefined

        console.log('user created');

        return res.send({ 
            user,
            token: generateToken({ id: user.id })
        })
    } catch (error) {
        res.status(400).send({error: `Registration failed ${error}`})
    }
})

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password');    
    
    if (!user) {
        return res.status(400).send({ error: 'User not found'})    
    }

    // console.log(await bcrypt.compare(password, user.password))

    if (!await bcrypt.compare(password, user.password)) {
        return res.status(400).send({ error: 'Invalid password'})
    }

    user.password = undefined

    res.send({ 
        user,
        token: generateToken({ id: user.id })
    })
})

router.post('/forgotpassword', async (req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) {
            res.status(400).send({ error: 'Error on forgot password, try again' })
        }
        const token = crypto.randomBytes(20).toString('hex')

        const now = new Date();
        now.setHours(now.getHours() + 1)

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        })


        mailer.sendMail({
            to: email,
            from: 'neilloncesar13@gmail.com',
            template: 'auth/forgot-password',
            context: { token }
        }, (err) => {  
            if (err) {
                console.log(err)
                return res.status(400).send({ error: 'Error on forgot password, try again' })
            }

            return res.send()
        })

    } catch (error) {
        res.status(400).send({ error: 'Error on forgot password, try again' })
    }
})

router.post('/resetpassword', async (req, res) => {
    const { email, token, password } = req.body
    
    try {
        const user = await User.findOne({ email })
            .select('+passwordResetToken passwordResetExpires');
        
        if (!user) {
            return res.status(400).send({ error: 'User not found'})    
        }

        if (token !== user.passwordResetToken) {
            return res.status(400).send({ error: 'Token invalid'})
        }
    
        const now = new Date();

        if (now > user.passwordResetExpires) {
            return res.status(400).send({ error: 'Token expired. Generate new one'})
        }

        user.password = password
        await user.save()

        res.send()

    } catch (error) {
        return res.status(400).send({ error: 'Cannot reset password. Try agian'})
    }
})
module.exports = (app) => { app.use('/auth', router) };