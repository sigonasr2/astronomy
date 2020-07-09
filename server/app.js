const express = require('express') 
const app = express() 
const port = 3005 
const bodyParser = require('body-parser')
const { json } = require('body-parser')
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`)) 
const Pool = require('pg').Pool 
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

  
let allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', "*");
	res.header('Access-Control-Allow-Headers', "*");
	res.header('Access-Control-Allow-Methods', "*");
	next();
  }
  app.use(allowCrossDomain);

const pool = 
new Pool({
  user: 'postgres',
  password: '',
  host: 'postgres',
  database: 'astronomy',
  port: 5432,
})

  const table_data = [{
	  name:"users",
	  required_fields:["username","birth_day","birth_month","birth_year","birth_minute","birth_hour"],
	  all_fields:["username","birth_day","birth_month","birth_year","birth_minute","birth_hour"]
  },{
	  name:"signs",
	  required_fields:[],
	  all_fields:["sign_name","symbol","strengths","weaknesses","element","ruler","jewelry","yinyang"]
  },{
	  name:"compatibility",
	  required_fields:[],
	  all_fields:["signId","compatibleSignId"]
  },{
	  name:"numbers",
	  required_fields:[],
	  all_fields:["signId","compatibleSignId","compatible"]
  },{
	  name:"colors",
	  required_fields:[],
	  all_fields:["signId","color","compatible"]
  },{
	name:"flowers",
	required_fields:[],
	all_fields:["signId","flower","compatible"]
  },{
	name:"directions",
	required_fields:[],
	all_fields:["signId","direction","compatible"]
  }
];
  
  var RequiredFieldsExist = (body,fields) => {
	  for (var keys of fields) {
		if (!(keys in body)) {
			return false;
		}
	  }
	  return true;
  }
  
  var OutputRequiredFieldNames = (required_fields) => required_fields.reduce((result,field)=>(result==="")?result+=field:result+=","+field,"");
  var OutputSqlArgumentNumbers = (required_fields) => required_fields.reduce((result,field,count)=>(result==="")?result+="$"+(count+1):result+=","+"$"+(count+1),"");
  var OutputBodyData = (body,required_fields) => required_fields.filter((field)=>body[field]!==undefined).map((field)=>body[field]);
  var CountFieldNames = (body,all_fields) => {
	var counter = 0;
	for (var i=0;i<all_fields.length;i++) {
		var field = all_fields[i];
		if (body[field]) {
			counter++;
		}
	}
	return counter;
  }
  var OutputSqlArgumentsAndFieldNames = (body,all_fields) => {
	var finalStr = "";
	var count = 0;
	for (var i=0;i<all_fields.length;i++) {
		var field = all_fields[i];
		if (body[field]) {
			if (finalStr==="") {
				finalStr += field+"=$"+(count+++1) 
			} else {
				finalStr += ","+field+"=$"+(count+++1) 
			}
		}
	}
	return finalStr;
  }
  
  
  
  table_data.forEach((table)=>{
	  app.get("/"+table.name+"/view",(req,res)=>{
		  pool.query('SELECT * FROM '+table.name+' ORDER BY id ASC', (error, results) => {
		  if (error) {
			throw error
		  }
		  res.status(200).json(results.rows)
		})
	  });
	  app.get("/"+table.name+"/view/:id",(req,res)=>{
		  pool.query('SELECT * FROM '+table.name+' where id=$1 ORDER BY id ASC', [req.params.id] , (error, results) => {
		  if (error) {
			throw error
		  }
		  res.status(200).json(results.rows)
		})
	  });
	  app.post("/"+table.name+"/add",
		  (req,res)=>{
	  if (req.body) { 
		if (RequiredFieldsExist(req.body,table.required_fields)) {
			  pool.query('insert into '+table.name+'('+OutputRequiredFieldNames(table.required_fields)+') values('+OutputSqlArgumentNumbers(table.required_fields)+') returning *', OutputBodyData(req.body,table.required_fields) , (error, results) => {
			  if (error) {
				throw error
			  }
			  res.status(200).json(results.rows)
			})
			} else {
				res.status(400).json("Missing a field! Required Fields: "+OutputRequiredFieldNames(table.required_fields));
			}
	  }});
	  app.put("/"+table.name+"/update/:id",
		  (req,res)=>{
		  if (req.body && req.params.id && CountFieldNames(req.body,table.all_fields)>0) { 
		  //console.log([...OutputBodyData(req.body,table.all_fields),Number(req.params.id)])
		  //console.log("update "+table.name+" set "+OutputSqlArgumentsAndFieldNames(req.body,table.all_fields)+" where id=$"+(Object.keys(req.body).length+1)+" returning *")
			  pool.query("update "+table.name+" set "+OutputSqlArgumentsAndFieldNames(req.body,table.all_fields)+" where id=$"+(CountFieldNames(req.body,table.all_fields)+1)+" returning *", [...OutputBodyData(req.body,table.all_fields),req.params.id] , (error, results) => {
				  if (error) {
					throw error
				  }
				  res.status(200).json(results.rows)
			})
		  } else {
			res.status(400).json("Missing id or invalid fields! Valid fields are: "+OutputRequiredFieldNames(table.all_fields));
		  }});
	  app.delete("/"+table.name+"/delete/:id",
		  (req,res)=>{
		  if (req.params.id) { 
			  pool.query("delete from "+table.name+" where id=$1 returning *", [req.params.id] , (error, results) => {
				  if (error) {
					throw error
				  }
				  res.status(200).json(results.rows)
			})
		  } else {
			res.status(400).json("Missing id!")
		  }});
  })