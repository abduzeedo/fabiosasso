var imgs = []
var colors = []
var shadows = []
var curve = 'cubic-bezier(.25,.1,.39,1.4)'
var submenuOn = false

//  window.sr = ScrollReveal();
;(function ($) {
  Drupal.behaviors.myModuleBehavior = {
    attach: function (context, settings) {
    //   //  jQuery once ensures that code does not run after an AJAX or other function that calls Drupal.attachBehaviors().
    //   $('body')
    //     .once('abdz')
    //     .each(function () {
    //       // We have console.log() here to make it easy to see that this code is functioning. You should never use console.log() on production code!
    //       // if (typeof console.log === 'function') {
    //       //   console.log('My Setting: ' + settings.sampleLibrary.mySetting);
    //       // }
    //     })
    //   if (typeof console.log === 'function') {
    //     //console.log('This will run every time Drupal.attachBehaviors is run.');
    //   }
    //   $('body')
    //     .once('abdzModifyDOM')
    //     .each(function () {
    //       // Add an element to the body.
    //       //  $('body').append('<div class="example">Hello World</div>');
    //       //console.log('Modify DOM');
    //       // Tell Drupal that we modified the DOM.
    //       Drupal.attachBehaviors()
    //     })
      replaceImgs()
      changeTheme()
      //imgGallery()
      removeEmptyPs()
      gliteboxImgs()
      //$("#sidebar .content").height($(document).height())
      $(':root').css("--windowHeight", window.innerHeight + "px");
      console.log($(window).height())
      var sidebar_open = false
      $('header .close_menu').click(function(){
          if (sidebar_open == false){
            sidebar(0,"-100vw")
            $("body").addClass("fixed")
            $(".close_menu").addClass("closed")
            $(".cc-revoke").hide()
            gsap.to('.close_menu', { rotate: 360, duration: .3, ease: 'expo.out' })
            sidebar_open = true
          }
          else{
            sidebar("100vw",0)
            $("body").removeClass("fixed")
            $(".close_menu").removeClass("closed")
            $(".cc-revoke").show()
            gsap.to('.close_menu', { rotate: 0, duration: .3, ease: 'expo.out' })
            sidebar_open = false
          }
      })
    },
  }
  function sidebar(foo, boo,){
    gsap.to('#sidebar', {
        x: foo,
        duration: 1,
        ease: 'expo.out',
      })
      gsap.to('main', { x: boo, duration: 1, ease: 'expo.out' })
  }
  function removeEmptyPs() {
    $('.blog-content p').each(function () {
      var $p = $(this),
        txt = $p.html()
      if (txt == '&nbsp;') {
        $p.remove()
      }
    })
  }
  window.onscroll = function () {

  }
  function imgGallery() {
    if ($('.imgsGrid')) {
      $('.imgsGrid').photosetGrid({
        gutter: '4px',
        layout: '1212121212121212121212121212121212121212121212121212',
      })
    }
    if ($('.photoset-grid')) {
      $('.photoset-grid').photosetGrid({
        gutter: '4px',
      })
    }
  }
  function changeTheme() {
    var date = new Date()
    var hr = date.getHours()
    if (hr > 5 && hr < 19) {
      $('html').removeClass('night')
    }
    if (hr >= 19) {
      $('html').addClass('night')
    }
    if (hr >= 0 && hr <= 5) {
      $('html').addClass('night')
    }
  }

  function collectionsMenu() {
    $(
      '.menu-main li:nth-child(1) a , .mobile_menu li:nth-child(0) a',
    ).removeAttr('href')
    $('.menu-main li:nth-child(1) a , .mobile_menu li:nth-child(0) a').click(
      function () {
        if (submenuOn) {
          $('.submenu-collections').hide()
          setTimeout(function () {
            submenuOn = false
          }, 100)
        } else {
          //$("main .posts").hide()
          $('.submenu-collections').show()
          setTimeout(function () {
            submenuOn = true
          }, 100)
        }
      },
    )
  }
  function replaceImgs() {
    $(".path-frontpage article.post-item").each(function(i){
        //console.log("Test " + i)
        placeholder = $(this).find('div.hero_image a')
        img = $(this).find('div.hero_image picture img')
        imgSrc = img.prop('src')
        //imgs.push(imgSrc)
        backgroundImg = 'url(' + imgSrc + ') no-repeat center center'
        placeholder.css('background', backgroundImg)
        placeholder.css('background-size', 'cover')
    })
   }

   function gliteboxImgs(){
    $(".blog-post img").each(function(i){
     img = $(this)
     //img.removeAttr("alt")
     img.attr('data-type',"image")
     img.attr('data-description',"")
     img.addClass("glightbox")
    })
    const lightbox = GLightbox({
        touchNavigation: true,
        loop: true,
    });
  }


  document.addEventListener('keydown', function (event) {
    if (event.code == 'KeyN') {
      if ($('html').hasClass('night')) {
        cc = setTimeout(function () {
          $('html').removeClass('night')
          clearTimeout(cc)
        }, 100)
      } else {
        cc = setTimeout(function () {
          $('html').addClass('night')
          clearTimeout(cc)
        }, 100)
      }
    }
  })
})(jQuery)
