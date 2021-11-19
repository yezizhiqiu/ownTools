var class2type = {};
var toString = class2type.toString; //=>Object.prototype.toString
var hasOwn = class2type.hasOwnProperty; //=>Object.prototype.hasOwnProperty
var fnToString = hasOwn.toString; //=>Function.prototype.toString
var ObjectFunctionString = fnToString.call(Object); //=>Object.toString() =>"function Object() { [native code] }"

"Boolean Number String Function Array Date RegExp Object Error Symbol".split(" ").forEach(function anonymous(item) {
    class2type["[object " + item + "]"] = item.toLowerCase();
});
console.log(class2type);

function toType(obj) {
    //=>obj may be null / undefined
    //=>return "null"/"undefined"
    if (obj == null) {
        return obj + "";
    }

    return typeof obj === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" :
        typeof obj;
}
// jQuery.type = toType;

//=>是否为函数
var isFunction = function isFunction(obj) {
    return typeof obj === "function" && typeof obj.nodeType !== "number";
};

//=>检测是否为window对象
// window.window===window
var isWindow = function isWindow(obj) {
    return obj != null && obj === obj.window;
};

//=>是否为纯粹的对象{}（数组和正则等都不是纯粹的对象）
var isPlainObject = function isPlainObject(obj) {
    var proto, Ctor;
    if (!obj || toString.call(obj) !== "[object Object]") {
        return false;
    }
    //=>getPrototypeOf获取当前对象的原型
    proto = Object.getPrototypeOf(obj);
    // Objects with no prototype (`Object.create( null )`)
    if (!proto) {
        return true;
    }
    // Objects with prototype are plain iff they were constructed by a global Object function
    Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
    return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
};

//=>是否为空对象
var isEmptyObject = function isEmptyObject(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
};

//=>是否为数组或者类数组
var isArrayLike = function isArrayLike(obj) {
    var length = !!obj && "length" in obj && obj.length,
        type = toType(obj);
    if (isFunction(obj) || isWindow(obj)) {
        return false;
    }
    return type === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
};