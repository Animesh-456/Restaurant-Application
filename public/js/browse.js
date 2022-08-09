document.onscroll = () =>{
    if(window.scrollY > 80){
        document.querySelector('.second-nav').classList.add('actual');
    }else{
        document.querySelector('.second-nav').classList.remove('actual');
    }
};
