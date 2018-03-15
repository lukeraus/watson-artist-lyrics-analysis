import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Timeline from './Timeline';
import TimelineWIP from './TimelineWIP';
import TimelineNotFound from './TimelineNotFound';
import loadingGif from './static/loading.gif';

import './static/styles/TimelineBase.css';

class TimelineBase extends Component {
	constructor(props) {
		super(props);

		this.state = {
			case: ''
		};
	}

	async componentDidMount() {
		if (!this.props.artist) {
			this.props.history.push(`/`);
		}

		let response = await fetch('/search', {
			body: JSON.stringify({ search: this.props.artist }),
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			method: 'POST' // *GET, POST, PUT, DELETE, etc.
		});
		response = await response.json();

		switch(response.type) {
			case 'ARTIST_FOUND':
				this.data = response.message;
				if (!this.data.lifeEvents) {
					this.data.lifeEvents = {
						"808s & Heartbreak":{
							"sadness":[
								{
									"score":0.531556,
									"tone_id":"sadness",
									"tone_name":"Sadness",
									"sentence":"While it was criticized prior to release, 808s & Heartbreak had a significant effect on hip-hop music, encouraging other rappers to take more creative risks with their productions.[78]West's"
								},
								{
									"score":0.596346,
									"tone_id":"sadness",
									"tone_name":"Sadness",
									"sentence":"life took a different direction when his mother, Donda West, died of complications from cosmetic surgery involving abdominoplasty and breast reduction in November 2007.[69]"
								},
								{
									"score":0.63839,
									"tone_id":"sadness",
									"tone_name":"Sadness",
									"sentence":"West's tour with Lady Gaga was cancelled in response to the controversy.[80]"
								}
							],
							"joy":[
								{
									"score":0.685076,
									"tone_id":"joy",
									"tone_name":"Joy",
									"sentence":"Graduation once again continued the string of critical and commercial successes by West, and the album's lead single, \"Stronger\", garnered the rapper his third number-one hit.[66]"
								},
								{
									"score":0.747694,
									"tone_id":"joy",
									"tone_name":"Joy",
									"sentence":"In addition to U2, West drew musical inspiration from arena rock bands such as The Rolling Stones and Led Zeppelin in terms of melody and chord progression.[61][62]"
								},
								{
									"score":0.82213,
									"tone_id":"joy",
									"tone_name":"Joy",
									"sentence":"Fresh off spending the previous year touring the world with U2 on their Vertigo Tour, West felt inspired to compose anthemic rap songs that could operate more efficiently in large arenas.[59]"
								}
							]
						},
						"Yeezus":{
							"sadness":[
								{
									"score":0.535631,
									"tone_id":"sadness",
									"tone_name":"Sadness",
									"sentence":"NME stated, \"The decision to book West for the slot has proved controversial since its announcement, and the show itself appeared to polarise both Glastonbury goers and those who tuned in to watch on their TVs.\"[121]"
								},
								{
									"score":0.547337,
									"tone_id":"sadness",
									"tone_name":"Sadness",
									"sentence":"The Guardian said that \"his set has a potent ferocity – but there are gaps and stutters, and he cuts a strangely lone figure in front of the vast crowd.\"[123]"
								},
								{
									"score":0.741554,
									"tone_id":"sadness",
									"tone_name":"Sadness",
									"sentence":"The next month, West headlined at the Glastonbury Festival in the UK, despite a petition signed by almost 135,000 people against his appearance.[118]"
								}
							],
							"joy":[
								{
									"score":0.762004,
									"tone_id":"joy",
									"tone_name":"Joy",
									"sentence":"Later that month, West was awarded an honorary doctorate by the School of the Art Institute of Chicago for his contributions to music, fashion, and popular culture, officially making him an honorary DFA.[117]"
								},
								{
									"score":0.844937,
									"tone_id":"joy",
									"tone_name":"Joy",
									"sentence":"Toward the end of the set, West proclaimed himself: \"the greatest living rock star on the planet.\"[119]"
								},
								{
									"score":0.848355,
									"tone_id":"joy",
									"tone_name":"Joy",
									"sentence":"West also appeared on the Saturday Night Live 40th Anniversary Special, where he premiered a new song entitled \"Wolves\", featuring Sia Furler and fellow Chicago rapper, Vic Mensa."
								}
							]
						}
					};
				}
				// this.forceUpdate();
				break;
			case 'ARTIST_NOT_FOUND':
			case 'ARTIST_FOUND_NO_WATSON':
				this.data = response.artistName;
				break;
			default:
				break;
		}
		this.setState({
			case: response.type
		});
	}

	render() {
		let pageToRender;

		switch (this.state.case) {
			case 'ARTIST_FOUND':
				pageToRender = <Timeline {...this.data} />;
				console.log(this.data);
				break;
			case 'ARTIST_NOT_FOUND':
				pageToRender = <TimelineNotFound artistName={this.data} />;
				break;
			case 'ARTIST_FOUND_NO_WATSON':
				pageToRender = <TimelineWIP artist={this.data}/>;
				break;
			default:
				pageToRender = (
					<div className="sloading-container">
						<img className="gif" src={loadingGif} alt="Watson loading GIF" />
					</div>
				);
		}

		return pageToRender;
	}
}

export default withRouter(TimelineBase);
