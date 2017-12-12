(function () {
	var colors = [
		[0.6, 'rgba(68, 136, 187, 0.8)'],
		[0.8, 'rgba(255, 190, 110, 0.8)'],
		[1, 'rgba(24, 166, 137, 0.8)']
	];

	window.$chartOption = {
		uwCount: {
			series: [
				{
					startAngle: 180, endAngle: 0,
					max: 400, min: 0,
					axisLine: {
						show: true,
						lineStyle: {
							color: colors
						}
					},

					splitNumber: 1,
					pointer: {
						width: 5,
						length: '100%',
						color: 'rgba(255, 255, 255, 0.8)'
					},
					name: '业务指标',
					type: 'gauge',
					detail: {
						formatter: '{value}件',
						offsetCenter: [0, -35],
						textStyle: {
							color: 'auto',
							fontSize: 18
						}
					},
					data: [{value: 0}]
				}
			]
		},
		uwAging: {
			series: [
				{
					startAngle: 180, endAngle: 0,
					max: 60, min: 0,
					axisLine: {
						show: true,
						lineStyle: {
							color: colors
						}
					},
					splitNumber: 4,
					pointer: {
						width: 5,
						length: '100%',
						color: 'rgba(255, 255, 255, 0.8)'
					},
					name: '业务指标',
					type: 'gauge',
					detail: {
						formatter: '{value}分钟',
						offsetCenter: [0, -35],
						textStyle: {
							color: 'auto',
							fontSize: 18
						}
					},
					data: [{value: 0}]
				}
			]
		},
		uwReturnRate: {
			series: [
				{
					startAngle: 180, endAngle: 0,
					max: 100, min: 0,
					axisLine: {
						show: true,
						lineStyle: {
							color: colors
						}
					},
					splitNumber: 4,
					pointer: {
						width: 5,
						length: '100%',
						color: 'rgba(255, 255, 255, 0.8)'
					},
					name: '业务指标',
					type: 'gauge',
					detail: {
						formatter: '{value}%',
						offsetCenter: [0, -35],
						textStyle: {
							color: 'auto',
							fontSize: 18
						}
					},
					data: [{value: 0}]
				}
			]
		},
		workRatio: {
			series: [
				{
					startAngle: 180, endAngle: 0,
					max: 100, min: 0,
					axisLine: {
						show: true,
						lineStyle: {
							color: colors
						}
					},
					splitNumber: 4,
					pointer: {
						width: 5,
						length: '100%',
						color: 'rgba(255, 255, 255, 0.8)'
					},
					name: '业务指标',
					type: 'gauge',
					detail: {
						formatter: '{value}件',
						offsetCenter: [0, -35],
						textStyle: {
							color: 'auto',
							fontSize: 18
						}
					},
					data: [{value: 0}]
				}
			]
		}
	};
})();
