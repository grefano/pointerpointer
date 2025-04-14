//const imgel = document.getElementById('imgpointer')
const imgobj = {x:0, y:0, dir:0}
//const txt = document.getElementById('txtdebug')
const container = document.getElementsByClassName('imgbox')[0]

let img = -1
let imgsOrdered = []

async function getImg(mousepos, screen){

        console.log('getimg')
        console.log(`mousepos ${JSON.stringify(mousepos)}`)
        try {
            const response = await fetch('/api/img', {
                method: "POST",
                body: JSON.stringify({mousepos, screen}),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (!response.ok) {
                throw new Error(`Reponse Error ${response.status}`)
            }
            console.log(`response`)
            console.dir(response)
            console.dir(response.images)
            
            const data = await response.json()
            return data
        } catch(error){
            console.error('Error: ', error)
            throw error
        }

}

function getImageScaleDiff(img){
    console.log('get image scale diff')

    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

    console.log(`w ${img.naturalWidth} h ${img.naturalHeight}`)
    let scaleW = vw/img.naturalWidth
    let scaleH = vh/img.naturalHeight
    let scaleDiff = Math.abs(scaleW-scaleH)

    return scaleDiff
}


async function loadImages(images) {
    imgsOrdered = []

    return await Promise.all(images.map(async (imageData) => {
        
        
        return new Promise((resolve) => {
            const _imgobj = new Image();
            _imgobj.referrerPolicy = 'no-referrer';

            _imgobj.onload = () => {
                let _scalediff = getImageScaleDiff(_imgobj)
                console.log(`on load scalediff ${_scalediff}`)
                console.dir(_imgobj)
                resolve({scaleDiff: _scalediff, src: _imgobj.src, width: _imgobj.width, height: _imgobj.height, ...imageData})
            };
            _imgobj.onerror = () => resolve({originalData: imageData});
            _imgobj.src = imageData.url;
            console.log(`bruh`)
            console.dir(_imgobj)

        })
        //return {scaleDiff, img: imgProcessada, originalData: imageData}
    }))


}

function createImage(image){
    console.log('createimg')
    //console.log(image)

    // criando um elemento html com a imagem
    const el = document.createElement('img')
    el.src = image.src
    console.log(`el src ${image.src}`)

    el.className = 'imgpointer'
    //el.style.left = `${imgToCreate.x/100 * imgToCreate.width * imgToCreate.scale }px`
    //el.style.top = `${imgToCreate.y/100 * imgToCreate.height * imgToCreate.scale }px`
    container.appendChild(el)

    console.log(`dist ${image.distMouseThumb}`)
    //setupZoom(image, el)
}

function positionImage(mousepos, img){
    const el = document.getElementsByClassName('imgbox')[0]
    let left = mousepos.mousex - imgsOrdered[0].x*imgsOrdered[0].width/100
    let top = mousepos.mousey - imgsOrdered[0].y*imgsOrdered[0].height/100
    console.log(`position image element`)
    console.dir(el)
    //el.style.left = left+'px'
    //el.style.top = top+'px'
    
    const imgel = document.getElementsByClassName('imgpointer')[0]
    console.log(`scale img html ${JSON.stringify(img)}`);
    //imgel.addEventListener('mousedown', function(e){
        console.log('evento iradooooo')
        imgel.style.transformOrigin = `${0}% ${0}%`;
        imgel.style.transform = 'translate(0, 0) scale(' + img.scale + ')'  
        imgel.style.left = img.posOffset.x+'px'
        imgel.style.top = img.posOffset.y+'px'
        void imgel.offsetWidth;
    //})
    
}

container.addEventListener('mousedown', function(e){
    if (imgsOrdered.length > 0) return;

    let mousepos = {x: e.clientX, y: e.clientY}

    let screen = {
        width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
        height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    }
    
    getImg(mousepos, screen)
    .then(response => {
        console.log(`resposta do getimg ${JSON.stringify(response)}`)
        return loadImages(response.images)
    })
    .then(resultados => {
        console.log(`resultados ${resultados}`)
        
        resultados.forEach(resultado => {
            if (resultado.scaleDiff){
                console.log(`imagem carregou. resultado: ${JSON.stringify(resultado)}`)
                imgsOrdered.push(resultado)
            } else {
                console.log(`imagem não carregou. resultado: ${JSON.stringify(resultado)}`)
            }

        })
        imgsOrdered.forEach(function(val, index){
            console.log(`dist ${val.distMouseThumb}`)
        })
        let imgToCreate = imgsOrdered[0]
        //txt.innerText = 'aqui'
        //console.log(`img to create ${imgToCreate.imageData}`)
        //txt.style.left = `${imgToCreate.x/100 * imgToCreate.width * imgToCreate.scale }px`
        //txt.style.top = `${imgToCreate.y/100 * imgToCreate.height * imgToCreate.scale }px`
        createImage(imgToCreate)
        positionImage(mousepos, imgToCreate)

    })

})