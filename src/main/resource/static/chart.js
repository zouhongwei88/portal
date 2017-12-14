cola(function (model) {
	function drawChart(name, dataset) {
		var width = 80,
			height = 80,
			twoPi = 2 * Math.PI;


		var arc = d3.svg.arc()
			.innerRadius(36)
			.outerRadius(40)
			.startAngle(0);

		var svg = d3.select($("#" + name)[0]).append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

		var meter = svg.append("g")
			.attr("class", "season-progress");

		var background = meter.append("path")
			.datum({endAngle: twoPi})
			.attr("d", arc)
			.attr("class", "background")

		var foreground = meter.append("path")
			.datum({endAngle: 0})

			.attr("class", "foreground")
			.attr("d", arc);

		foreground.transition()
			.duration(1000)
			.ease("linear")
			.attrTween("d", function (d) {
				var interpolate = d3.interpolate(d.endAngle, twoPi * dataset["progress"] / dataset["total"])
				return function (t) {
					d.endAngle = interpolate(t);
					return arc(d);
				}
			});


		var text = meter.append("text")
			.attr("text-anchor", "middle")
			.attr("dy", ".35em")
			.attr("font-size", "24")
			.text(dataset["progress"]);
	}

	drawChart("uwCount", {
		progress: 35,
		total: 46
	});

	drawChart("uwAging", {
		progress: 35,
		total: 60
	});

	drawChart("uwReturnRate", {
		progress: 68,
		total: 100
	});

	drawChart("workRatio", {
		progress: 18,
		total: 100
	});


	model.set({
		uwCount: 35,
		uwAging: 35,
		uwReturnRate: 68,
		workRatio: 18
	})

});