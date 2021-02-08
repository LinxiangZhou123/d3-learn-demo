const path = require("path");
const fs = require("fs")
const data = require(path.resolve(__dirname, "./data/countrydata.json"))

const countryList = ["中国","俄罗斯","英国", "法国", "美国", "印度", "日本", "加拿大", "意大利"]
const timeLimit = ["20200301", "20200701"]
const arr = []
data.RECORDS.forEach(country => {
    if (countryList.indexOf(country.countryName) != -1) {
        arr.push({ country: country.countryName, number: country.confirmedCount, dateId: country.dateId })
    }
})

const obj = {}

arr.forEach(item => {
    if (obj[item.country]) {
        obj[item.country].push(item)
    } else {
        obj[item.country] = []
    }
})

Object.keys(obj).forEach(key => {
    const element = obj[key]
    const [min, max] = [element.findIndex((d) => d.dateId == timeLimit[0]), element.findIndex((d) => d.dateId == timeLimit[1])]
    obj[key] = element.slice(min, 120)
})
console.log(obj)

// const result = []

// Object.values(obj).forEach(value => result.push(value))
// fs.writeFileSync("./data/country.json", JSON.stringify(result))

// const time = result.map()