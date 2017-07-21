//Document all the things
const fs = require("fs")
const gen = require("../lib")
const todo = []
const fix = {
  "zeronet-client": true,
  "zeronet-crypto": true,
  "zeronet-fileserver": true,
  "zeronet-swarm": true
}
const read = f => fs.readFileSync(f).toString().split("\n")
let add
if (process.env.ONLY)
  add = process.env.ONLY.split(",")
else
  add = fs.readdirSync(".")
  .filter(s => !!s.match(/^zeronet-[a-z]+$/))

add.map(s => todo.push([s, s + (fix[s] ? "/*.js" : "/lib/**/*.js"), s + "/README.md"]))

function next() {
  const i = todo.shift()
  if (!i) process.exit(console.log("DONE"))
  try {
    gen(i[0], i[1], {}, (err, res) => {
      if (err) {
        console.error("FAILED TO GENERATE DOCS FOR %s", i[0])
        console.error(err)
      } else {
        console.log("%s ok", i[0])
        let cut
        let r = read(i[2]).filter(l => {
          if (!cut)
            if (l == "# API") cut = true
          return !cut
        })
        fs.writeFileSync(i[2], new Buffer(r.concat(res.split("\n")).join("\n")))
      }
      next()
    })
  } catch (err) {
    console.error("FAILED TO GENERATE DOCS FOR %s", i[0])
    console.error(err)
    next()
  }
}

next()
