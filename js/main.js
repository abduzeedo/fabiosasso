var hr = (new Date()).getHours();
document.addEventListener("DOMContentLoaded", function(event) {
    sMobile = false;
    animateSite();
    changeTheme();
});

window.onresize = function(e) {
    getWindowHeight()  
}

window.onload = function(){
    getWindowHeight()
 };
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

function animateSite() {
    var quote = document.querySelector("blockquote");
    var quoteWords = splitWords(quote);
    if (!quoteWords.length && quote) {
        quoteWords = Array.prototype.slice.call(quote.querySelectorAll(".split-word"));
    }
    if (quote) {
        gsap.set(quote, { opacity: 1 });
    }

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
    if (quoteWords.length) {
        gsap.fromTo(quoteWords, {
            y: 24,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            ease: "power3.out",
            delay: 1.55,
            duration: 0.7,
            stagger: 0.04
        })
    } else {
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
    }

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

function splitWords(element) {
    if (!element) {
        return [];
    }

    if (element.getAttribute("data-split") === "words") {
        return Array.prototype.slice.call(element.querySelectorAll(".split-word"));
    }

    element.setAttribute("data-split", "words");
    var words = [];
    var walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [];
    var node;

    while ((node = walker.nextNode())) {
        nodes.push(node);
    }

    nodes.forEach(function(textNode) {
        var value = textNode.nodeValue;
        if (!value) {
            return;
        }

        var parts = value.match(/\\S+\\s*/g);
        if (!parts) {
            return;
        }

        var fragment = document.createDocumentFragment();
        parts.forEach(function(part) {
            var span = document.createElement("span");
            span.className = "split-word";
            span.textContent = part;
            fragment.appendChild(span);
            words.push(span);
        });

        textNode.parentNode.replaceChild(fragment, textNode);
    });

    return words;
}
