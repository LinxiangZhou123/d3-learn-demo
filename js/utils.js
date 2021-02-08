function add (a, b) {
    const result = math.add(a, b)
    return Number(math.format(result, {precision: 14}))
}

function sub(a, b) {
    const result = math.subtract(a, b)
    return Number(math.format(result, {precision: 14}))
}

function mul(a, b) {
    const result = math.multiply(a, b)
    return Number(math.format(result, {precision: 14}))
}

function divide(a, b) {
    const result = math.divide(a, b)
    return Number(math.format(result, {precision: 14}))
}