import { randomInt } from 'crypto'
import express from 'express'
const app = express()
const serverUrl = 'C:/Users/USUARIO/documents/code/expressjs'
const imagesUrl = serverUrl+'/public/imgs/'

import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

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
            var validFiles = []
            console.log(JSON.stringify(req.body))

            for(const file of files){
                //console.log(`\n ${file.width}`)
                const filePath = path.join(imagesUrl, file) 
                const stat = await fs.promises.stat(filePath)


                const fileName = path.parse(path.basename(filePath)).name
                
                
                const fileValuesList = fileName.split("-")
                const fileValues = {
                    x:      Number(fileValuesList[0]),
                    y:      Number(fileValuesList[1]),
                    dir:    Number(fileValuesList[2])
                }
                
                //console.log(`image file ${file}`)


                if (qtd < 7){
                    
                    

                    
                    validFiles = await imagePushValidFiles(validFiles, file, filePath, fileValues, req.body)
                    qtd++
                    
                }
                // mandando uma imagem aleatória
                /*
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

                */
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
        validFiles.forEach(function (imgstruct, index){
            console.log(`file ${imgstruct.file} ${index} diffPosRatio ${imgstruct.diffPosRatio} dist ${imgstruct.distMouseThumb}`)
        })
    })();

    //res.sendFile(serverUrl+'/public/imgs/75-79-26.png')
})


app.listen(3000)


async function imageGetDistanceThumbMouse(file, filevalues, filepath, reqbody){
    console.log('\n --check is valid')
    
    const imageDimensions = await getImageDimensions(filepath)
    console.log(`image dimensions ${JSON.stringify(imageDimensions)}`)
    console.log(`thumb x ${filevalues.x/100 * imageDimensions.width} thumb y ${filevalues.y/100 * imageDimensions.height}`)
    console.log(`filevalues ${JSON.stringify(filevalues)} reqbody ${JSON.stringify(reqbody)}`)

    console.log('\n')
    // redimensionar imagem até cobrir a tela toda
    let scale = Math.min(reqbody.screen.width / imageDimensions.width, reqbody.screen.height / imageDimensions.height)
    let imgNewWidth = imageDimensions.width*scale
    let imgNewHeight = imageDimensions.height*scale
    console.log(`scale ${scale}. new dimensions: width ${imgNewWidth} height ${imgNewHeight}`)
    let imgNewThumbX = filevalues.x/100 * imgNewWidth
    let imgNewThumbY = filevalues.y/100 * imgNewHeight
    console.log(`new thumb x ${imgNewThumbX} new thumb y ${imgNewThumbY}`)

    console.log('\n')
    // 
    let distX = reqbody.mousepos.x - imgNewThumbX
    let distY = reqbody.mousepos.y - imgNewThumbY
    console.log(`distx ${distX} disty ${distY}`)

    let diffW = imgNewWidth-reqbody.screen.width
    let diffH = imgNewHeight-reqbody.screen.height
    console.log(`diffw ${diffW} diffh ${diffH}`)

    // distancia possivel para mover imagem mantendo tela coberta e mouse o mais proximo do dedo
    let dispX = diffW > 0 ? clamp(distX, -diffW, 0) : 0
    let dispY = diffH > 0 ? clamp(distY, -diffH, 0) : 0
    console.log(`dispX ${dispX} dispY ${dispY}`)
    imgNewThumbX += dispX
    imgNewThumbY += dispY
    distX = reqbody.mousepos.x - imgNewThumbX
    distY = reqbody.mousepos.y - imgNewThumbY
    console.log(`final distX ${distX} distY ${distY}`)
    //let thumbDirVectorX = filevalues.x
    console.log(`${distX ** 2} - ${distY ** 2}`)
    //let dotp = Math.atan2(distX, distY)
    //console.log(dotp)

    
    return {distMouseThumb: Math.sqrt(Math.abs((distX ** 2) - (distY ** 2))), scale}
}

async function imagePushValidFiles(arr, imgfile, filepath, filevalues, reqbody){
    let mousexratio = reqbody.mousepos.x / reqbody.screen.width
    let mouseyratio = reqbody.mousepos.y / reqbody.screen.height
    let diffPosRatio = (mousexratio-filevalues.x/100) + (mouseyratio-filevalues.y/100)

    let scaleAndPositionResult = await imageGetDistanceThumbMouse(imgfile, filevalues, filepath, reqbody)


    //let diffpos = (reqbody.mousepos.x+reqbody.mousepos.y) - (x/100*file.width+y/100*file.height)

    let orderedIndex = arr.length
    while(orderedIndex > 0 && Math.abs(arr[orderedIndex-1].distMouseThumb) > Math.abs(scaleAndPositionResult.distMouseThumb)){
        orderedIndex--
    }
    console.log(`file ${imgfile} diff ${diffPosRatio} index ${orderedIndex} / ${arr.length}`)
    arr.splice(orderedIndex, 0, {
        url: `/imgs/${imgfile}`,
        x: filevalues.x,
        y: filevalues.y,
        dir: filevalues.dir,
        diffPosRatio,
        distMouseThumb: scaleAndPositionResult.distMouseThumb,
        scale: scaleAndPositionResult.scale
    })

    /*{
        url: `/imgs/${file}`,
        x: fileValues.x,
        y: fileValues.y,
        dir: fileValues.dir,
    })
        */

    return arr

}

function clamp(num, lower, upper) {
    return Math.min(Math.max(num, lower), upper);
}


async function getImageDimensions(filePath) {
    const metadata = await sharp(filePath).metadata()
    
    return {
        width: metadata.width,
        height: metadata.height
    }
}