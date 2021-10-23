const isType = (type, val) => !!(val.constructor 
        && val.constructor.name.toLowerCase() 
        === type.toLowerCase());


const isArray = function(a) {
    return (!!a) && (a.constructor === Array);
};

const isObject = function(a) {
    return (!!a) && (a.constructor === Object);
};

module.exports = {
    isType,
    isArray,
    isObject
};