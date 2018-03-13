import React, { Component } from 'react';

import './static/styles/TimelineBase.css';

import Timeline from './Timeline';
import TimelineWIP from './TimelineWIP';

class TimelineBase extends Component {
	constructor(props) {
		super(props);

		this.loaded = false;
	}

	async componentDidMount() {
		console.log(this.props);
		this.loaded = false;
		let response = await fetch('/search', {
			body: JSON.stringify({ search: this.props.artist }),
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			method: 'POST' // *GET, POST, PUT, DELETE, etc.
		});
		response = await response.json();
		console.log(response);
		this.data = response.message;
		this.loaded = true;
		this.data.lifeEvents = {
			"1989":{
			   "anger":[
				  {
					 "score":0.151159,
					 "tone_id":"anger",
					 "tone_name":"Anger",
					 "sentence":"Swift's intellectual property rights management and holding company, TAS Rights Management, filed for 73 trademarks related to the singer and the 1989 era memes.[158]"
				  }
			   ],
			   "joy":[
				  {
					 "score":0.782418,
					 "tone_id":"joy",
					 "tone_name":"Joy",
					 "sentence":"In 2015, \"Shake It Off\" was nominated for three Grammy Awards, including Record of the Year and Song of the Year and Swift won the Brit Award for International Female Solo Artist.[149][150]"
				  }
			   ]
			},
			"Fearless":{
			   "sadness":[
				  {
					 "score":0.372196,
					 "tone_id":"sadness",
					 "tone_name":"Sadness",
					 "sentence":"The incident was the subject of controversy and frequent media attention, resulting in many Internet memes.[67]"
				  }
			   ],
			   "joy":[
				  {
					 "score":0.841622,
					 "tone_id":"joy",
					 "tone_name":"Joy",
					 "sentence":"Also that year, she won five American Music Awards, including Artist of the Year and Favorite Country Album.[69]"
				  },
				  {
					 "score":0.885446,
					 "tone_id":"joy",
					 "tone_name":"Joy",
					 "sentence":"The album ranked number 99 on NPR's 2017 list of the 150 Greatest Albums Made By Women.[71]At the 52nd Grammy Awards, Fearless was named Album of the Year and Best Country Album, and \"White Horse\" was named Best Country Song and Best Female Country Vocal Performance."
				  }
			   ]
			}
		 }
		this.forceUpdate();
	}

	render() {
		let pageToRender;
		if (this.data && this.loaded) {
			pageToRender = <Timeline {...this.data} />;
		} else if (this.loaded) {
			pageToRender = <TimelineWIP />;
		} else {
			pageToRender = null;
		}

		return (
			<div>
				{pageToRender}
			</div>
		);
	}
}

export default TimelineBase;
