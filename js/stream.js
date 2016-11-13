
export default function stream(el, data) {

  const surfaceWidth = 164
  const surfaceHeight = 160
  const scale = window.devicePixelRatio
  const randomX = d3.randomUniform(0, surfaceWidth)
  const randomY = d3.randomUniform(0, surfaceHeight)

  function rollup(plays) {
    const totals = plays.reduce((a, b) => {
      a.possg += Math.round(b.possg * 100 / 100.0)
      a.fgag += Math.round(b.fgag * 100 / 100.0)
      return a }, { possg: 0, fgag: 0 })

    totals.empty = totals.possg - totals.fgag

    let particles = []
    for (var i = 0; i < totals.possg; i++) {
      particles.push({
        x: randomX(),
        y: randomY(),
        type: "poss"
      })
    }

    return {
      totals: totals,
      plays: plays,
      particles: particles
    }
  }

  // Rollup offensive stats only
  const offensive = data.filter(d => d.name == "Offensive")
  const teams  = d3.nest()
    .key(d => d.teamnameabbreviation.toLowerCase())
    .rollup(rollup)
    .entries(offensive)

  // Create a canvas surface to represent each team
  const surfaces = d3.select(el).selectAll(".surface")
    .data(teams)
  .enter().append("div")
    .attr("class", d => "surface team " + d.key.toLowerCase())
  .append("canvas")
    .attr("width", surfaceWidth * scale)
    .attr("height", surfaceHeight * scale)
    .style("width", surfaceWidth + "px")
    .style("height", surfaceHeight + "px")
    .each(function() { this.getContext("2d").scale(scale, scale) })

  // Function to run on each animation tick
  const tick = function(d, elapsed) {
    const ctx    = this.getContext("2d")
    const particles = d.value.particles

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.clearRect(0, 0, surfaceWidth, surfaceHeight)
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      ctx.beginPath()

      if((p.y += 0.8) > surfaceHeight) {
          p.y = 0
      }

      ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI)
      ctx.fill()
    }

    ctx.fill()
  }


  // The timer
  const timer = d3.timer((elapsed) => {
    surfaces.each(function(d) {
      tick.call(this, d, elapsed)
    })

    if (elapsed > 20000) {
      timer.stop()
      console.log("Stopped!")
    }
  })

}
