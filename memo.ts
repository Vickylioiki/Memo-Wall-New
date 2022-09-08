import express from 'express';
import expressSession from 'express-session'
import path from 'path'
import fs from 'fs';

import { isLoggedIn } from './guard';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import { uploadDir } from './upload'


fs.mkdirSync(uploadDir, { recursive: true })

const app = express();
const server = new http.Server(app);
export const io = new SocketIO(server); //io and server connect

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


import { memoRoutes } from './routes/memoRoutes';
import { userRoutes } from './routes/userRoutes';





app.use(
    expressSession({
        secret: 'MemoWall',
        resave: true,
        saveUninitialized: true,
    }),
)  //default next ( )




declare module 'express-session' {
    interface SessionData {
        name?: string;
        isLoggedIn?: boolean;
    }
}



app.use('/user', userRoutes);
app.use('/memos', memoRoutes);

app.use('/upload', express.static('uploads'));
app.use(express.static('public'));
app.use(express.static('error')); //auto next (用static先可以包括埋error入面既CSS, JS)
//admin.html should be inside protected
app.use(isLoggedIn, express.static('protected'))

io.on('connection', function (socket) {
    console.log(`New socket client, socket id = ${socket.id}`);
});



app.use((req, res) => {
    res.sendFile(path.resolve('./error/error.html')) //唔加static, 就淨係拎到HTML, 拎唔到CSS, JS
})

server.listen(8080, async () => {
    console.log('listening on port 8080');
})
// async function startServer() {
//     server.listen(8080, () => {
//         console.log('listening on port 8080');
//     })


// }
// startServer()