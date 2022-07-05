function getage(dob) {
    let ageInMilliseconds = new Date() - new Date(dob);
    let age = Math.floor(ageInMilliseconds / 1000 / 60 / 60 / 24 / 365);
    return age;
}

module.exports = getage;