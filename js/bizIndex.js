let brain = "lt", range = 0.2, startTime = 0, endTime = 5, timeLimit, rate = 1, timeStep = 0.2, isOverlay = false, initRange = 0.2;

let defaultParams = {
    subjectId: "1",
    megFileId: "11",
    partOfBrain: brain,
    segStart: startTime,
    segEnd: endTime,
    interval:"6858"
}

const map = new ChannelMap([], "#channels", { onDragEnd: dragEnd })

function dragEnd(start, end) {
    defaultParams.segStart = start;
    defaultParams.segEnd = end
    request(defaultParams)
}

function selectBrain(evt) {
    defaultParams.partOfBrain = evt.value
    request(defaultParams)
}

function setStart(evt) {
    startTime = Number(evt.value);
}

function setEnd(evt) {
    endTime = Number(evt.value);
}

function setRange(evt) {
    if (Number(evt.value) > 10 || Number(evt.value) > sub(endTime, startTime)) {
        alert("跨度设置错误")
        return;
    }
    initRange = Number(evt.value);
    range = Number(evt.value);
}

function updateMap() {
    if (startTime >= endTime || startTime < 0 || endTime < 0) {
        alert("参数输入错误")
        return;
    }
    if (sub(endTime, startTime) < range) {
        range = sub(endTime, startTime)
        document.getElementById("range").value = range
    }
    if (startTime < timeLimit[0] || endTime > timeLimit[1]) {
        defaultParams.segStart = startTime
        defaultParams.segEnd = endTime
        request(defaultParams)
    } else {
        map.updateMap([startTime, endTime], range, rate, isOverlay)
    }
}

function narrowRate() {
    if (rate <= 0.1) {
        alert("已经最小")
        return
    }
    rate = (rate * 10 - 2) / 10
    map.updateMap([startTime, endTime], range, rate, isOverlay)
}

function enlargRate() {
    if (rate >= 5){
        alert("已经最大")
        return
    }
    rate = (rate * 10 + 2) / 10
    map.updateMap([startTime, endTime], range, rate, isOverlay)
}

function resetRate() {
    rate = 1
    d3.select("#draw_space").attr("transform", `translate(0, 0)`)
    map.updateMap([startTime, endTime], range, rate, isOverlay)
}

function setTimeStep(evt) {
    if (Number(evt.value) > sub(endTime, startTime)) {
        alert("步频设置错误")
        document.getElementById("setStep").value = timeStep
        return;
    }
    timeStep = Number(evt.value)
}

let timer, isPlay = false, status = "free";
function forward() {

    if (status === "pending") return;

    startTime = add(startTime, timeStep)
    
    if (sub(endTime, startTime) <= range && sub(endTime, startTime) != 0) {
        range = sub(endTime, startTime)
        document.getElementById("range").value = range
    }
    
    if (startTime >= timeLimit[1]) {
        status = "pending"
        range = initRange;
        document.getElementById("range").value = range;
        defaultParams.segStart = startTime;
        defaultParams.segEnd = add(endTime, 5);
        request(defaultParams)
    } else {
        map.updateMap([startTime, endTime], range, rate, isOverlay)
    }
    
    document.getElementById("start").value = startTime
}

function backOff() {
    if (startTime >= endTime || startTime < 0 || endTime < 0) {
        alert("参数输入错误")
        return;
    }
    if (startTime == 0) {
        return;
    }
    startTime = sub(startTime, timeStep)
    
    if (startTime < timeLimit[0]) {
        defaultParams.segStart = sub(timeLimit[0], 5)
        defaultParams.segEnd = sub(timeLimit[1], 5)
        request(defaultParams)
        startTime = sub(timeLimit[0], 5)
    } else {
        map.updateMap([startTime, endTime], range, rate, isOverlay)
    }
    document.getElementById("start").value = startTime
}


function autoplay() {
    if (startTime >= endTime || startTime < 0 || endTime < 0) {
        alert("参数输入错误")
        return;
    }
    const btn = document.getElementById("player")
    if (isPlay || add(startTime, range) >= timeLimit[1]) {
        btn.innerHTML = "播放";
        isPlay = false;
        clearInterval(timer)
    } else {
        btn.innerHTML = "停止";
        isPlay = true;
        timer = setInterval(forward, 1000);
    }
}

function overlay() {
    isOverlay = !isOverlay
    document.getElementById("overlay_btn").innerHTML = isOverlay ? "重置" : "叠加"
    map.updateMap([startTime, endTime], range, rate, isOverlay)
}

function filter() {
    const filter = defaultParams.filter;
    let filterbtn = document.getElementById("filter");
    if (filter == "1") {
        defaultParams.filter = ""
        filterbtn.innerHTML = "滤波"
        document.getElementById("trap").disabled = false
    } else {
        defaultParams.filter = "1"
        filterbtn.innerHTML = "重置"
        document.getElementById("trap").disabled = true
    }
    request(defaultParams)
}

function trap() {
    const nortchFilter = defaultParams.nortchFilter;
    let trapbtn = document.getElementById("trap");
    if (nortchFilter =="1") {
        defaultParams.nortchFilter = ""
        trapbtn.innerHTML = "陷波"
        document.getElementById("filter").disabled = false
    } else {
        defaultParams.nortchFilter = "1"
        trapbtn.innerHTML = "重置"
        document.getElementById("filter").disabled = true
    }
    request(defaultParams)
}

function request(params) {
    fetch("http://127.0.0.1:8081/megmap.json")
    .then(res => res.json())
    .then(data => {
        let length = data.subData.time.length;
        timeLimit = [data.subData.time[0], data.subData.time[length - 1]];
        startTime = timeLimit[0];
        endTime = timeLimit[1]
        document.getElementById("start").value = timeLimit[0]
        document.getElementById("end").value = timeLimit[1]
        map.setData(data).updateMap([startTime, endTime], range, rate, isOverlay)
        status = "free"
        document.getElementById("file_detail").innerHTML = `时长：${data.message.duration}S 采样频率：${data.message.sfreq}Hz 文件大小：${data.message.fileSize}Mb`
    })
}

window.addEventListener("load", function () {
    request(defaultParams)
})