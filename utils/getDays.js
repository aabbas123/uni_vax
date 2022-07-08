function getDays(date) {
    let ageInMilliseconds = new Date(date) - new Date();
    let days = Math.floor(ageInMilliseconds / 1000 / 60 / 60 / 24 );
    return days;
}

module.exports = getDays;