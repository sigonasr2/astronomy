import React, {useState,useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import './fonts/ACROTSRG.TTF'
import './backgrounds/stars.png'
import DateTimePicker from 'react-datetime-picker'

const REMOTE_ADDR = "http://45.33.13.215:3005";

const axios = require('axios');

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

const ClickSubmitButton = (input) => {
	input.addEventListener("keydown", function(event) {
	  if (event.keyCode === 13) {
		event.preventDefault();
		document.getElementById("submit").click();}
	});	
}

const ChooseFlavorLoadingText = () => {
	var strings = [
	"Communicating with the celestials...",
	"Shooting for the stars...",
	"Launching into the heavens...",
	"Seeking heavenly advice...",
	"Seeking divine wisdom...",
	"Determining celestial intersection with the stars...",
	"Communicating beyond mortal universes...",
	"Heading into a cosmic universe...",
	]
	return strings[Math.floor(Math.random()*strings.length)]
}

const UserPage = ()=>{
	const [text,setText] = useState("");
	const [page,setPage] = useState(null);
	switch (page) {
		default:{
			return (<div className="container stars border rounded shadow-sm">
				<div className="row">
					<div className="col-md-12 header text-center">
						<span className="glowHeavy animated fadein">{getCookie("username")}'s ASTRONOMY</span>
					</div>
				</div>
				<div className="row">
					<div className="col-md-12 text-center">
						{text}
					</div>
				</div>
			</div>);
		}
	}
}


const StartPage = (p)=>{
	const [text,setText] = useState("");
	const [loaded,setLoaded] = useState(null);
	const [username,setUsername] = useState("");
	const [date,setDate] = useState(new Date("Tue Jan 01 1991 00:00:00 GMT+0900"));
	const [page,setPage] = useState(null);
	
	const SubmitNewUser = ()=>{
		var obj = {username:username,birth_day:date.getDate(),
		birth_month:date.getMonth(),birth_year:date.getFullYear(),
		birth_minute:date.getMinutes(),birth_hour:date.getHours()}
		console.log("Sending request:"+JSON.stringify(obj));
		axios.post(REMOTE_ADDR+"/users/add/",obj)
		.then((data)=>{
			//Next create a cookie to remember this user's data.
			console.log("Response: "+data);
			for (var keys in obj) {
				setCookie(keys,obj[keys],365);
			}
			//Now refresh the page...
			p.setPage("UserPage");
		})
	}
	
	const SubmitBirthdate = (e)=>{
		setPage("LOADING");
		SubmitNewUser();
	}
	
	const SubmitUsername = (e)=>{
		setPage("BIRTHDATE");
	}
	const UpdateUsername = (e)=>{
		setUsername(e.currentTarget.value);
	}
	
	useEffect(()=>{setTimeout(()=>{
		setText(<span className="fadein3">Well hello there...</span>);
	},4000)},[loaded])
	useEffect(()=>{setTimeout(()=>{
		setText(<span className="fadein3">I see this is your first time here.</span>);
	},8000)},[loaded])
	useEffect(()=>{setTimeout(()=>{
		setText(<span className="fadein3">Tell me your name...</span>);
	},12000)},[loaded])
	useEffect(()=>{setTimeout(()=>{
		setText(<><span className="fadein3">Tell me your name...</span>
		<br/>
		<input type="text" id="username" className="starbox" onChange={(e)=>{UpdateUsername(e)}}/>
		<br/>
		<button className="starbox" onClick={(e)=>SubmitUsername()} id="submit">Continue</button>
		</>);
		document.getElementById("username").focus();
		ClickSubmitButton(document.getElementById("username"));
	},14000)},[loaded])
	
	switch (page) {
		case "LOADING":{
			return(
				<div className="pb-3 container stars border rounded shadow-sm">
					<div className="row">
						<div className="col-md-12 header text-center">
							<span className="glowHeavy animated fadein">ASTRONOMY</span>
						</div>
					</div>
					<div className="row">
						<div className="col-md-12 text-center">
							<span className="slowblink">
							{ChooseFlavorLoadingText()}
							</span>
						</div>
					</div>
				</div>
			);
		}break;
		case "BIRTHDATE":{
			return (
				<div className="pb-3 container stars border rounded shadow-sm">
					<div className="row">
						<div className="col-md-12 header text-center">
							<span className="glowHeavy animated fadein">ASTRONOMY</span>
						</div>
					</div>
					<div className="row">
						<div className="col-md-12 text-center">
							<span className="fadein_2">
							I also need to know when you were born. Don't be shy now... Tell it to me, relax.
							<br/>
							<DateTimePicker
							  className="glowLight baseCalendar"
							  autoFocus={true}
							  onChange={(d)=>{setDate(d);
							  console.log(d)}}
								defaultView={"century"}
							  value={date}
							  clearIcon={null}
							  disableClock={true}
							/>
							<br/>
							<button className="starbox" onClick={(e)=>SubmitBirthdate()} id="submit">Continue</button>
							</span>
						</div>
					</div>
				</div>
			);
		}break;
		default:{
			return (<div className="pb-3 container stars border rounded shadow-sm">
				<div className="row">
					<div className="col-md-12 header text-center">
						<span className="glowHeavy animated fadein">ASTRONOMY</span>
					</div>
				</div>
				<div className="row">
					<div className="col-md-12 text-center">
						{text}
					</div>
				</div>
			</div>);
		}
	}
}

function App() {
	const [data,setData] = useState([]);
	const [loaded,setLoaded] = useState(null);
	const [page,setPage] = useState(null);

	useEffect(()=>{
		if (getCookie("username")) {
			setPage("UserPage");
		} else {
			setPage("StartPage");
		}
	},[loaded]);
	switch (page) {
		/*case "DateTimePicker":{
			return <><DateTimePicker
	      className="glowLight baseCalendar"
		  autoFocus={true}
          onChange={(date)=>{setDate(date);
		  console.log(date)}}
			defaultView={"century"}
          value={date}
		  clearIcon={null}
		  disableClock={true}
        />
		</>
		}*/
		case "UserPage":{
			return <UserPage/>;
		}
		case "StartPage":{
			return <StartPage page={page} setPage={setPage}/>;
		}break;
		default:{
			return <></>;
		}
	}
}

export default App;
