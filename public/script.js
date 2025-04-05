const img = document.getElementById('pointerimg')
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


async function getImg(){
    const response = await fetch('/api/img')
    const data = await response.blob()
    console.log(data)


    img.src=URL.createObjectURL(data)

    return data
}


getImg()
