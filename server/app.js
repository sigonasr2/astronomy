const express = require('express') 
const app = express() 
const port = 3005 
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`)) 
const Pool = require('pg').Pool 

const pool = 
new Pool({
  user: 'postgres',
  password: '',
  host: 'postgres',
  database: 'astronomy',
  port: 5432,
})

const getUsers = (request, response) => {
    pool.query('SELECT * FROM users', (error, results) => {
      if (error) {
		response.status(500).json(error.message)
      } else {
		response.status(200).json(results.rows)
	  }
    })
}

app.get('/', getUsers)