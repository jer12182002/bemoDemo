const express = require('express');
const bodyParser = require('body-parser');
const mysql = require ('mysql');

const database_config = {
	host: 'localhost',
	user: 'root',
	password:'',
	database:'bemo',
	multipleStatements: true
}


var app = express();

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  /*var err = new Error('Not Found');
   err.status = 404;
   next(err);*/

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  // Pass to next layer of middleware
  next();
});


handleDisconnect = () => {    
	console.log("Disconnected because of Idle status, begin to re-connect...");
	connection = mysql.createConnection(database_config);

	connection.connect((err)=> {
		if(err) {
			console.log("Error when connectibng to database: ", err);
			setTimeout(handleDisconnect(),2000);
		}
	});

	connection.on('err', err=> {
		console.log('database error', err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST') {
			handleDisconnect();
		} else {
			throw err;
		}
	})
}



app.post('/login', (req, res) => {
	let accountInfo = req.body.accountInfo;
	let sqlQuery = `SELECT ID FROM account WHERE ACCOUNT = '${accountInfo.account}' and PASSWORD = '${accountInfo.password}';`;
	console.log(sqlQuery);
	connection.query(sqlQuery, (err, result) => {
		if(err) {
			res.send(err)
		}else {
			return res.json({data:result})
		}
	})
}) 


app.post('/home/addnewsection', (req,res) => {
	let newSection = req.body.newSection;
	console.log(newSection);
	let sqlQuery = `INSERT INTO section (TEXT) VALUES ('${newSection}');`;

	connection.query(sqlQuery, (err, result) => {
		if(err) {
			res.send(err);
		}else {
			return res.json({data:'success'});
		}
	});
});

app.post('/home/deletesection',(req,res) => {
	let section = req.body.section;

	let sqlQuery = `DELETE FROM section WHERE ID = '${section.ID}';`;

	connection.query(sqlQuery, (err, result) => {
		if(err) {
			res.send(err);
		}else {
			return res.json({data:'success'});
		}
	});
})


app.post('/home/applystyle', (req,res)=> {
	let section = req.body.section;
	console.log(section);

	let sqlQuery = `UPDATE section SET STYLE = '${section.STYLE}' WHERE ID = '${section.ID}';`;

	connection.query(sqlQuery, (err, result) => {
		if(err) {
			res.send(err);
		}else {
			return res.json({data:'success'});
		}
	});

})

app.get('/home/loadsections', (req,res) => {
	let sqlQuery = `SELECT * FROM section;`;

	connection.query(sqlQuery, (err, result) => {
		if(err) {
			res.send(err);
		}else {
			return res.json({data:result});
		}
	});
});

app.listen(8080, ()=>{
	console.log('Node server running on port 8080');
	handleDisconnect();

});