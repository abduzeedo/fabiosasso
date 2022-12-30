window.onload = function(){
   getWindowHeight()
};
window.onresize = function(event) {
  getWindowHeight()  
}

function getWindowHeight(){
  let vh = window.innerHeight
  let vw = window.innerWidth
  document.documentElement.style.setProperty('--window-height', `${vh}px`);
  document.getElementById("vh").innerText = `width: ${vw}px & height: ${vh}px`
}