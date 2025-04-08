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
    .then(imagens => {
        console.log('response')
        chooseImages(imagens)
        
        
    })
    .catch(error => console.log(error))
    

    //return data
}


getImg()


function chooseImages(images) {
    imgsOrdered = []
    images.forEach(image => {
        img = new Image()
        img.src = image.url

        img.addEventListener('load', function(e){
            let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
            let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

            console.log('chooseimages')
            console.log(`w ${this.naturalWidth} h ${this.naturalHeight}`)
            let scaleW = vw/this.naturalWidth
            let scaleH = vh/this.naturalHeight
            let scaleDiff = Math.abs(scaleW-scaleH)

            let orderedIndex = imgsOrdered.length

            while(orderedIndex > 0 && imgsOrdered[orderedIndex-1].scaleDiff > scaleDiff){
                orderedIndex--
            }
            e.scaleDiff = scaleDiff
            e.x = image.x
            e.y = image.y
            e.dir = image.dir
            imgsOrdered.splice(orderedIndex, 0, e)
            console.log(`loaded ${JSON.stringify(e)}`)
            console.log(`ordered list ${imgsOrdered[0].x}`)
            
        })
        img.addEventListener('error', function(){
            console.log(`erro ao carregar ${image.url}`)
        })
        
        


    });
    console.log(`imgsOrdered ${imgsOrdered}`)
}

function createImage(image){
    console.log('createimg')
    console.log(image)
    
    console.log(`width ${image.naturalWidth}; height ${image.naturalHeight} file ${image.url}`)
    // passando info da imagem para o objeto
    imgobj.width = image.naturalWidth
    imgobj.height = image.naturalHeight
    imgobj.x = image.x/100
    imgobj.y = image.y/100
    imgobj.dir = image.dir
    
    // criando um elemento html com a imagem
    const el = document.createElement('img')
    el.src = image.url
    el.className = 'imgpointer'
    container.appendChild(el)

    setupZoom(el)
}

function setupZoom(imgElement) {
    imgElement.addEventListener('mousedown', function(e) {
        let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)


        const rect = this.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        const originX = (offsetX / rect.width) * 100;
        const originY = (offsetY / rect.height) * 100;


        
        this.style.transformOrigin = `${imgobj.x*100}% ${imgobj.y*100}%`;
        this.style.transform = this.style.transform === 'scale(1)' ? 'scale(5)' : 'scale(1)';
    });
}


