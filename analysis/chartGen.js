const { JSDOM } = require('jsdom');
const fs = require('fs');
const data = require('./artists_results/kanyewest.json');

const baseHtml = '<html><body><script src="https://rawgit.com/gka/d3-jetpack/master/build/d3v4%2Bjetpack.js"></script><div id="container"></div></body></html>';
const dom = new JSDOM(baseHtml, {
	runScripts: 'dangerously',
	resources: 'usable',
	pretendToBeVisual: true
});

const generateAreaChart = () => {
	const d3 = dom.window.d3;

	const albums = data.albums;
	const titles = [];
	const traitMapKeys = {};
	const big5 = [];

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

			traitMapKeys[personality.name] = true;
			big5.push(personality.name);

			const childrensPersonalities = personality.children.map((child) => {
				traitMapKeys[child.name] = true;
				return {
					title,
					trait: child.name,
					value: child.percentile,
					parent: personality.name
				};
			});

			newPersonalities = newPersonalities.concat(childrensPersonalities);
			return currentPersonalities.concat(newPersonalities);
		}, []);

		return insightArray.concat(newInsights);
	}, []);

	const traitSchema = albums[0].insights.personality.map(insight => ({
		name: insight.name,
		children: insight.children.map(child => child.name)
	}));

	const traits = Object.keys(traitMapKeys);

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
			height: 7 * totalHeight + topOffset,
			width: (traits.length / 7) * totalWidth,
			xmlns: 'http://www.w3.org/2000/svg',
			'xmlns:xlink': 'http://www.w3.org/1999/xlink'
		});

	const format = d3.format('.0%');
	const color = d3.scaleOrdinal()
		.domain(big5)
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

	const fileName = `./analysis/svgs/${data.artist.name.toLowerCase().split(' ').join('')}-area-chart.svg`;
	fs.writeFileSync(fileName, d3.select('#container').html());
};

setTimeout(generateAreaChart, 1000);
