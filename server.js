import express from 'express'
const app = express()
const serverUrl = 'C:/Users/USUARIO/documents/code/expressjs'


//app.use('/')
app.use(express.static('public/'));


app.set('view engine', 'ejs')


// html
app.get('/', (req, res) => {
    console.log("here")
    res.render('index', {img: "poggers"})
})

// data
app.get('/api/img', (req, res) => {
    res.sendFile(serverUrl+'/public/imgs/75-79-26.png')
})


//const userRouter = require('./routes/users')
//import { router } from './routes/game.js'
// //app.use('/', router)

app.listen(3000)

