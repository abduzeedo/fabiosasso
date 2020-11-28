var hr = new Date().getHours()
document.addEventListener('DOMContentLoaded', function (event) {
  sMobile = false
  resizeHeight()
  ///animateSite();
  //changeTheme();
  navigation()
  document.getElementsByClassName('logo')[0].onclick = function () {
    showNavigation()
  }
})

window.onresize = function (e) {
  resizeHeight()
  //resizeTitle();
}
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
      animateTitle('.t' + v)
    }
  }
}
function animateTitle(item) {
  gsap.fromTo(
    item,
    {
      opacity: 0,
      x: -300,
    },
    {
      x: 0,
      opacity: 1,
      ease: 'elastic.out(0.9, 0.85)',
      duration: 0.6,
    },
  )
}
function hideNavigation() {
  document.querySelectorAll('.menu li').forEach((item) => {
    item.style.opacity = 0
  })
}
function showNavigation() {
  // Hide titles
  hideTitle()
  // Stagger Menu entrance
  gsap.fromTo(
    '.menu li',
    {
      x:-1000,
      opacity: 0,
    },
    {
      x: 0,
      opacity: 1,
      ease: 'elastic.out(0.9, 0.85)',
      duration: 0.6,
      stagger: {
        // wrap advanced options in an object
        each: 0.1,
        
      },
    },
  )
}
function hideTitle() {
  document.querySelectorAll('h1 span').forEach((item) => {
    item.style.opacity = 0
  })
}
function resizeHeight() {
  var h =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight
  document.getElementsByClassName('home')[0].style.height = h - 64 + 'px'
  document.getElementsByClassName('grid-body')[0].style.height = h + 'px'
}

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
