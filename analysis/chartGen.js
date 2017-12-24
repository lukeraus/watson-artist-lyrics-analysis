const { JSDOM } = require('jsdom');
const fs = require('fs');

// IMPORTANT: update URL if it breaks; it's d3 with the entire d3-jetpack library on top
const d3WithJetpackUrl = 'https://rawgit.com/gka/d3-jetpack/master/build/d3v4%2Bjetpack.js';

const baseHtml = `<html><body><script src="${d3WithJetpackUrl}"></script><div id="container"></div></body></html>`;
const dom = new JSDOM(baseHtml, {
	runScripts: 'dangerously',
	resources: 'usable',
	pretendToBeVisual: true
});

setTimeout(generateCharts, 1000);

const data = require(process.argv[2]);

function generateCharts() {
	generateAreaChart();
	generateHypodermicNeedleChart();
}

function generateAreaChart() {
	const d3 = dom.window.d3;

	const albums = data.albums;
	const titles = [];

	const insights = albums.reduce((insightArray, album) => {
		const title = album.title;

		titles.push(title);

		const newInsights = album.insights.personality.reduce((currentPersonalities, personality) => {
			let newPersonalities = [{
				title,
				trait: personality.name,
				value: personality.percentile,
				parent: 'Big 5'
			}];

			const childrensPersonalities = personality.children.map(child => ({
				title,
				trait: child.name,
				value: child.percentile,
				parent: personality.name
			}));

			newPersonalities = newPersonalities.concat(childrensPersonalities);
			return currentPersonalities.concat(newPersonalities);
		}, []);

		return insightArray.concat(newInsights);
	}, []);

	const traitSchema = albums[0].insights.personality.map(insight => ({
		name: insight.name,
		children: insight.children.map(child => child.name)
	}));

	const totalHeight = 120;
	const totalWidth = 333;
	const topOffset = 80;
	const margin = {
		left: 12,
		right: 0,
		top: 45,
		bottom: 20
	};

	const svg = d3.select('#container').append('svg')
		.at({
			height: titles.length * totalHeight + topOffset,
			width: (insights.length / titles.length / 7) * totalWidth,
			xmlns: 'http://www.w3.org/2000/svg',
			'xmlns:xlink': 'http://www.w3.org/1999/xlink'
		});

	const format = d3.format('.0%');
	const color = d3.scaleOrdinal()
		.domain(traitSchema.map(d => d.name))
		.range(['#8E3C36', '#6EA2D5', '#EB3C27', '#00A28A', '#5F4B8B']);

	const height = totalHeight - margin.top - margin.bottom;
	const width = totalWidth - margin.left - margin.right;

	const x = d3.scaleOrdinal()
		.domain(titles)
		.range(d3.range(1, width, width / 7));

	const xAxis = d3.axisBottom(x)
		.tickFormat(d => d.split(' ').map(word => word.slice(0, 1)).join(''));

	const y = d3.scaleLinear()
		.domain([0, 1])
		.range([height, 0]);

	const area = d3.area()
		.x(d => x(d.title))
		.y0(height)
		.y1(d => y(d.value));

	const line = d3.line()
		.x(d => x(d.title))
		.y(d => y(d.value));

	for (let parentIndex = 0; parentIndex < traitSchema.length; parentIndex++) {
		const parent = traitSchema[parentIndex];
		areaChart(parent.name, parentIndex, 0);
		for (let childIndex = 0; childIndex < parent.children.length; childIndex++) {
			const child = parent.children[childIndex];
			areaChart(child, parentIndex, childIndex + 1);
		}
	}

	const chartTitle = `${data.artist.name}'s Personality Changes Through Album Lyrics`;
	svg.append('text')
		.text(chartTitle)
		.at({
			fontSize: 1600 / chartTitle.length,
			fontWeight: 600,
			x: margin.left,
			y: 44
		});

	const description = 'Bolded top row charts are the Big 5 traits. The color of each chart matches to that of its Big 5 parent. The encircled value is the percentile.';
	svg.append('text')
		.text('')
		.at({
			fontStyle: 'italic',
			transform: `translate(${traitSchema.length * totalWidth - 320},${22})`
		})
		.tspans(d3.wordwrap(description, 38));

	const titleLegend = svg.append('g');
	const legendFontSize = topOffset / titles.length;

	titleLegend.selectAll('.album-title-abbreviation')
		.data(titles).enter()
		.append('text')
		.at({
			y: (d, i) => i * legendFontSize,
			fontSize: legendFontSize,
			fontWeight: 600,
			textAnchor: 'end',
			transform: `translate(${1000},${22})`
		})
		.text(d => `${d.split(' ').map(word => word.slice(0, 1)).join('')} - `);

	titleLegend.selectAll('.album-title-full')
		.data(titles).enter()
			.append('text')
			.at({
				y: (d, i) => i * legendFontSize,
				fontSize: legendFontSize,
				transform: `translate(${1002},${22})`
			})
			.text(d => d);


	function areaChart(trait, i, j) {
		const subset = insights.filter(insight => (insight.trait === trait));

		const columnOffset = i * totalWidth;

		const transformX = margin.left + columnOffset;
		const transformY = margin.top + j * totalHeight + topOffset;

		const g = svg.append('g').at({
				transform: `translate(${transformX},${transformY})`
			});

		const chartColor = color(subset[0].parent !== 'Big 5' ? subset[0].parent : trait);

		g.append('g').at({
			transform: `translate(${0}, ${height})`
		})
		.call(xAxis);

		g.append('path')
			.data([subset])
			.at({
				class: 'area',
				d: area,
				fill: chartColor,
				fillOpacity: j === 0 ? 0.85 : 0.5
			});

		g.append('path')
			.data([subset])
			.at({
				class: 'line',
				d: line,
				stroke: chartColor,
				strokeWidth: 3,
				fill: 'none'
			});

		const points = g.append('g');

		points.selectAll('.point')
			.data(subset).enter()
			.append('circle')
				.at({
					class: 'point',
					cx: d => x(d.title),
					cy: d => y(d.value),
					r: 9,
					fill: '#FFFFFF',
					stroke: chartColor,
					strokeWidth: 3
				});

		points.selectAll('.text-point')
			.data(subset).enter()
			.append('text')
			.at({
				class: 'text-point',
				x: d => x(d.title),
				y: d => y(d.value) + 3,
				textAnchor: 'middle',
				fontSize: 10,
			})
			.text(d => format(d.value).slice(0, -1));


		g.append('text')
			.text(trait)
			.at({
				class: 'trait-title',
				fontWeight: j === 0 ? 800 : 400,
				paintOrder: 'stroke',
				stroke: 'rgba(255, 255, 255, 0.9)',
				strokeWidth: 4
			});
	}

	d3.select('svg').at({
		fill: '#000000'
	});

	d3.selectAll('path.domain').at({
		stroke: 'none',
	});

	d3.selectAll('text').at({
		fontFamily: 'sans-serif',
		fill: '#000000'
	});

	const fileName = `${data.artist.name.toLowerCase().split(' ').join('')}-area-chart.svg`;
	fs.writeFileSync(fileName, d3.select('#container').html());
}

function generateHypodermicNeedleChart() {
	const d3 = dom.window.d3;

	const albums = data.albums;
	const titles = albums.map(album => album.title);

	const traitSchema = albums[0].insights.personality.map(insight => ({
		name: insight.name,
		children: insight.children.map(child => child.name)
	}));

	const traits = [];

	traitSchema.forEach((big5Trait, i) => {
		let albumScores = albums.map(album => album.insights.personality[i]);
		addTrait(big5Trait.name, albumScores, true);
		big5Trait.children.forEach((childTrait, j) => {
			albumScores = albums.map(album => album.insights.personality[i].children[j]);
			addTrait(childTrait, albumScores, false);
		});
	});

	function addTrait(name, albumScores, big5) {
		const trait = {
			name, big5, albumScores
		};

		const percentiles = albumScores.map(album => album.percentile);
		percentiles.sort();

		trait.median = d3.median(percentiles);
		trait.q1 = d3.quantile(percentiles, 0.25);
		trait.q3 = d3.quantile(percentiles, 0.75);

		const iqr = 1.5 * (trait.q3 - trait.q1);
		trait.minWhisker = d3.min(percentiles.filter(d => d > trait.q1 - iqr));
		trait.maxWhisker = d3.max(percentiles.filter(d => d < trait.q3 + iqr));

		traits.push(trait);
	}

	d3.select('svg').remove();

	const rowHeight = 48;
	const totalHeight = traits.length * rowHeight;
	const totalWidth = 1600;
	const margin = {
		top: 25,
		bottom: 25,
		left: rowHeight * 4,
		right: 25
	};

	const height = totalHeight - margin.top - margin.bottom;
	const width = totalWidth - margin.left - margin.right;

	const labelMargin = 12 - margin.left;
	const topOffset = 100;

	const svg = d3.select('#container').append('svg')
		.at({
			height: totalHeight + topOffset,
			width: totalWidth,
			xmlns: 'http://www.w3.org/2000/svg',
			'xmlns:xlink': 'http://www.w3.org/1999/xlink'
		});

	const x = d3.scaleLinear()
		.domain([0, 1])
		.range([1, width - margin.right]);

	const y = d3.scaleOrdinal()
		.domain(traits.map(d => d.name))
		.range(d3.range(1, height, height / traits.length));

	const color = d3.scaleOrdinal()
		.domain(traitSchema.map(d => d.name))
		.range(d3.schemeCategory20);

	const g = svg.append('g').at({
		transform: `translate(${margin.left}, ${margin.top + topOffset})`
	});

	const xAxisFunc = d3.axisTop(x)
		.ticks(20)
		.tickSize(height + 10)
		.tickFormat(d => Math.floor(d * 100));

	const xAxis = g.append('g.x.axis').at({
		transform: `translate(0,${height - 12})`
	}).call(xAxisFunc);

	xAxis.selectAll('.tick line').at({
		stroke: '#000',
		opacity: (d, i) => i % 2 === 0 ? 1 : 0.5
	});

	xAxis.selectAll('.tick text').at({
		dy: -6
	});

	const fakeLineData = d3.range(0, height + 10, 3);
	const yAxis = g.append('g.y.axis').at({
		transform: 'translate(0,-20)'
	});

	yAxis.selectAll('line')
		.data(fakeLineData).enter()
		.append('line').at({
			x1: 0,
			x2: width,
			y1: d => d,
			y2: d => d,
			strokeWidth: 2,
			stroke: '#FFF'
		});

	g.selectAll('.domain').remove();

	const labels = g.append('g').at({
		class: 'label-container'
	});

	const lowerRects = g.append('g').at({
		class: 'lower-rect-container'
	});

	const upperRects = g.append('g').at({
		class: 'upper-rect-container'
	});

	const lowerLines = g.append('g').at({
		class: 'lower-line-container'
	});

	const upperLines = g.append('g').at({
		class: 'upper-line-container'
	});

	const minWhiskers = g.append('g').at({
		class: 'min-whisker-container'
	});

	const maxWhiskers = g.append('g').at({
		class: 'max-whisker-container'
	});

	const points = g.append('g').at({
		class: 'point-container'
	});

	const boundaries = g.append('g').at({
		class: 'boundary-container'
	});

	traits.forEach((trait) => {
		labels.append('text')
			.text(trait.name)
			.at({
				x: labelMargin,
				y: y(trait.name) + 4,
				fontSize: rowHeight / 3,
				fontWeight: trait.big5 ? 800 : 400
			});

		const yValue = y(trait.median);

		lowerRects.append('rect.boxplot.lower-rect').at({
			x: x(trait.q1),
			y: yValue - (rowHeight * 0.25),
			width: x(trait.median) - x(trait.q1),
			height: rowHeight / 2,
			fill: '#E3E3E3',
			fillOpacity: 0.6,
			stroke: '#000'
		});

		upperRects.append('rect.boxplot.upper-rect').at({
			x: x(trait.median),
			y: yValue - (rowHeight * 0.25),
			width: x(trait.q3) - x(trait.median),
			height: rowHeight / 2,
			fill: 'none',
			stroke: '#000'
		});

		lowerLines.append('line.boxplot.lower-line').at({
			x1: x(trait.minWhisker),
			x2: x(trait.q1),
			y1: yValue,
			y2: yValue,
			stroke: '#000'
		});

		upperLines.append('line.boxplot.upper-line').at({
			x1: x(trait.q3),
			x2: x(trait.maxWhisker),
			y1: yValue,
			y2: yValue,
			stroke: '#000'
		});

		minWhiskers.append('line.boxplot.min-whisker').at({
			x1: x(trait.minWhisker),
			x2: x(trait.minWhisker),
			y1: yValue - (rowHeight * 0.25),
			y2: yValue + (rowHeight * 0.25),
			stroke: ('#000')
		});

		maxWhiskers.append('line.boxplot.max-whisker').at({
			x1: x(trait.maxWhisker),
			x2: x(trait.maxWhisker),
			y1: yValue - (rowHeight * 0.25),
			y2: yValue + (rowHeight * 0.25),
			stroke: ('#000')
		});

		points.selectAll('.point')
			.data(trait.albumScores).enter()
			.append('circle')
			.at({
				cx: d => x(d.percentile),
				cy: d => y(d.name),
				r: rowHeight / 10,
				fill: (d, i) => color(titles[i]),
				fillOpacity: 0.2,
				stroke: (d, i) => color(titles[i]),
				strokeWidth: rowHeight / 30,
			});

		if (trait.big5) {
			boundaries.append('line').at({
				x1: labelMargin,
				x2: width - margin.right,
				y1: yValue - rowHeight / 2,
				y2: yValue - rowHeight / 2,
				stroke: '#000'
			});
		}
	});

	// legend
	const legend = svg.append('g').at({
		class: 'legend',
		transform: `translate(${margin.left * 2.75},${16})`
	});

	const halfLength = titles.length / 2;
	const xLegend = d3.scaleOrdinal()
		.domain(titles)
		.range(d3.range(0, width * 1.5, (width * 1.5) / titles.length));

	legend.selectAll('.key')
		.data(titles).enter()
		.append('g').at({
			transform: (d, i) => {
				const secondRow = i / halfLength > 1;
				let xValue = xLegend(d);
				let yValue = 0;
				if (secondRow) {
					xValue -= width - 198;
					yValue += 32;
				}

				return `translate(${xValue},${yValue})`;
			}
		})
		.append('circle').at({
			cx: 0,
			cy: 0,
			r: rowHeight / 10,
			fill: d => color(d),
			fillOpacity: 0.2,
			stroke: d => color(d),
			strokeWidth: rowHeight / 30,
		})
		.parent().append('text').at({
			x: rowHeight / 4,
			y: 6
		})
		.text(d => d);

	svg.append('text').at({
		x: 12,
		y: 32,
		fontSize: 36,
		fontWeight: 800
	})
	.text(`${data.artist.name}'s Box Plot`);

	const description = 'Bolded rows are Big 5 traits. Values outside of the whisker bounds are outliers. Values inside the box are between Q1 and Q3, with the value on the line being the median';
	svg.append('g.description').at({
		transform: 'translate(12, 52)'
	}).append('text').at({
		fontSize: 10,
		fontStyle: 'italic',
	})
	.tspans(d3.wordwrap(description, 80));

	d3.select('svg').at({
		fill: '#000000'
	});

	d3.selectAll('text').at({
		fontFamily: 'sans-serif',
		fill: '#000000'
	});

	d3.selectAll('.boxplot').at({
		strokeWidth: 0.5
	});

	const fileName = `${data.artist.name.toLowerCase().split(' ').join('')}-box-chart.svg`;
	fs.writeFileSync(fileName, d3.select('#container').html());
}
