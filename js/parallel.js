export default function foo(target, data) {
  let el = d3.select(target)
  let ewidth = parseFloat(el.style("width"))
  let eheight = parseFloat(el.style("height"))

  let margin = { top: 20, right: 20, bottom: 20, left: 50 }
  let width = ewidth - margin.left - margin.right
  let height = eheight - margin.top - margin.bottom

  let splits = d3.nest()
    .key((d) => { return d.name })
    .key((d) => { return d.teamnameabbreviation })
    .entries(data)

  let frequencyMin = 0
  let frequencyMax = d3.max(data, (d) => { return d.time })

  let x = d3.scaleLinear()
    .domain([frequencyMin, frequencyMax])
    .range([height, 0])

  let vis = el.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

}
