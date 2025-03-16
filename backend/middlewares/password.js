const bcrypt = require('bcrypt')

function passwordEncrypt(req,res, next){
    
    bcrypt.hash(req?.body?.password, 10, function(err, hash) {
        try {
            // next()
            return hash
        } catch (error) {
            return error
        }
    });
}

function passwordDecrypt(req,res,next){
    bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
        if(result){
            return result
        }else{
            false
        }
    });
}

module.exports ={
    passwordEncrypt, passwordDecrypt
}
