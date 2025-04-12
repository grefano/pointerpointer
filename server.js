import { randomInt } from 'crypto'
import express from 'express'
const app = express()
const serverUrl = 'C:/Users/USUARIO/documents/code/expressjs'
const imagesUrl = serverUrl+'/public/imgs/'

import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

var doLog = false

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


                if (true){
                    
                    

                    
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
            
            //console.log(`\n check antes de enviar os dados ${validFiles} ${validFiles.length} \n`)
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
        console.log('\n')
        validFiles.forEach(function (imgstruct, index){
            //console.log(`imgfile ${JSON.stringify(imgstruct)}`)
            //console.log(`file ${imgstruct.file} ${index} diffPosRatio ${imgstruct.diffPosRatio} dist ${imgstruct.distMouseThumb}`)
        })
    })();

    //res.sendFile(serverUrl+'/public/imgs/75-79-26.png')
})


app.listen(3000)


async function imageGetScaledResult(file, filevalues, filepath, reqbody){
    //mylog('\n --check is valid')
    doLog = (file == '79-91-94.png') 
    mylog('\n')
    const imageDimensions = await getImageDimensions(filepath)
    //mylog(`image dimensions ${JSON.stringify(imageDimensions)}`)
    //mylog(`thumb x ${filevalues.x/100 * imageDimensions.width} thumb y ${filevalues.y/100 * imageDimensions.height}`)
    //mylog(`filevalues ${JSON.stringify(filevalues)} reqbody ${JSON.stringify(reqbody)}`)

    // redimensionar imagem até cobrir a tela toda
    let scale = Math.max(reqbody.screen.width / imageDimensions.width, reqbody.screen.height / imageDimensions.height)
    let imgNewWidth = imageDimensions.width*scale
    let imgNewHeight = imageDimensions.height*scale    
    mylog(`old dimensions: width ${imageDimensions.width} height ${imageDimensions.height}`)
    mylog(`scale ${scale}. new dimensions: width ${imgNewWidth} height ${imgNewHeight}`)
    let imgNewThumbX = filevalues.x/100 * imgNewWidth
    let imgNewThumbY = filevalues.y/100 * imgNewHeight
    //mylog(`new thumb x ${imgNewThumbX} new thumb y ${imgNewThumbY}`)

    // 
    let distX = reqbody.mousepos.x - imgNewThumbX
    let distY = reqbody.mousepos.y - imgNewThumbY
    //mylog(`distx ${distX} disty ${distY}`)

    let diffW = imgNewWidth-reqbody.screen.width
    let diffH = imgNewHeight-reqbody.screen.height
    //mylog(`diffw ${diffW} diffh ${diffH}`)

    // distancia possivel para mover imagem mantendo tela coberta e mouse o mais proximo do dedo
    let dispX = diffW > 0 ? clamp(distX, -diffW, 0) : 0
    let dispY = diffH > 0 ? clamp(distY, -diffH, 0) : 0
    mylog(`dispX ${dispX} dispY ${dispY}`)
    imgNewThumbX += dispX
    imgNewThumbY += dispY
    mylog(`mouse pos x ${reqbody.mousepos.x} y ${reqbody.mousepos.y}`)  
    mylog(`thumb pos x ${imgNewThumbX} y ${imgNewThumbY}`)
    // as duas posições estão certas
    distX = reqbody.mousepos.x - imgNewThumbX
    distY = reqbody.mousepos.y - imgNewThumbY
    mylog(`final distX ${distX} distY ${distY}`)

    // dedo aponta pro mouse
    let angleThumbToMouse = Math.atan2(-distY, distX)
    if (distX < 0) Math.PI-angleThumbToMouse

    mylog(`dir thumb to mouse ${angleThumbToMouse*180/Math.PI}, thumb dir ${filevalues.dir}`)
    let angleDiff = angleDegreeDifference(angleThumbToMouse*180/Math.PI, filevalues.dir)
    
    let angleDiffNormalized = Math.abs(Math.cos(angleDiff*Math.PI/180)-1)/2
    
    mylog(`file ${file} dotp ${angleDiffNormalized} `)

    //let thumbDirVectorX = filevalues.x
    mylog(`${distX ** 2} - ${distY ** 2}`)
    //mylog(dotp)

    doLog = true
    return {distMouseThumb: Math.sqrt(Math.abs((distX ** 2) - (distY ** 2))), scale, angleDiffNormalized, posOffset: {x: dispX, y: dispY}}
}

async function imagePushValidFiles(arr, imgfile, filepath, filevalues, reqbody){
    let mousexratio = reqbody.mousepos.x / reqbody.screen.width
    let mouseyratio = reqbody.mousepos.y / reqbody.screen.height
    let diffPosRatio = (mousexratio-filevalues.x/100) + (mouseyratio-filevalues.y/100)

   
    let scaleAndPositionResult = await imageGetScaledResult(imgfile, filevalues, filepath, reqbody)


    //let diffpos = (reqbody.mousepos.x+reqbody.mousepos.y) - (x/100*file.width+y/100*file.height)
    if (scaleAndPositionResult.angleDiffNormalized > 0.01) return arr

    let orderedIndex = arr.length
    while(orderedIndex > 0 && Math.abs(arr[orderedIndex-1].distMouseThumb) > Math.abs(scaleAndPositionResult.distMouseThumb)){
        orderedIndex--
    }
    //console.log(`file ${imgfile} diff ${diffPosRatio} index ${orderedIndex} / ${arr.length}`)
    arr.splice(orderedIndex, 0, {
        url: `/imgs/${imgfile}`,
        x: filevalues.x,
        y: filevalues.y,
        dir: filevalues.dir,
        diffPosRatio,
        ...scaleAndPositionResult
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

function angleDegreeDifference(angulo1, angulo2) {
    // Normaliza os ângulos para o intervalo [0, 360)
    angulo1 = ((angulo1 % 360) + 360) % 360;
    angulo2 = ((angulo2 % 360) + 360) % 360;
    
    // Calcula a diferença direta e a diferença circular
    let diferencaDireta = angulo1 - angulo2;
    let diferencaCircular = diferencaDireta > 0 ? 
        diferencaDireta - 360 : 
        diferencaDireta + 360;
    
    // Retorna a diferença de menor módulo
    return Math.abs(diferencaDireta) <= Math.abs(diferencaCircular) ? 
        diferencaDireta : 
        diferencaCircular;
}




async function getImageDimensions(filePath) {
    const metadata = await sharp(filePath).metadata()
    
    return {
        width: metadata.width,
        height: metadata.height
    }
}

function mylog(a){
    if (!doLog) return

    console.log(a)
}