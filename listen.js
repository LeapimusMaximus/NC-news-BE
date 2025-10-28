const app = require('./app')
const port = 8000
let sfxMsg = ""
if (port<9000){
  sfxMsg = "It's not over 9000!"
}
else {
    sfxMsg = "It's over 9000!"
}

app.listen(port, () => {console.log(`Server is listening on port ${port}\n${sfxMsg}`)})