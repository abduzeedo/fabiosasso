var hr = new Date().getHours()
var navigationOn = true
var coverImages = [
  'abdz_home.png',
  'calmaria_front.png',
  'google_logo.png',
  'urbano_image.png',
]
document.addEventListener('DOMContentLoaded', function (event) {
  sMobile = false
  resizeHeight()
  navigation()
  hideNavigation()
  showNavigation()
  hideItem('.cover img')
  document.getElementsByClassName('logo')[0].onclick = function () {
    showNavigation()
  }
})
//
// Resize Window for Responsive Design
//
window.onresize = function (e) {
  resizeHeight()
  //resizeTitle();
}
//
// BackButton - Disable it
//
history.pushState(null, document.title, location.href)
window.addEventListener('popstate', function (event) {
  history.pushState(null, document.title, location.href)
  location.href = location.href + '?p=back'
  hideTitle()
  showNavigation()
})
//
// Navigation
//
function navigation() {
  // Titles
  mTitle = document.getElementsByTagName('h1')[0].getElementsByTagName('span')
  // Menus
  mMenu = document.getElementsByClassName('menu')[0].getElementsByTagName('li')
  // Loop
  for (i = 0; i < 4; i++) {
    // Add Attribute
    mMenu[i].setAttribute('index', i)
    // Add Class
    mTitle[1].classList.add = 't' + i
    // Loop
    mMenu[i].onclick = function (n) {
      v = this.getAttribute('index')
      //   hideTitle()
      hideNavigation()
      hideItem('h1 span')
      showTitle('.t' + v)
      showCover(v)
    }
  }
}
//
// Hide Navigation
//
function hideNavigation() {
  document.querySelectorAll('.menu li').forEach((item) => {
    item.style.opacity = 0
    item.style.display = 'none'
  })
}
//
// Show Navigation
//
function showNavigation() {
  // Hide titles
  hideItem('h1 span')
  // Hide cover image
  hideItem('.cover img')
  // Hide the cover parent with display none
  document.querySelectorAll('.cover').forEach((item) => {
    item.style.display = 'none'
  })
  // Show the LIs for the navigation with display block
  document.querySelectorAll('.menu li').forEach((item) => {
    item.style.display = 'block'
  })
  // Stagger Menu entrance
  gsap.fromTo(
    '.menu li',
    {
      x: -300,
      opacity: 0,
    },
    {
      x: 0,
      opacity: 1,
      ease: 'elastic.out(0.9, 1)',
      duration: 0.6,
      onComplete: function () {
        //
      },
      stagger: {
        // wrap advanced options in an object
        each: 0.1,
      },
    },
  )
}
//
// Animate titles
//
function showTitle(item) {
  gsap.fromTo(
    item,
    {
      opacity: 0,
      x: -150,
    },
    {
      x: 0,
      opacity: 1,
      ease: 'elastic.out(0.9, 1)',
      duration: 0.6,
    },
  )
}
//
// Hide Titles
// NOT USED
//
function hideTitle() {
  document.querySelectorAll('h1 span').forEach((item) => {
    item.style.opacity = 0
  })
}
//
// Hide Any Item * just use the tag/class/id
//
function hideItem(item) {
  gsap.to(item, {
    duration: 0,
    opacity: 0,
    onComplete: function () {
      //item.style.display = "none"
    },
  })
}
//
// Animate cover image
//
function showCover(item) {
  var cover = document.getElementsByClassName('cover')[0]
  // Show the parent that was display none;
  document.querySelectorAll('.cover').forEach((item) => {
    item.style.display = 'block'
  })
  // Load a new image
//   var image = document.images[0]
//   var downloadingImage = new Image()
//   downloadingImage.onload = function () {
//     image.src = this.src
//   }
  // Source of the new image coming from the array
  //downloadingImage.src = 'images/' + coverImages[item]
  cover.style.background = "url(images/" + coverImages[item] + ") center bottom"
  cover.style.backgroundSize = "cover"
  // GSAP animation for the image
  gsap.fromTo(
    '.cover',
    {
      opacity: 0,
    },
    {
      opacity: 1,
      // ease: 'elastic.out(0.9, 1)',
      delay: 0.2,
      duration: 1.2,
    },
  )
}
//
// Resize the Window Height
//
function resizeHeight() {
  var h =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight
  document.getElementsByClassName('home')[0].style.minHeight = h - 64 + 'px'
  document.getElementsByClassName('grid-body')[0].style.height = h + 'px'
}
//
// Change Theme
//
function changeTheme() {
  console.log(hr)
  if (hr > 9 && hr < 11) {
    document.getElementsByTagName('body')[0].classList.remove('night')
  }
  if (hr >= 19) {
    document.getElementsByTagName('body')[0].classList.add('night')
  }
  if (hr >= 0 && hr <= 5) {
    document.getElementsByTagName('body')[0].classList.add('night')
  }
}
