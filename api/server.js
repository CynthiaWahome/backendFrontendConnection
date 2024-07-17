const express = require('express');
const app = express();
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt =require('bcrypt');

app.use(express.json());
app.use(cors());
dotenv.config()

app.get('', (req,res) => {
    res.send("Evening session")
})


// connection to the database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})

// test connection
db.connect((err) => {
    // if connection does not work
    if (err) return console.log("Error connecting to mySQL")

    // connection work
    console.log("Connected to mySQL as id: ", db.threadId);

    
// create a db
db.query(`CREATE DATABASE IF NOT EXISTS expense_tracker`, (err, result) => {
    // error creating db
    if(err) return console.log("error creating database")

    // if no error creating db
    console.log("db expense_tracker created/checked successfully");

    // select the expense_tracker db
    db.changeUser({database:'expense_tracker'}, (err, result) => {
        // if error changing db
        if(err) return console.log("Error changing db")

        // if no error changing db
        console.log("db expense_tracker is in use");

        // create table
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL UNIQUE,
                username VARCHAR(50) NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        `;
        db.query(createUsersTable, (err, result) => {
            // if error
            if (err) return console.log("error creating table")

            // if no error
            console.log("Users tables is created successfully")
        })        
    })
})

})


//user registration
app.post('/api/register', async(req, res) => {
    try{
        const users = `SELECT * FROM users WHERE email = ?`
        db.query(users, [req.body.email],(err, data) => {
            // email exists
            if(data.length > 0) return res.status(409).json("User already exists")

            // if no email exists
            // password hashing
            const salt = bcrypt.genSaltSync(10)
            const hashedPassword = bcyrpt.hashSync(req.body.password, salt)
            // create new user
            const newUser = `INSERT INTO users(email, username, password) ?)`
            value = [req.body.email, req.body.username, req.body.hashedPassword]

            db.query(newUser, [value], (err, dayta) => {
                // If insert user fail
                if (err) return res.status(400).json("Something went wrong")
                // If insert user works successfully
                res.status(200).json("User Created Successfully");
            })
        } )
    }
    catch(err) {
        res.status(500).json("Internal Server Error");
    }
})

// user login
app.post('/api/login', async(req, res) => {
    try{
        const users = `SELECT * FROM users WHERE email =?`
        db.query(users, [req.body.email], (err, data) => {
            // If user not found
            if(data.length === 0) return res.status(404).json("User Not Found");

            // if user exists
            const isPasswordValid = bcrypt.compareSync(req.body.password, data[0].password)

            if(!isPasswordValid) return res.status(400).json("Invalid password or email")

            // password and email match
            return res.status(201).json("Login Successful!")
        })

    }
    catch(err) {
        res.status(500).json("Internal Server Error")
    }
})



// running the server 
app.listen(3000, () => {
    console.log("Server is running on port 3000!!")
})