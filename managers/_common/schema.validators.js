module.exports = {
    'username': (data)=>{
        if(data.trim().length < 3){
            return false;
        }
        return true;
    },
    school: require('../entities/school/school.validator'),
}