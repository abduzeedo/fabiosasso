window.onload = function(){
   getWindowHeight()
};
window.onresize = function(event) {
  getWindowHeight()  
}

function getWindowHeight(){
  counter = 0;
  let vh = window.innerHeight
  let vw = window.innerWidth
  if(vw > vh){
    document.documentElement.style.setProperty('--window-height', `${vh}px`);
  }
  if(vh <= 782){
    document.documentElement.style.setProperty('--window-height', `${vh - 1}px`);
  }
  document.getElementById("vh").innerText = `width: ${vw}px & height: ${vh - 1}px`

}