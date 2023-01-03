window.onload = function(){
   getWindowHeight()
};
window.onresize = function(event) {
  getWindowHeight()  
}

function getWindowHeight(){
  let vh = window.innerHeight
  let vw = window.innerWidth
  if(vh > 767){
    document.documentElement.style.setProperty('--window-height', `${vh}px`);
  }
  if(vh == 775){
    document.documentElement.style.setProperty('--window-height', `774px`);
  }
  document.getElementById("vh").innerText = `width: ${vw}px & height: ${vh}px`

}