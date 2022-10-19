const sqlite3 = require("sqlite3");

const morgan = require("morgan");

const express = require("express");
const bodyParser = require("body-parser");
const port = process.env.PORT || 8080;
const app = express();

// Database from file
const db = new sqlite3.Database(__dirname + "/database.sqlite"); // Created if it does not exist
// OR in memory only
//const db = new sqlite3.Database(':memory:');
//db.run("CREATE TABLE webusers (username TEXT)");

app.use(morgan("dev"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
	res.send("Nothing to see here");
});

const CREATE_CARS =
	"CREATE TABLE if not exists cars (carID INTEGER PRIMARY KEY AUTOINCREMENT, make TEXT, model TEXT, year INTEGER, drive TEXT, fuel TEXT);";
const DROP_CARS = "DROP TABLE if exists cars;";

app.get("/create", (req, res) => {
	db.run(CREATE_CARS);
	res.send("Table created");
});

app.get("/drop", (req, res) => {
	db.run(DROP_CARS);
	res.send("Table dropped");
});

app.get("/reset", (req, res) => {
	db.run(DROP_CARS, () => {
		console.log("Table dropped ...");
		db.run(CREATE_CARS, () => {
			console.log("...  and re-created");

			db.run(
				"INSERT INTO cars (make, model, year, drive, fuel) VALUES ('Volvo', '850R', '1997', 'RWD', 'Petrol');"
			);
			db.run(
				"INSERT INTO cars (make, model, year, drive, fuel) VALUES ('Toyota', 'Supra', '2022', 'RWD', 'Petrol');"
			);
			db.run(
				"INSERT INTO cars (make, model, year, drive, fuel) VALUES ('Lamborghini', 'HURACÁN PERFORMANTE', '2022', 'AWD', 'Petrol');"
			);
			db.run(
				"INSERT INTO cars (make, model, year, drive, fuel) VALUES ('Tesla', 'Model X', '2022', 'AWD', 'Electric');"
			);
		});
	});

	res.send("Table reset (dropped and re-created)");
});

app.get("/show", (req, res) => {
	let data = [];
	db.serialize(() => {
		db.each(
			"SELECT * FROM cars;",
			(err, row) => {
				console.log(row.make);
				data.push(row);
			},
			() => {
				res.send(data);
			}
		);
	});
});

//use postman
app.get("/make", (req, res) => {
	console.log(req.body);

	let make = req.body.make;
	let data = [];
	db.serialize(() => {
		db.each(
			"SELECT * FROM cars WHERE make='" + make + "';",
			(err, row) => {
				console.log(row.make);
				data.push(row);
			},
			() => {
				res.send(data);
			}
		);
	});
});

//use postman
app.post("/addcar", (req, res) => {
	console.log(req.body);

	let make = req.body.make;
	let model = req.body.model;
	let year = req.body.year;
	let drive = req.body.drive;
	let fuel = req.body.fuel;

	db.run(
		`INSERT INTO cars (make, model, year, drive, fuel) VALUES (${make}, ${model}, ${year}, ${drive}, ${fuel});`
	);
	/*
    {
        "make": "BMW",
        "model": "M5",
        "year": 2005,
        "drive": "RWD", 
        "fuel":"Petrol"
    }
    */
	res.send("Saved");
});

app.listen(port, () => console.log("Server is running on port:", port));
