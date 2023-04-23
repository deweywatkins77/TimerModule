const { performance } = require('perf_hooks')
const lodash = require('lodash')

function funcTimer(...args){
    function avgTime(func, iterations, arr){
        newArr = lodash.cloneDeep(arr)
        let result
        let time = []
        let t1
        let t2
        for (let i=0; i<iterations; i++){
            if (newArr.length == 1){
                t1 = performance.now()
                result = func(newArr[0])
                t2 = performance.now()
                time.unshift(t2-t1)
            }else{
                t1 = performance.now()
                result = func(...newArr)
                t2 = performance.now()
                time.unshift(t2-t1)
            }
        }
        return [time.reduce((total, current)=>total+current) / time.length, result]
    }

    let funcTimes = []
    let funcResults = []
    let fastestFunc
    let data = {}
    let timedObj = {}
    timedObj.funcArray = []

    // extract all the functions, they have to be first in the arguments list
    for (let i=0; i<args.length; i++){
        if (typeof args[i] == 'function'){
            timedObj.funcArray.push(args[i])
        }else{
            break;
        }
    }

    //remove the functions from the arguments array and extract the number of iterations
    args.splice(0,timedObj.funcArray.length)
    if (typeof args[0] == "number") timedObj.iterations = args.shift()
    

    //Return error if no functions were first argument or iteration integer was not found
    if (timedObj.funcArray.length == 0 || !timedObj.iterations || timedObj.iterations < 1 ){
        data.error="No function or iteration number detected. Make sure at least one function is first in the arguments, and an interger is the argument right after the last function."
        return data
    } 

    //assign rest of params so they can be passed to the timer avgTime function
    timedObj.params = args

    // loop through functions and get average times for number of times equal to the iteration integer
    for (let i=0; i<timedObj.funcArray.length; i++){
        let results = avgTime(timedObj.funcArray[i],timedObj.iterations,timedObj.params)
        funcTimes[i] = results[0]
        funcResults[i] = results[1]
    }


    //format data to return each function(s) average time, results and find fastest function
    fastestFunc = funcTimes[0]
    for (let i=0; i<funcTimes.length; i++){
        let functionKey = `function${i+1}Average`
        let functionResults = `function${i+1}Results`
        data[functionResults] = funcResults[i]
        data[functionKey] = funcTimes[i]
        if (funcTimes[i] < fastestFunc) fastestFunc = funcTimes[i]
    }

    //determine fastest function
    data.fastest = (funcTimes.indexOf(fastestFunc)+1)

    return data
}

module.exports = funcTimer