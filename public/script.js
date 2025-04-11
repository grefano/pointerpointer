//const imgel = document.getElementById('imgpointer')
const imgobj = {x:0, y:0, dir:0}
const txt = document.getElementById('txtdebug')
const container = document.getElementsByClassName('imgbox')[0]

let img = -1
let imgsOrdered = []

async function getImg(){

    console.log('getimg')

    fetch('/api/img', {
        method: "POST",
        //body: 10
        //body: JSON.stringify({x:mousex, y:mousey})
        body: JSON.stringify({texto:'bosta request'}),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('response')
        console.log(data)
        loadImages(data.images)
        
        
    })
    .catch(error => console.log(error))
    

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

    const resultados = await Promise.all(images.map(async (imageData) => {
        
        
        return new Promise((resolve) => {
            const _imgobj = new Image();
            _imgobj.referrerPolicy = 'no-referrer';

            _imgobj.onload = () => {
                let _scalediff = getImageScaleDiff(_imgobj)
                console.log(`on load scalediff ${_scalediff}`)
                console.dir(_imgobj)
                resolve({scaleDiff: _scalediff, imgData: {src: _imgobj.src, width: _imgobj.width, height: _imgobj.height}, originalData: imageData})
            };
            _imgobj.onerror = () => resolve({originalData: imageData});
            _imgobj.src = imageData.url;
            console.log(`bruh`)
            console.dir(_imgobj)

        })
        //return {scaleDiff, img: imgProcessada, originalData: imageData}
    }))


    resultados.forEach(resultado => {
        if (resultado.scaleDiff){
            console.log(`imagem carregou. resultado: ${JSON.stringify(resultado)}`)
            imagePushOrdered(resultado)

        } else {
            console.log(`imagem não carregou. resultado: ${JSON.stringify(resultado)}`)
        }

    })

    console.log(`images ordered ${imgsOrdered}`)
    createImage(imgsOrdered[0])
    return imgsOrdered

}

function createImage(image){
    console.log('createimg')
    //console.log(image)

    // criando um elemento html com a imagem
    const el = document.createElement('img')
    el.src = image.imgData.src
    console.log(`el src ${image.imgData.src}`)

    el.className = 'imgpointer'
    container.appendChild(el)

    console.log('before setup zoom')
    setupZoom(image, el)
}

function setupZoom(imgObj, imgElement) {
    imgElement.addEventListener('mousedown', function(e) {
        let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

        console.log('setup zoom')
        console.log(imgElement)
        this.style.transformOrigin = `${imgObj.originalData.y}% ${imgObj.originalData.y}%`;
        this.style.transform = this.style.transform === 'scale(1)' ? 'scale(5)' : 'scale(1)';
    });
}


getImg()