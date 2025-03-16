async function getData(req, res) {
    return res.send('<h1>Data get from get controller!</h1>')
}
async function getDynamic(req, res) {
 const {id} = req.params
 const {netId} = req.query
    return res.send(`<h1>Data get from get id ${id}, ${netId} controller!</h1>`)
}

async function postData(req, res) {
    return res.send('<h1>Data get from post controller!</h1>')
}

async function postDataGet(req, res) {
    const {name} = req.body
    return res.send(`<h1>Data get from post controller ${name}!</h1>`)
}

async function putData(req, res) {
    return res.send('<h1>Data get from put controller!</h1>')
}

async function deleteData(req, res) {
    return res.send('<h1>Data get from delete controller!</h1>')
}

module.exports = {
    getData, postData, putData, deleteData, postDataGet, getDynamic
}