import { randomInt } from 'crypto'
import express from 'express'
const app = express()
const serverUrl = 'C:/Users/USUARIO/documents/code/expressjs'
const imagesUrl = serverUrl+'/public/imgs/'

import fs from 'fs'
import path from 'path'



//app.use('/')
app.use(express.static('public/'));


app.set('view engine', 'ejs')


// html
app.get('/', (req, res) => {
    console.log("here")
    res.render('index.ejs')
})

app.use(express.json())


// data
app.post('/api/img', (req, res) => {
    (async ()=>{
        let qtd = 0
        try {
            const files = await fs.promises.readdir(imagesUrl)
            const validFiles = []
            console.log(JSON.stringify(req.body))

            for(const file of files){
                //console.log('\n')
                const filePath = path.join(imagesUrl, file) 
                const stat = await fs.promises.stat(filePath)


                const fileName = path.parse(path.basename(filePath)).name
                
                
                const fileValuesList = fileName.split("-")
                const fileValues = {
                    x:      Number(fileValuesList[0]),
                    y:      Number(fileValuesList[1]),
                    dir:    Number(fileValuesList[2])
                }
                

                // mandando uma imagem aleatória
                if (qtd < 5 && randomInt(100) < 30){
                    console.log(`qtd images sending ${qtd}`)
                    validFiles.push({
                        url: `/imgs/${file}`,
                        x: fileValues.x,
                        y: fileValues.y,
                        dir: fileValues.dir,
                    })
                    qtd++    
                }

               
            }
            console.log(`check antes de enviar os dados ${validFiles} ${validFiles.length}`)
            res.send({
                images: validFiles,
                qtdImages: validFiles.length
            })
        } 
        catch (e){
            console.log('error image bosta')
            console.log(e)
            console.log(req.body)
        }
    })();

    //res.sendFile(serverUrl+'/public/imgs/75-79-26.png')
})


//const userRouter = require('./routes/users')
//import { router } from './routes/game.js'
// //app.use('/', router)

app.listen(3000)

