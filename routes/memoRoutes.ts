import express from 'express';
import { client } from '../database/client';
import { formParse } from '../upload';
// import { client } from '../database/client';
// import { io } from '../memo';
// import { isLoggedIn } from '../guard';


export const memoRoutes = express.Router();

memoRoutes.post('/formidable', async (req, res) => {

    try {
        console.log('Post memo')
        const { contentFile, imageFile } = await formParse(req)
        await client.query(`INSERT INTO memos (content, image, created_at) VALUES ($1, $2, NOW())`, [contentFile, imageFile]);
        // io.emit('new-memo', {
        //     fromSocketId
        // })

        res.json({
            message: 'Upload successful'
        })
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Upload failed'
        })
        return;

    }

})


memoRoutes.get('/', async (req, res) => {
    try {
        console.log('Get memos client:', client)
        const memoInfo = await client.query('SELECT * from memos ORDER BY created_at DESC')

        // const dir = path.join(__dirname, 'memo.json');
        // let memoJson: any[] = await jsonfile.readFileSync(dir);
        res.status(200).json(memoInfo.rows)
        //get back memo JSON data(可以係network preview 睇)

        return;
    } catch (err) {
        console.log(err)
        res.status(500).send('internal error: ' + err.message)
    }

})


memoRoutes.delete('/id/:id', async (req, res) => {
    try {
        console.log('Delete memo')
        const memoId = req.params.id;
        // const dir = path.join(__dirname, 'memo.json');
        // let memoJson: any[] = await jsonfile.readFileSync(dir);
        // let memoIndex = memoJson.findIndex(obj => obj.id == memoId);
        const memoDelete = await client.query(`DELETE FROM memos WHERE id = $1`, [memoId])
        // if (memoIndex >= 0) {
        //     memoJson.splice(memoIndex, 1);

        // }
        // jsonfile.writeFileSync(path.join(__dirname, 'memo.json'), memoJson, { spaces: 2 });
        console.log('Delete:', memoDelete);
        res.status(200).json('Delete Success')

    } catch (err) {
        res.status(400).json('Fail to delete')
    }

})

memoRoutes.put('/id/:id', async (req, res) => {
    try {
        const memoId = req.params.id;
        const editedContent = req.body.contentNew
        // const dir = path.join(__dirname, 'memo.json');
        // let memoJson: any[] = await jsonfile.readFileSync(dir);
        // let memoIndex = memoJson.findIndex(obj => obj.id == memoId);
        // console.log('edit:', editedContent)
        // console.log(memoIndex);
        // if (memoIndex >= 0) {
        //     memoJson[memoIndex].content = editedContent
        // }
        // jsonfile.writeFileSync(path.join(__dirname, 'memo.json'), memoJson, { spaces: 2 });
        await client.query(`UPDATE memos SET content = $1, updated_at = (now())  WHERE id = $2`, [editedContent, memoId])
        res.status(200).json('Edit successfully')

    } catch (error) {
        res.status(400).json('Fail to update')
    }


})