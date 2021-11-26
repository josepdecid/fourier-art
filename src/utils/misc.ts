export const arrLinspace = (startValue: number, stopValue: number, numElements: number): number[] => {
    var arr = [];
    var step = (stopValue - startValue) / (numElements - 1);
    for (var i = 0; i < numElements; i++) {
        arr.push(startValue + (step * i));
    }
    return arr;
}