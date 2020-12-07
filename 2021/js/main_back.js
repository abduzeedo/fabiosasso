var hr = new Date().getHours()
var navigationOn = true
var distanceX = -100
var firstLoad = true
var coverImages = [
  'abdz_home.png',
  'calmaria_front.png',
  'google_logo.png',
  'urbano_image.png',
]
document.addEventListener('DOMContentLoaded', function (event) {
  sMobile = false
  resizeHeight()
  gsap.registerPlugin(ScrollTrigger)
  //   gsap.to(
  //     ".p1 h1 span",
  //     {
  //         scrollTrigger: {
  //             scroller: ".container",
  //             trigger: ".p1 h1 span",
  //             start: "top 30%",
  //             end: "top 20%",
  //             markers: true,
  //             toggleActions: "restart pause reverse restart",
  //           },
  //       x: 0,
  //       opacity: 1,
  //       duration: 0.6,
  //     },
  //   )

  gsap.utils.toArray('h1 span').forEach((panel, i) => {
    gsap.to(panel, {
      scrollTrigger: {
        scroller: '.container',
        trigger: panel,
        start: 'top center',
        end: 'top 10%',
        //markers: true,
        scrub: 1,
        toggleActions: 'restart none reverse none',
      },
      x: 0,
      opacity: 1,
      duration: 0.6,
    })
  })

  gsap.utils.toArray('.menu li').forEach((panel, i) => {
    gsap.to(panel, {
      scrollTrigger: {
        scroller: '.container',
        trigger: panel,
        start: 'top 40%',
        // end: "bottom 33%",
        markers: true,
        scrub: 0.6,
        toggleActions: 'restart none reverse none',
      },
      x: -300,
      opacity: 0,
      duration: 1,
    })
  })

  gsap.utils.toArray('.cover').forEach((panel, i) => {
    gsap.to(panel, {
      scrollTrigger: {
        scroller: '.container',
        trigger: panel,
        start: 'top bottom',
        end: 'top center',
        //markers: true,
        scrub: true,
        toggleActions: 'restart none reverse none',
      },
      y: 0,
      opacity: 1,
      duration: 1,
    })
  })

  gsap.utils.toArray('.copy').forEach((panel, i) => {
    gsap.to(panel, {
      scrollTrigger: {
        scroller: '.container',
        trigger: panel,
        start: 'top 60%',
        end: "top 32px",
        //markers: true,
        scrub: true,
        toggleActions: 'restart none reverse none',
      },
      y: 0,
      opacity: 1,
      duration: 1,
    })
  })
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
  //hideTitle()
  showNavigation()
})
//
// Resize the Window Height
//
function resizeHeight() {
  var h =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight
    document.getElementsByClassName('container')[0].style.height = h + 'px'
  document.getElementsByClassName('home')[0].style.height = h + 'px'
  document.getElementsByClassName('home')[1].style.height = h + 'px'
  document.getElementsByClassName('home')[2].style.height = h + 'px'
  document.getElementsByClassName('home')[3].style.height = h + 'px'
  document.getElementsByClassName('home')[4].style.height = h + 'px'
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
