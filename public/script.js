//const imgel = document.getElementById('imgpointer')
const imgobj = {x:0, y:0, dir:0}
const txt = document.getElementById('txtdebug')
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
        /*
        .then(data => {
            console.log(data)
            loadImages(data.images)
            
            
        })
        .catch(error => console.log(error))
        */
    
    
    
    //return data
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

function imagePushOrdered(img){
    let orderedIndex = imgsOrdered.length
    while(orderedIndex > 0 && imgsOrdered[orderedIndex-1].scaleDiff > img.scaleDiff){
        orderedIndex--
    }
    imgsOrdered.splice(orderedIndex, 0, img)

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
    container.appendChild(el)

    console.log('before setup zoom')
    setupZoom(image, el)
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

function setupZoom(imgObj, imgElement) {
    return
    //imgElement.style.top = '5vh'
    imgElement.addEventListener('mousedown', function(e) {

        console.log(e.clientX)
        console.log('setup zoom')
        console.log(JSON.stringify(imgObj.originalData))
        this.style.transformOrigin = `${imgObj.x}% ${imgObj.y}%`;
        this.style.transform = this.style.transform === 'scale(1)' ? 'scale(2)' : 'scale(1)';

        //getImg({mousex: e.clientX, mousey: e.clientY})
    });
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
                imagePushOrdered(resultado)

            } else {
                console.log(`imagem não carregou. resultado: ${JSON.stringify(resultado)}`)
            }

        })
        let imgToCreate = imgsOrdered[0]
        txt.innerText = 'aqui'
        //console.log(`img to create ${imgToCreate.imageData}`)
        txt.style.left = `${imgToCreate.x/100 * imgToCreate.width * imgToCreate.scale }px`
        txt.style.top = `${imgToCreate.y/100 * imgToCreate.height * imgToCreate.scale }px`
        createImage(imgToCreate)
        positionImage(mousepos, imgToCreate)

    })

})