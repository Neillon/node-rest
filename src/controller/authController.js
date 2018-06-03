const express = require('express')
const User = require('../model/User')
const bcrypt = require('bcrypt')

const router = express.Router();

router.post('/register', async (req, res) => {
    const { email } = req.body
    try {
        if (await User.findOne({ email })) {
            return res.status(400).send({ error: "User already exists"})
        }

        const user = await User.create(req.body)
        user.password = undefined

        console.log('user created');

        return res.send({ user })
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

    console.log(await bcrypt.compare(password, user.password))

    if (!(await bcrypt.compare(password, user.password))) {
        return res.status(400).send({ error: 'Invalid password'})
    }

    res.send(user)

})


module.exports = (app) => { app.use('/auth', router) };