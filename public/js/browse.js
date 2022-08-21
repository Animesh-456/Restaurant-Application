document.onscroll = () => {
    if (window.scrollY > 80) {
        document.querySelector('.second-nav').classList.add('actual');
    } else {
        document.querySelector('.second-nav').classList.remove('actual');
    }
};


const allbtn = document.getElementById('allBtn')
const breadBtn = document.getElementById('breadBtn')
const noodlesBtn = document.getElementById('noodlesBtn')
const riceBtn = document.getElementById('riceBtn')

const allDiv = document.getElementById('all')
const breadDiv = document.getElementById('bread')
const noodleDiv = document.getElementById('noodle')
const riceDiv = document.getElementById('rice')

allbtn.onclick = () => {
    if (breadDiv.style.display == 'block' || noodleDiv.style.display == 'block' || riceDiv.style.display == 'block') {
        breadDiv.style.display = 'none'
        riceDiv.style.display = 'none'
        noodleDiv.style.display = 'none'

        allbtn.classList.add('active')
        breadBtn.classList.remove('active')
        noodlesBtn.classList.remove('active')
        riceBtn.classList.remove('active')

        allDiv.style.display = 'block'
    }
}

breadBtn.onclick = () => {
    if (breadDiv.style.display == 'none') {
        allDiv.style.display = 'none'
        noodleDiv.style.display = 'none'
        riceDiv.style.display = 'none'

        allbtn.classList.remove('active')
        breadBtn.classList.add('active')
        noodlesBtn.classList.remove('active')
        riceBtn.classList.remove('active')

        breadDiv.style.display = 'block'
    } else {
        allDiv.style.display = 'block'
        noodleDiv.style.display = 'none'
        riceDiv.style.display = 'none'

        allbtn.classList.add('active')
        breadBtn.classList.remove('active')
        noodlesBtn.classList.remove('active')
        riceBtn.classList.remove('active')

        breadDiv.style.display = 'none'
    }
}


noodlesBtn.onclick = () => {
    if (noodleDiv.style.display == 'none') {
        allDiv.style.display = 'none'
        breadDiv.style.display = 'none'
        riceDiv.style.display = 'none'

        allbtn.classList.remove('active')
        breadBtn.classList.remove('active')
        noodlesBtn.classList.add('active')
        riceBtn.classList.remove('active')

        noodleDiv.style.display = 'block'
    } else {
        allDiv.style.display = 'block'
        breadDiv.style.display = 'none'
        riceDiv.style.display = 'none'

        allbtn.classList.add('active')
        breadBtn.classList.remove('active')
        noodlesBtn.classList.remove('active')
        riceBtn.classList.remove('active')

        noodleDiv.style.display = 'none'
    }
}

riceBtn.onclick = () => {
    if (riceDiv.style.display == 'none') {
        allDiv.style.display = 'none'
        breadDiv.style.display = 'none'
        noodleDiv.style.display = 'none'

        allbtn.classList.remove('active')
        breadBtn.classList.remove('active')
        noodlesBtn.classList.remove('active')
        riceBtn.classList.add('active')

        riceDiv.style.display = 'block'
    } else {
        allDiv.style.display = 'block'
        breadDiv.style.display = 'none'
        noodleDiv.style.display = 'none'


        allbtn.classList.add('active')
        breadBtn.classList.remove('active')
        noodlesBtn.classList.remove('active')
        riceBtn.classList.remove('active')

        riceDiv.style.display = 'none'
    }
}