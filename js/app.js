/*global d3:true*/

function format(row) {
  for (let key of Object.keys(row)) {
    var val = row[key]
    if (!(/[a-z]/i).test(val)) {
      val = parseFloat(val)
      if(val % 1 !== 0) {
        val = +val.toFixed(1)
      }
      row[key] = val
    }
  }
  return row
}

d3.csv("data/types.csv", format, function() {
  console.log(arguments)
})
