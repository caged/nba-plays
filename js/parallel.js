export default function foo(target, data) {
  let el = d3.select(target)
  let ewidth = parseFloat(el.style("width"))
  let eheight = parseFloat(el.style("height"))

  let margin = { top: 40, right: 20, bottom: 30, left: 30 }
  let width = ewidth - margin.left - margin.right
  let height = eheight - margin.top - margin.bottom

  let stat = "time"

  let splits = d3.nest()
    .key((d) => { return d.name })
    .key((d) => { return d.teamnameabbreviation })
    .rollup((types) => {
      let obj = {}
      types.forEach((t) => { obj[t.file] = t[stat] })
      return obj
    }).entries(data)

  let categories = ["Offensive", "Defensive"]
  let playTypes = [
    "Isolation", "Cut", "Handoff", "OffRebound", "OffScreen", "PRRollman",
    "PRBallHandler", "Spotup", "Transition", "Postup", "Misc"]

  let frequencyMin = 0
  let frequencyMax = d3.max(data, (d) => { return d[stat] })

  let xgrid = d3.scaleBand()
    .domain(categories)
    .rangeRound([0, width])

  let gmargin = { top: 20, right: 0, bottom: 0, left: 60 }
  let gwidth = xgrid.bandwidth() - gmargin.right - gmargin.left

  let x = d3.scalePoint()
    .domain(playTypes)
    .rangeRound([0, gwidth])

  let y = d3.scaleLinear()
    .domain([frequencyMin, frequencyMax])
    .range([height, 0])

  let xax = d3.axisTop(x)
  let yax = d3.axisLeft(y)

  let line = d3.line()
    .x((v) => { return x(v[0]) })
    .y((v) => { return y(v[1]) })

  let vis = el.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  let offdef = vis.selectAll(".category")
    .data(categories)
  .enter().append("g")
    .attr("class", (d) => { return "category " + d })
    .attr("transform", (d) => { return "translate(" + xgrid(d) + "," + gmargin.top + ")" })

  offdef.append("text")
    .attr("class", "title")
    .attr("x", 30)
    .attr("y", -30)
    .text(String)

  offdef.selectAll(".teams")
    .data((d, i) => { return splits[i].values })
  .enter().append("path")
    .attr("class", (d) => { return "path " + d.key })
    .attr("d", (d) => {
      let pvals = playTypes.map((t) => { return [t, d.value[t]] })
      return line(pvals)
    })

  offdef.call(xax)
    .selectAll(".tick")
    .attr("class", "x tick")

  let types = offdef.selectAll(".type")
    .data(playTypes)
  .enter().append("g")
    .attr("class", (d, i) => { return "axis axis-" + i })
    .attr("transform", (d) => { return "translate(" + x(d) + ", 0)" })
    .call(yax)

}
