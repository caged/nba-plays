
export default function stream(el, data) {

  const surfaceWidth = 127
  const surfaceHeight = 230
  const scale = window.devicePixelRatio
  const randomX = d3.randomUniform(0, surfaceWidth)
  const randomY = d3.randomUniform(0, surfaceHeight)

  function rollup(plays) {
    const particleTypes = d3.map()
    const totals = plays.reduce((a, b) => {
      a.possg += Math.round(b.possg * 100 / 100.0)
      a.fgag += Math.round(b.fgag * 100 / 100.0)
      a.fgmg += Math.round(b.fgmg * 100 / 100.0)

      return a }, { possg: 0, fgag: 0, fgmg: 0 })

    totals.empty = totals.possg - totals.fgag

    plays.forEach(play => {
      const type = play.file.toLowerCase()
      particleTypes.set(type, Math.round(play.fgmg))
      particleTypes.set(type + "-miss", Math.round(play.fgag - play.fgmg))
    })

    let particles = []

    particleTypes.each((v, k) => {
      for (let i = 0; i < v; i++) {
        const rx = randomX()
        const ry = randomY()
        particles.push({
          x: rx,
          y: ry,
          l: Math.random(),
          xs: 0,
          ys: Math.random() * 4,
          type: k
        })
      }
    })

    return {
      totals: totals,
      plays: plays,
      particles: d3.shuffle(particles)
    }
  }

  // Rollup offensive stats only
  const offensive = data.filter(d => d.name == "Offensive")
  const teams  = d3.nest()
    .key(d => d.teamnameabbreviation.toLowerCase())
    .rollup(rollup)
    .entries(offensive)

  teams.sort((a, b) => d3.descending(a.value.totals.possg, b.value.totals.possg))

  console.log(teams);
  // Create a canvas surface to represent each team
  const containers = d3.select(el).selectAll(".surface")
    .data(teams)
  .enter().append("div")
    .attr("class", d => "surface team " + d.key.toLowerCase())

  const surfaces = containers.append("canvas")
    .attr("width", surfaceWidth * scale)
    .attr("height", surfaceHeight * scale)
    .style("width", surfaceWidth + "px")
    .style("height", surfaceHeight + "px")
    .each(function() {
      const ctx = this.getContext("2d")
      ctx.scale(scale, scale)
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    })

  containers.append("span")
    .attr("class", "team-name")
    .text(d => d.key)

  // Function to run on each animation tick
  const tick = function(d) {
    const ctx    = this.getContext("2d")
    const particles = d.value.particles
    const plen = particles.length
    let i = 0

    ctx.clearRect(0, 0, surfaceWidth, surfaceHeight)
    for (i; i < plen; i++) {
      const p = particles[i]
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys)
      ctx.stroke()

      p.x += p.xs
      p.y += p.ys

      if(p.x > surfaceWidth || p.y > surfaceHeight) {
        p.x = randomX()
        p.y = -5
      }
    }
  }


  // The timer
  const timer = d3.timer((elapsed) => {
    surfaces.each(function(d) {
      tick.call(this, d, elapsed)
    })

    if (elapsed > 10 * 10000) {
      timer.stop()
      console.log("Stopped!")
    }
  })

}
