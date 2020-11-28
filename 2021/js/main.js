var hr = new Date().getHours()
document.addEventListener('DOMContentLoaded', function (event) {
  sMobile = false
  resizeHeight()
  ///animateSite();
  //changeTheme();
  navigation()
  hideNavigation()
  showNavigation()
  hideItem(".cover img")
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
history.pushState(null, document.title, location.href);
window.addEventListener('popstate', function (event)
{
  history.pushState(null, document.title, location.href);
  hideTitle()
  showNavigation()
});
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
      hideTitle()
      hideNavigation()
      v = this.getAttribute('index')
      showTitle('.t' + v)
      showCover('.cover img.i' + v)
    }
  }
}
//
// Hide Navigation
//
function hideNavigation() {
  document.querySelectorAll('.menu li').forEach((item) => {
    item.style.opacity = 0
  })
}
//
// Show Navigation
//
function showNavigation() {
  // Hide titles
  hideItem("h1 span")
  // Hide cover image
  hideItem(".cover img")
  // Stagger Menu entrance
  gsap.fromTo(
    '.menu li',
    {
      x:-600,
      opacity: 0,
    },
    {
      x: 0,
      opacity: 1,
      ease: 'elastic.out(0.9, 1)',
      duration: 0.6,
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
        x: -600,
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
    document.querySelectorAll(item).forEach((item) => {
      item.style.opacity = 0
    })
  }
//
// Animate cover image
//
function showCover(item) {
    gsap.fromTo(
      item,
      {
       opacity: 0,
        y: 0
      },
      {
        y: 0,
        opacity: 1,
        // ease: 'elastic.out(0.9, 1)',
        delay:0.4,
        duration: 1.2
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
  document.getElementsByClassName('home')[0].style.height = h - 64 + 'px'
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
//
// Old Intro
//
function animateSite() {
  gsap.fromTo(
    '.intro li',
    {
      y: -2000,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 0.5,
      duration: 2,
      stagger: {
        // wrap advanced options in an object
        each: 0.1,
        from: -30000,
        ease: 'elastic.out(1, 0.5)',
        repeat: 0, // Repeats immediately, not waiting for the other staggered animations to finish
      },
    },
  )

  gsap.fromTo(
    '.intro li',
    {
      opacity: 0.5,
    },
    {
      opacity: 0,
      ease: 'elastic.out(1, 0.5)',
      delay: 2.2,
    },
  )

  gsap.fromTo(
    '.cover_image',
    {
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      ease: 'elastic.out(1, 0.5)',
      delay: 1,
      duration: 0.2,
    },
  )

  gsap.fromTo(
    'h2',
    {
      y: 66,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      ease: 'elastic.out(1, 0.5)',
      delay: 1.4,
      duration: 0.6,
    },
  )
  gsap.fromTo(
    'blockquote',
    {
      y: 66,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      ease: 'elastic.out(1, 0.5)',
      delay: 1.66,
      duration: 0.6,
    },
  )

  gsap.fromTo(
    '.body',
    {
      y: 66,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      ease: 'elastic.out(1, 0.5)',
      delay: 1.6,
      duration: 0.6,
    },
  )

  gsap.fromTo(
    '.bottom',
    {
      y: 66,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      ease: 'elastic.out(1, 0.5)',
      delay: 1.9,
      duration: 0.6,
    },
  )

  gsap.fromTo(
    '.home li',
    {
      y: 33,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      ease: 'elastic.out(1, 0.5)',
      delay: 2,
      duration: 0.6,
      stagger: {
        each: 0.05,
      },
    },
    0.03,
  )

  gsap.fromTo(
    '.me',
    {
      y: 66,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      ease: 'elastic.out(1, 0.5)',
      delay: 1.2,
      duration: 0.8,
    },
  )
}
