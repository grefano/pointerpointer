const img = document.getElementById('imgpointer')
const txt = document.getElementById('txtdebug')
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
        const container = document.getElementsByClassName('imgbox')[0]
        console.log('response')
        imagens.forEach(image => {
            console.log(image.url)
            const el = document.createElement('img')
            el.src = image.url
            //img.src = image.url
            container.appendChild(el)
        });
    })
    .then(error => console.log(error))
    

    //return data
}




getImg()
