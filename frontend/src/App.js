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

const GetAvatar=(username)=>{
	return "https://ui-avatars.com/api/?name="+username+"&rounded=true";
}
const GetSign=(birth_year,birth_month,birth_day,birth_minute,birth_hour)=>{
	if (birth_month===2) {
		if (birth_day<21) {
			return 12;
		} else {
			return 1;
		}
	} else
	if (birth_month===3) {
		if (birth_day<20) {
			return 1;
		} else {
			return 2;
		}
	} else
	if (birth_month===4) {
		if (birth_day<21) {
			return 2;
		} else {
			return 3;
		}
	} else
	if (birth_month===5) {
		if (birth_day<21) {
			return 3;
		} else {
			return 4;
		}
	} else
	if (birth_month===6) {
		if (birth_day<23) {
			return 4;
		} else {
			return 5;
		}
	} else
	if (birth_month===7) {
		if (birth_day<23) {
			return 5;
		} else {
			return 6;
		}
	} else
	if (birth_month===8) {
		if (birth_day<23) {
			return 6;
		} else {
			return 7;
		}
	} else
	if (birth_month===9) {
		if (birth_day<23) {
			return 7;
		} else {
			return 8;
		}
	} else
	if (birth_month===10) {
		if (birth_day<22) {
			return 8;
		} else {
			return 9;
		}
	} else
	if (birth_month===11) {
		if (birth_day<22) {
			return 9;
		} else {
			return 10;
		}
	} else
	if (birth_month===0) {
		if (birth_day<20) {
			return 10;
		} else {
			return 11;
		}
	} else
	if (birth_month===1) {
		if (birth_day<19) {
			return 11;
		} else {
			return 12;
		}
	}
	return 1; //Defaults to Aries...
}

const GetSignByUser = (username,users)=>{
	var user = users.filter(((user)=>user.username===username))[0];
	return GetSign(user.birth_year,user.birth_month,user.birth_day,user.birth_minute,user.birth_hour)
}

const GetSignData = (username,users,signs)=>{
	var user = users.filter(((user)=>user.username===username))[0];
	return signs.filter((sign)=>sign.id===GetSign(user.birth_year,user.birth_month,user.birth_day,user.birth_minute,user.birth_hour))[0];
}

const GetCompatibleMembers = (username,users,signs,compatibility)=>{
	//Look for your sign data.
	var myData = GetSignData(username,users,signs)
	var compatibilityData = compatibility.filter((c)=>
	{
		return c.signid===myData.id && c.compatible
	})
	//See if compatible members exist.
	var compatibleIds = []
	for (var compat of compatibilityData) {
		compatibleIds.push(compat.compatiblesignid)
	}
	//console.log(compatibleIds)
	var compatibleUsers = []
	users.forEach((user)=>{
		if (compatibleIds.includes(GetSignData(user.username,users,signs).id)) {
			compatibleUsers.push(user.username)
		}
	})
	//console.log(compatibleUsers)
	return compatibleUsers
}

const RandomDarkColor = (username)=>{
	if (username.length>=3) {
		return Math.floor((username.charCodeAt(0)*7%16)/2).toString(16)+(username.charCodeAt(0)%16).toString(16)+Math.floor((username.charCodeAt(1)*7%16)/2).toString(16)+(username.charCodeAt(1)%16).toString(16)+Math.floor((username.charCodeAt(2)*7%16)/2).toString(16)+(username.charCodeAt(2)%16).toString(16)
	} else {
		return "646968";
	}
}

const Member =(p)=>{
	const [additionalText,setAdditionalText] = useState("");
	return (
		<div className="col-md-4 border fadein profile">
			<div className="row">
				<div className="col-md-12">
					<img src={"https://ui-avatars.com/api/?name="+p.username+"&rounded=true&background="+RandomDarkColor(p.username)}/>
				</div>
			</div>
			<div className="row">
				<div className="col-md-12">
				{p.username}
				</div>
			</div>
			{additionalText}
		</div>
	);
}

const UserPage = ()=>{
	const [text,setText] = useState("");
	const [dailytext,setDailyText] = useState("");
	const [compatibilitytext,setCompatibilityText] = useState("");
	const [page,setPage] = useState(null);
	const [sign,setSign] = useState("");
	const [careerRating,setCareerRating] = useState(0);
	const [wealthRating,setWealthRating] = useState(0);
	const [loveRelationshipRating,setLoveRelationshipRating] = useState(0);
	const [healthRating,setHealthRating] = useState(0);
	const [update,setUpdate] = useState(false);
	const [users,setUsers] = useState([]);
	const [signs,setSigns] = useState([]);
	const [compatibility,setCompatibility] = useState([]);
	
	useEffect(()=>{
		axios.get(REMOTE_ADDR+"/users/view").then((data)=>{
			setUsers(data.data)
			return axios.get(REMOTE_ADDR+"/signs/view")
		})
		.then((data)=>{setSigns(data.data)
			return axios.get(REMOTE_ADDR+"/compatibility/view")
		})
		.then((data)=>{
			setCompatibility(data.data)
		})
		.then(()=>{
			setPage("USERHOME");
		})
	},[update]);
	
	useEffect(()=>{
		if (users.length>0 && signs.length>0) {
			//console.log("Users: "+users)
			axios.get("http://45.33.13.215/astronomy/"+GetSignData(getCookie("username"),users,signs).sign_name).then((data)=>{		
				setDailyText(data.data.horoscope)
			})
		}
	},[users,signs]);
	
	useEffect(()=>{
		if (users.length>0 && signs.length>0 && compatibility.length>0) {
			var finalText = GetCompatibleMembers(getCookie("username"),users,signs,compatibility).reverse().map((member)=>{
					return <Member username={member} users={users} signs={signs} compatibility={compatibility}/>
				})
			setCompatibilityText(finalText)
		}
	},[users,signs,compatibility])
	
	
	const header = <div className="row">
					<div className="col-md-12 header text-center">
						<span className="glowHeavy animated fadein">{getCookie("username")}'s ASTRONOMY</span>
					</div>
				</div>;
	const dailyheader = <div className="row pt-5">
					<div className="col-md-12 header text-center">
						<span className="glowHeavy animated fadein">{getCookie("username")}'s DAILY HOROSCOPE</span>
					</div>
				</div>;
	const compatibilityheader = <div className="row pt-5">
					<div className="col-md-12 header text-center">
						<span className="glowHeavy animated fadein">{getCookie("username")}'s COMPATIBILITY</span>
					</div>
				</div>;
	
	switch (page) {
		case "USERHOME":{
			return (<div className="pb-3 container stars border rounded shadow-sm">
				{header}
				<div className="row pt-2 pb-2">
					<div className="col-md-12 text-center">
							{GetSignData(getCookie("username"),users,signs).sign_name}
							<br/>
						<img width={64} src={require('./astrology_signs/'+GetSignByUser(getCookie("username"),users)+'.png')}/>
					</div>
				</div>
				{dailyheader}
				<div className="row pt-2 pb-2">
					<div className="col-md-12 text-center">
					{dailytext}
					</div>
				</div>
				{compatibilityheader}
				<div className="row pt-2 pb-2">
					<div className="col-md-12 text-center">
						<div className="row text-center">
							{compatibilitytext}
						</div>
					</div>
				</div>
			</div>);
		}break;
		default:{
			return (<div className="pb-3 container stars border rounded shadow-sm">
				{header}
				<div className="row">
					<div className="col-md-12 text-center">
						<span className="slowblink">
							{ChooseFlavorLoadingText()}
						</span>
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
