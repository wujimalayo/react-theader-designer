let flag = false
let timer = null
const debounce = (fn, wait) => {
    if(typeof(fn) !== 'function'){
        return console.error('debounce中传入了一个非函数参数');
    }
    
    if (!flag) {
        flag = true
        clearTimeout(timer)
        timer = setTimeout(() => {
            flag = false
        }, wait);
        return fn()
    }
}
export default debounce