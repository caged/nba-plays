import parallel from "./parallel.js"
import stream from "./stream.js"

function format(row) {
  for (let key of Object.keys(row)) {
    var val = row[key]
    if (!(/[a-z]/i).test(val)) {
      val = parseFloat(val)
      if(val % 1 !== 0) val = +val.toFixed(1)
      row[key] = val
    }
  }
  return row
}


d3.csv("data/plays.csv", format, (err, data) => {
  if(err) return console.log(err)
  // parallel(".js-parallel", data)
  stream(".js-stream", data)
})
