import express from 'express'
// import { client } from '../database/client';
import { checkPassword, hashPassword } from '../hash';
import { client } from '../database/client';
// import fetch from 'cross-fetch'

export const userRoutes = express.Router()

// console.log({ a })
userRoutes.get('/', async (req, res) => {
    let userResult = await client.query('select * from users')
    res.json(userResult.rows)
})


userRoutes.post('/register', async (req, res) => {
    try {
        let username = req.body.username;
        let password = `${await hashPassword(req.body.password)}`;

        if (!username || !password) { //無填好就return error
            res.status(400).json({
                message: 'Invaild username or password'
            })
            return;
        }

        let userResult = await client.query(`select * from users WHERE usernames = $1`, [username])
        let dbuser = userResult.rows[0];

        if (dbuser) {
            res.status(400).json({ message: 'username is depulicated' })
            return;
        } else {

            await client.query('INSERT INTO users (usernames, password, created_at) VALUES ($1, $2, NOW())', [username, password]);
            req.session.name = username;
            req.session.isLoggedIn = true;
            res.status(200).json({
                message: 'Account created'
            })


        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })

    }
})



userRoutes.post('/login', async (req, res) => {
    try {
        console.log('login');
        const inputName = req.body.username;
        const inputPassword = req.body.password;
        console.log('inputName: ' + inputName, 'inputPassword: ' + inputPassword);

        if (!inputName || !inputPassword) { //無填好就return error
            res.status(400).json({
                message: 'Invaild username or password'
            })
            return;
        }


        let userResult = await client.query('SELECT * FROM users WHERE usernames = $1', [inputName]);

        let dbuser = userResult.rows[0];

        if (!dbuser) {
            res.status(400).json({
                message: 'Wrong username'

            })
            return;
        }

        let isMatched = await checkPassword(inputPassword, dbuser.password);
        if (isMatched) {
            console.log('matched')
            req.session.name = inputName;
            req.session.isLoggedIn = true;
            res.status(200).json({
                message: 'Login successful'
            })
        } else {
            res.status(400).json({
                message: 'Wrong password'
            })
            res.redirect('/')
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'internal server error' });
    }



    // for (let user of userinfo) {
    //     console.log(user)
    //     if (user.usernames == inputName && user.password == inputPassword) {
    //         req.session.user = inputName;
    //         req.session.isLoggedIn = true;
    //         res.status(200).
    //             return; // 第1個中就可以stop

    //     }
    // }

})