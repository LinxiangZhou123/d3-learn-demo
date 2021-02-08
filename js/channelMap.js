
function ChannelMap(data, container, option) {
    this.container = d3.select(container);
    this.scaleX;
    this.scaleY;
    this.scaleG;
    this.data = data;
    this.isOverlay = false;
    this.margin = { top: 20, right: 60, bottom: 130, left: 60 };
    this.option = option;
    this.initMap();
}

ChannelMap.prototype.initMap = function() {
    this.width = Number(this.container.attr("width"))
    this.height = Number(this.container.attr("height"))
    this.innerHeight = this.height - this.margin.top - this.margin.bottom
    this.innerWidth = this.width - this.margin.left - this.margin.right
    this.mainGroup = this.container.append("g").attr("id", "main_group")
    .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
    this.makeAxis({x: [0, 1], y: [0, 1]})
    this.drawGrid()

    this.mainGroup.append("g").attr("class", "x_axis")
    .attr("transform", `translate(0, ${this.innerHeight})`)
    .call(this.axisX)

    this.mainGroup.append("g").attr("class", "y_axis")
    .call(this.axisY)

    let self = this
    this.container.on("mouseenter", function (evt) { self.entered.call(this, evt, self) })
    .on("mousemove", function (evt) { self.moved.call(this,evt, self) })
    .on("mouseleave", function (evt) { self.leaved.call(this, evt, self) })
    
    this.container.call(d3.zoom()
    .scaleExtent([1, 1])
    .on("zoom", function (evt) { self.zoomed(evt, self) }));
    console.log(math)
}

ChannelMap.prototype.makeAxis = function(domain) {
    this.scaleX = d3.scaleLinear().domain(domain.x).range([0, this.innerWidth])
    this.scaleY = d3.scaleBand().domain(domain.y.reverse()).range([0, this.innerHeight])
    this.axisX = d3.axisBottom(this.scaleX).ticks(1).tickSize(-(this.innerHeight))
    this.axisY = d3.axisLeft(this.scaleY).ticks(1).tickSize(-(this.innerWidth))
}

ChannelMap.prototype.drawGrid = function (numX=200, numY=100) {
    this.xWidth = this.scaleX.range()[1],
    this.yHeight = this.scaleY.range()[1]
    this.scaleG = d3.scaleLinear()
    .domain(this.scaleY.domain())
    .range([0, this.innerHeight].reverse())
    
    this.mainGroup.append("g").attr("id", "gridGroup")
    .selectAll(".line_verticalGrid").data(this.scaleX.ticks((this.scaleX.ticks().length - 1) * 20))
    .join("line")
    .attr("class", "line_verticalGrid")
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .attr("stroke-width", "1.2")
    .attr("x1", d => this.scaleX(d))
    .attr("y1", 0)
    .attr("x2", d => this.scaleX(d))
    .attr("y2", this.yHeight)

    this.mainGroup.select("#gridGroup")
    .selectAll(".line_horizontalGrid").data(this.scaleG.ticks(numY))
    .join("line")
    .attr("class", "line_horizontalGrid")
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .attr("stroke-width", "1.2")
    .attr("x1", 0)
    .attr("y1", d => this.scaleG(d))
    .attr("x2", this.xWidth)
    .attr("y2", d => this.scaleG(d))
}

ChannelMap.prototype.updateGrid = function () {
    const gridGroup = this.mainGroup.select("#gridGroup")
    gridGroup.selectAll(".line_horizontalGrid").remove()
    if (Object.prototype.toString.call(this.scaleV).slice(8, 16) == "Function") {
    gridGroup.selectAll(".line_horizontalGrid")
        .data(this.scaleV.ticks(120))
        .enter()
        .append("line")
        .attr("class", "line_horizontalGrid")
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", "1.2")
        .attr("x1", 0)
        .attr("y1", d => this.scaleV(d))
        .attr("x2", this.xWidth)
        .attr("y2", d => this.scaleV(d))
    } else {
        Object.keys(this.scaleV).forEach(scale => {
            let range = this.scaleV[scale].range();
            let step = (range[1] - range[0]) / 10;
            gridGroup.selectAll(".line_horizontalGrid " + scale)
            .data(d3.range(range[0], range[1] + step, step))
            .join("line")
            .attr("class", "line_horizontalGrid " + scale)
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("stroke-width", "1.2")
            .attr("x1", 0)
            .attr("y1", d => d >= 700 ? 700 : d)
            .attr("x2", this.xWidth)
            .attr("y2", d => d >= 700 ? 700 : d)
        })
    }
}

ChannelMap.prototype.renderLegend = function () {
    d3.selectAll("#legend_group").remove()
    const height = d3.select(".x_axis").node().getBBox().height
    if (Object.prototype.toString.call(this.scaleV).slice(8, 14) == "Object") {
        const legend = Object.keys(this.scaleV).map(key => {
            const scale = this.scaleV[key],
            domain = scale.domain()
            return { name: key, value: (domain[1] - domain[0]) / 10 }
        })
        this.mainGroup.append("g").attr("transform", `translate(0, ${height + 20})`)
        .attr("id", "legend_group")
        .selectAll("text")
        .data(legend)
        .join("g")
        .attr("class", "legend")
        .append("text")
        .attr("transform", (d, i) => `translate(${i <= 9 ? i * 150 : (i - 10) * 150}, ${i <= 9 ? 60 : 80})`)
        .text(d => `${d.name}：${d.value}`)
        d3.select("#legend_group").append("text").attr("transform", `translate(0, 30)`)
        .text("图例：通道/值")
    } else {
        const domain = this.scaleV.domain(),
        value = (domain[1] - domain[0]);
        this.mainGroup.append("g").attr("transform", `translate(0, ${height})`)
        .attr("id", "legend_group")
        .append("g")
        .attr("class", "legend")
        .append("text")
        .attr("transform", `translate(0, 30)`)
        .text("单位高度：" + value / (this.scaleV.ticks().length - 1) / 10)
    }
}

ChannelMap.prototype.setData = function (data) {
    this.data = data;
    return this;
}

ChannelMap.prototype.updateMap = function (time, range, rate=1, isOverlay, data) {
    if (!data && !this.data) {
        throw new Error("ChannelMap needs to pass in the data parameter")
    }
    data = data ? data : this.data;
    this.time = time;
    let channels = [], newChannels = [], needUpdateGrid = false;
    needUpdateGrid = this.isOverlay === isOverlay ? false : true;
    this.isOverlay = isOverlay;
    Object.keys(data.subData.channels).forEach(key => {
        channels.push({
            name: key,
            value: data.subData.channels[key]
        })  
    });
    let curIndex = data.subData.time.indexOf(time[0]),
    endIndex = data.subData.time.indexOf(add(time[0], range)) + 1;

    this.timeFragment = data.subData.time.slice(curIndex, endIndex).map(item => Number((item * 1000).toFixed()))

    for (let i = 0; i < channels.length; i++) {
        newChannels.push({
            name: channels[i].name,
            value: channels[i].value.slice(curIndex, endIndex)
        })
    }
    const yHeight = d3.select(".y_axis .domain").node().getBBox().height
    const domains = this.splitAxisY(yHeight, newChannels)

    this.axisX.scale().domain(d3.extent(this.timeFragment))
    this.axisX.ticks(10)
    d3.select(".x_axis").call(this.axisX)
    this.mainGroup.selectAll(".x_axis .tick text").text(d => d / 1000)

    this.axisY.scale().domain(newChannels.map(channel => channel.name))
    d3.select(".y_axis").call(this.axisY)
    let scaleV = {}
    if (isOverlay) {
        scaleV = d3.scaleLinear()
        .domain(findLimit(newChannels))
        .range([0, 700])
        .nice()
    } else {
        newChannels.forEach(channel => {
            scaleV[channel.name] = d3.scaleLinear()
            .domain([d3.min(channel.value), d3.max(channel.value)])
            .range([domains[channel.name][0], domains[channel.name][1]])
            .nice()
        })
    }
    this.scaleV = scaleV;
    this.updateGrid()
    
    const lines = this.mainGroup.selectAll(".channel_line")
    this.drawSpecial()
    this.drawLine(newChannels, lines, scaleV, rate)
    // this.drawProgress()
    this.renderLegend()
    d3.selectAll(".tick line").attr("stroke", "#ff0000").attr("stroke-width", 1)
}

ChannelMap.prototype.drawLine = function (data, lines, scaleV, rate) {
    if (lines._groups[0].length == 0) {
        this.path = this.mainGroup.append("g")
        .attr("id", "draw_space")
        .selectAll("path")
        .data(data)
        .join("path")
        .attr("class", "channel_line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .style("mix-blend-mode", "multiply")
        .attr("d", data => {
            let line = d3.line().defined(d => !isNaN(d))
            .x((d, i) => this.scaleX(this.timeFragment[i]))
            .y(d => scaleV[data.name](d))
            return line(data.value.map(datum => datum * rate))
        })
        .exit().remove()
    } else {
        if (isOverlay) {
            this.axisY = d3.axisLeft(scaleV).tickSize(-(this.innerWidth))
            d3.select(".y_axis").call(this.axisY)
            this.mainGroup.selectAll(".channel_line")
            .data(data)
            .join("path")
            .attr("class", "channel_line")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .transition(1000)
            .attr("d", data => {
                let line = d3.line().defined(d => !isNaN(d))
                .x((d, i) => this.scaleX(this.timeFragment[i]))
                .y(d => {
                    return scaleV(Number(("" + d).slice(0,7)))
                })
                return line(data.value.map(datum => datum * rate))
            })
        } else {
            this.axisY = d3.axisLeft(this.scaleY).tickSize(-(this.innerWidth))
            d3.select(".y_axis").call(this.axisY)
            this.mainGroup.selectAll(".channel_line")
            .data(data)
            .join("path")
            .attr("class", "channel_line")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .transition()
            .duration(1000)
            .attr("d", data => {
                let line = d3.line().defined(d => !isNaN(d))
                .x((d, i) => this.scaleX(this.timeFragment[i]))
                .y(d => {
                    return scaleV[data.name](d)
                })
                return line(data.value.map(datum => datum * rate))
            })
        }
    }
}

ChannelMap.prototype.splitAxisY = function (height, data) {
    const range = height / data.length;
    let curBasic = 0, result = {};
    for (let index = 0; index < data.length; index++) {
        result[data[index].name] = [curBasic, curBasic + range]
        curBasic = curBasic + range
    }
    return result;
}

ChannelMap.prototype.entered = function (evt, self) {
    let grid = d3.select("#draw_space")
    grid.append("g")
    .attr("id", "rule_group")
    .append("line")
    .attr("id", "ruler")
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 1.5)
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", self.height - self.margin.top - self.margin.bottom)
    d3.select("#rule_group").append("text")
}

ChannelMap.prototype.drawSpecial = function() {
    d3.select("#specialTime").remove()
    const height = d3.select(".y_axis .domain").node().getBBox().height
    this.mainGroup
    .append("g")
    .attr("id", "specialTime")
    d3.select("#specialTime")
    .selectAll(".special_rect")
    .data(this.data.events)
    .join("g")
    .attr("class", "special_group")
    .append("rect")
    .attr("x", d => {
        const lastIndex = this.timeFragment.length - 1
        const start = mul(d.onset, 1000),
        end = start + mul(d.duration, 1000);
        if (start >= this.timeFragment[0] && end <= this.timeFragment[lastIndex]) {
            return this.scaleX(start)
        } else if (start >= this.timeFragment[0] && start <= this.timeFragment[lastIndex] && end >= this.timeFragment[lastIndex]) {
            return this.scaleX(start)
        } else if (start <= this.timeFragment[0] && end >= this.timeFragment[0] && end <= this.timeFragment[lastIndex]) {
            return this.scaleX(this.timeFragment[0])
        } else if (start <= this.timeFragment[0] && end >= this.timeFragment[lastIndex]) {
            return this.scaleX(this.timeFragment[0])
        } else {
            return -5000
        }
    })
    .attr("width", d => {
        const lastIndex = this.timeFragment.length - 1;
        const start = mul(d.onset, 1000),
        end = start + mul(d.duration, 1000);
        if (start >= this.timeFragment[0] && end <= this.timeFragment[lastIndex]) {
            return this.scaleX(end) - this.scaleX(start)
        } else if (start >= this.timeFragment[0] && start <= this.timeFragment[lastIndex] && end >= this.timeFragment[lastIndex]) {
            return this.scaleX(this.timeFragment[lastIndex]) - this.scaleX(start)
        } else if (start <= this.timeFragment[0] && end >= this.timeFragment[0] && end <= this.timeFragment[lastIndex]) {
            return this.scaleX(end)
        } else if (start <= this.timeFragment[0] && end >= this.timeFragment[lastIndex]) {
            return this.scaleX(this.timeFragment[lastIndex])
        } else {
            return 0
        }
    })
    .attr("height", height)
    .attr("stroke", "none")
    .attr("fill", "steelblue")
    .attr("opacity", 0.3)
    
    d3.selectAll(".special_group rect").nodes().forEach(node => {
        d3.select(node.parentNode).append("text")
        .attr("x", () => {
            if (d3.select(node).attr("x") == "-5000") {
                return -5000
            } else {
                return Number(d3.select(node).attr("x")) + Number(d3.select(node).attr("width")) / 2
            }
        })
        .attr("y", -4)
        .text(d => d.description)
        .attr("text-anchor", "middle")
    })
}

ChannelMap.prototype.moved = function (evt, self) {
    const position = d3.pointer(evt, this)
    let ruler = self.mainGroup.select("#rule_group")
    if (position[0] <= 60 || position[0] >= 1540) {
        ruler.attr("display", "none")
    } else {
        ruler.attr("display", null)
        ruler.select("text")
        .attr("text-anchor", "middle")
        .attr("y", -4)
        .text(Math.round(self.scaleX.invert(position[0] - self.margin.left)) / 1000)
        ruler.attr("transform", `translate(${position[0] - self.margin.left}, 0)`)
    }
}

ChannelMap.prototype.leaved = function (evt, self) {
    self.mainGroup.select("#rule_group").remove()
}

ChannelMap.prototype.zoomed = function (evt, self) {
    if (rate != 1) d3.select("#draw_space").attr("transform", `translate(0, ${evt.transform.y})`)
}

ChannelMap.prototype.drawProgress = function () {
    d3.select("#progress").remove()

    const baseNode = d3.select(".x_axis").node().getBBox()
    const progress = this.mainGroup.append("g").attr("id", "progress")
    .attr("transform", `translate(0, ${baseNode.height})`)
    
    const border = progress.append("rect")
    .attr("id", "progress_bar")
    .attr("width", `${d3.select("#draw_space").node().getBBox().width}`)
    .attr("height", 20)
    .attr("x", d3.select("#draw_space").node().getBBox().x)
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1)
    .attr("fill", "none")

    const progressScale = this.makeProgressScale()
    const _this = this;

    const slider = progress.append("rect")
    slider.attr("width", progressScale(5))
    .attr("height", 20)
    .attr("stroke", "none")
    .attr("fill", "#aaa")
    .attr("x", progressScale(this.time[0]))
    .attr("y", 0)

    const drag = d3
    .drag()
    .on("start", function(event, d) {
        _this.dragstart(event, this)
    })
    .on("drag", function (event, d) {
        _this.dragged(event, this, progressScale)
    })
    .on("end", function (event, d) {
        _this.dragend(event, this, progressScale)
    });
    slider.call(drag)
    this.drawEvt(progressScale)
}

ChannelMap.prototype.drawEvt = function (progressScale) {
    const progress = d3.select("#progress")
    progress.selectAll(".event_line")
    .data(this.data.events)
    .join("g")
    .attr("class", "event_line")
    .append("line")
    .attr("x1", d => progressScale(d.onset) + progressScale(5) / 2)
    .attr("x2", d => progressScale(d.onset) + progressScale(5) / 2)
    .attr("y1", 0)
    .attr("y1", 5)
    .attr("stroke", "red")
    .attr("fill", "none")
}

ChannelMap.prototype.makeProgressScale = function () {
    const border = d3.select("#progress_bar"),
    x = Number(border.attr("x")),
    width = Number(border.attr("width")),
    strokeWidth = Number(border.attr("stroke-width"))
    const progressScale = d3.scaleLinear()
    .domain([0, this.data.message.duration])
    .range([0, width])
    return progressScale;
}

ChannelMap.prototype.dragstart = function(event, target) {
    
    d3.select(target).attr("fill", "#bbb")
}

ChannelMap.prototype.dragged = function(event, target, progressScale) {
    const progress = d3.select("#progress_bar"),
    [min, max] = progressScale.range()
    const slider = d3.select(target)
    if (event.x - progressScale(5) / 2 <= min) {
        slider.attr("x", min)
    } else if (event.x + progressScale(5) / 2 >= max) {
        slider.attr("x", max - progressScale(5))
    } else {
        slider.attr("x", event.x - progressScale(5) / 2)
    }
}

ChannelMap.prototype.dragend = function (event, target, progressScale) {
    const slider = d3.select(target)
    const sliderX = Number(slider.attr("x"))
    const [start, end] = [progressScale.invert(sliderX), progressScale.invert(sliderX + progressScale(5))]
    this.option.onDragEnd(start, end)
}

function findLimit(data) {
    let temp = []
    data.forEach(datum => {
        temp = temp.concat(d3.extent(datum.value))
    })
    return d3.extent(temp)
}
