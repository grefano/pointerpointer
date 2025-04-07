const img = document.getElementById('imgpointer')
const txt = document.getElementById('txtdebug')
const container = document.getElementsByClassName('imgbox')[0]

// img.src = data.imageUrl

/*
fetch('/api/img', {
    body: blob()
})
.then(response => response.blob())
.then((myBlob) => {
    const url = URL.createObjectURL(myBlob)
    img.src = url
});
*/
var mousex = 0
var mousey = 0 

window.addEventListener('mousemove', function(e){
    //console.log(`x: ${e.x} y: ${e.y}`)
    mousex = e.x
    mousey = e.y
    
    //console.log('uai')
    
})


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

        imagens.forEach(image => {
            console.log(image.url)
            const el = document.createElement('img')
            el.src = image.url
            el.className = 'imgpointer'
            setupZoom(el)
            
            //img.src = image.url
            container.appendChild(el)
        });
    })
    .catch(error => console.log(error))
    

    //return data
}




getImg()



// zoom do deepseek

// Exemplo: Zoom em uma coordenada específica (x: 200px, y: 150px)
function aplicarZoom(x, y, escala = 2) {
    const rect = container.getBoundingClientRect();
    const offsetX = x - rect.left;
    const offsetY = y - rect.top;

  // Calcula a posição do transform-origin
    const originX = (offsetX / rect.width) * 100;
    const originY = (offsetY / rect.height) * 100;

    const image = document.getElementsByClassName('imgpointer')[0]
    image.style.transform = 'none'
    image.style.transformOrigin = `${originX}% ${originY}%`;
    image.style.transform = `scale(${escala})`;

}

// Chamada de exemplo (zoom no clique)


/*
document.getElementsByClassName('imgpointer')[0].addEventListener('mousedown', function() {
    this.style.transformOrigin = '50% 50%';
    this.style.transform = 'scale(2)';
});
*/


function setupZoom(imgElement) {
    imgElement.addEventListener('mousedown', function(e) {
        const rect = this.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        const originX = (offsetX / rect.width) * 100;
        const originY = (offsetY / rect.height) * 100;

        this.style.transformOrigin = `${originX}% ${originY}%`;
        this.style.transform = this.style.transform === 'scale(2)' ? 'scale(1)' : 'scale(2)';
    });
}


