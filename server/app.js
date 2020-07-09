const express = require('express') 
const app = express() 
const port = 3005 
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`)) 
const Pool = require('pg').Pool 

  
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

const getUsers = (request, response) => {
    pool.query('SELECT * FROM signs', (error, results) => {
      if (error) {
		response.status(500).json(error.message)
      } else {
		response.status(200).json(results.rows)
	  }
    })
}

app.get('/', getUsers)