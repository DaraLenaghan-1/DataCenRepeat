//import modules
const database = require("./database")
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require('body-parser');

const port = 3000;
const app = express();

//Using Mongoose to connect to database
main().catch(err => console.log(err));
async function main() {
   //await mongoose.connect('mongodb://localhost:27017/employeesDB');
   await mongoose.connect('mongodb://127.0.0.1:27017');

} 

//define a schema for employees in mongoose
const employeeSchema = new mongoose.Schema({
    _id: String,
    phone: String,
    email: String
});

//use the schema in a model
const employeeModel = mongoose.model('employees', employeeSchema)

//used for indentation in json output
app.set('json spaces', 2)
app.set('view engine', "ejs");

// Add the body parser to the app
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
 
//HOME PAGE
app.get("/", (req, res) => {
    res.send(
        `
        <a href="http://localhost:${port}/employees">Employees</a><br/>
        <a href="http://localhost:${port}/depts">Departments</a><br/>
        <a href="http://localhost:${port}/employeesMongoDB">Employees(MongoDB)</a>
        `
    )
})

//GET AND POST FOR MONGODB
app.get("/employeesMongoDB", (req, res) => {
    employeeModel.find((error, employees) => {
        res.render("showEmployeesMongo", { "employees": employees })
    })
});

app.get("/employeesMongoDB/add", (req, res) => {
    res.render("addMongo")
})

app.post("/employeesMongoDB/add", (req, res) => {
    //make sure the ID is also in the mysql database
    var isEmployeeFound = false;
    database.getEmployees()
        .then((employees) => {

            employees.forEach(employee => {
                if (req.body._id == employee.eid) {
                    console.log(employee)
                    isEmployeeFound = true;
                    console.log(isEmployeeFound);
                }
            })
            if (isEmployeeFound == false) {
                res.send(`
                    <h1>Error</h1>
                    <br/><br/>
                    <h2>Error: EID ${req.body._id} doesnt exist in MySQL Database</h2>
                    <a href="http://localhost:${port}/">Home</a>
                    `)
                return;
            }
            var employee = new employeeModel(req.body);
            employee.save((error, result) => {
                if (error) {
                    res.send(`
                        <h1>Error</h1>
                        <br/><br/>
                        <h2>Error: ID ${req.body._id} already exists in MongoDB</h2>
                        <a href="http://localhost:${port}/">Home</a>
                        `)
                    return;
                }
                res.redirect("/employeesMongoDB")
            });
        })
        .catch((error) => {
            console.log("pool error " + error)
        })
})


//GET AND POST FOR EMPLOYEES MYSQL
app.get("/employees", (req, res) => {
    database.getEmployees()
        .then((employees) => {
            res.render("showEmployees", { "employees": employees })

        })
        .catch((error) => {
            console.log("pool error " + error)
        })
})

app.get("/employees/edit/:eid", (req, res) => {
    database.getEmployees()
        .then((employees) => {
            employees.forEach(employee => {
                if (req.params.eid == employee.eid) {
                    res.render("edit", { "employee": employee })
                }
            });

        })
        .catch((error) => {
            console.log("pool error " + error)
        })
})

app.post("/employees/edit/:eid", (req, res) => {
    database.editEmployee(req.params.eid, req.body)
        .then((data) => {
            res.redirect("/employees")
        })
        .catch((error) => {
            res.send(error)
        })
})

//GET METHODS FOR DEPARTMENTS MYSQL
app.get("/depts", (req, res) => {
    database.getDepartments()
        .then((departments) => {
            res.render("showDepartments", { "departments": departments })

        })
        .catch((error) => {
            console.log("pool error " + error)
        })
})

app.get("/depts/delete/:did", (req, res) => {
    database.deleteDepartment(req.params.did)
        .then((data) => {
            res.redirect("/depts")
        })
        .catch((error) => {
            console.log(error)
            res.send(`
        <h1>Could not remove department ${req.params.did} since there is employees assigned to it!</h1>
        <a href="http://localhost:3000/">Home</a>
        `)
        })
})


app.listen(port, () => console.log(`Visit http://localhost:${port}`))
