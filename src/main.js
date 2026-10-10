import Lenis from 'lenis'

const lenis = new Lenis({
  duration: 1.2,   // scroll animation length (s)
  smoothWheel: true,
  anchors: true,   // smooth-scroll to #hash links
})

// Parallax: run on every scroll update
const parallax = document.querySelector('[data-parallax]')
lenis.on('scroll', ({ scroll }) => {
  parallax.style.transform = `translateY(${scroll * 0.1}px)`
})

// Drive Lenis from requestAnimationFrame
function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
