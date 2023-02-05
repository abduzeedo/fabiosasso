var hr = (new Date()).getHours();
document.addEventListener("DOMContentLoaded", function(event) {
    sMobile = false;
    animateSite();
    changeTheme();
});

window.onresize = function(e) {
    //resizeTitle();
}

function changeTheme() {
	console.log(hr);
    if (hr > 9 && hr < 11) {
        document.getElementsByTagName("body")[0].classList.remove("night");
    }
    if (hr >= 19) {
        document.getElementsByTagName("body")[0].classList.add("night");
    }
    if (hr >= 0 && hr <= 5) {
        document.getElementsByTagName("body")[0].classList.add("night");
    }
}

function animateSite() {
    gsap.fromTo(".intro li",
        {
            y: window.innerHeight,
            opacity: 0
        },
        {
            y: 0,
            opacity: .5,
            duration:.3,
            stagger: { // wrap advanced options in an object
                each: 0.1,
                from: -30000,
                ease: "elastic.out(1, 0.5)",
                repeat: 0 // Repeats immediately, not waiting for the other staggered animations to finish
        }
    })

    gsap.fromTo(".intro li", {
        opacity: .5
    }, {
        opacity: 0,
        duration:.6,
        ease: "elastic.out(1, 0.5)",
        delay: 2.2,
        
    })

    gsap.fromTo(".cover_image",{
        opacity: 0
    }, {
        y: 0,
        opacity: 1,
        ease: "elastic.out(1, 0.5)",
        delay: 1,
        duration:0.2
    })


    gsap.fromTo("h2",{
        y: 66,
        opacity: 0
    }, {
        y: 0,
        opacity: 1,
        ease: "elastic.out(1, 0.5)",
        delay: 1.4,
        duration:0.6

    })
    gsap.fromTo("blockquote", {
        y: 66,
        opacity: 0
    }, {
        y: 0,
        opacity: 1,
        ease: "elastic.out(1, 0.5)",
        delay: 1.66,
        duration:  0.6
    })

    gsap.fromTo(".body",{
        y: 66,
        opacity: 0
    }, {
        y: 0,
        opacity: 1,
        ease: "elastic.out(1, 0.5)",
        delay: 1.6,
        duration:  0.6
    })


    gsap.fromTo(".bottom",{
        y: 66,
        opacity: 0
    }, {
        y: 0,
        opacity: 1,
        ease: "elastic.out(1, 0.5)",
        delay: 1.9,
        duration: 0.6
    })


    gsap.fromTo(".home li", {
        y: 33,
        opacity: 0
    }, {
        y: 0,
        opacity: 1,
        ease: "elastic.out(1, 0.5)",
        delay: 2,
        duration: 0.6,
        stagger:{
            each: 0.05,
        }
    }, 0.03)

    gsap.fromTo(".me",{
        y: 66,
        opacity: 0
    }, {
        y: 0,
        opacity: 1,
        ease: "elastic.out(1, 0.5)",
        delay: 1.2,
        duration:.8
    })
}
