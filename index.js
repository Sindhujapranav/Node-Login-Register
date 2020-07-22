const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const objectID = mongodb.ObjectID;

const dbURL = "mongodb+srv://Sindhuja:FfB59VrmCx63LLKO@cluster0.szlk4.mongodb.net/Records?retryWrites=true&w=majority"

const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = process.env.PORT || 5000;

app.listen(port, () => console.log("your app is running in", port));

app.get("/", (req, res) => {
    res.send("<h1>Student and Staff Backend Running..! </h1>");
});

app.post("/StudentCreation", (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        client
            .db("Records")
            .collection("studentDetails")
            .insertOne(req.body, (err, data) => {
                if (err) throw err;
                client.close();
                console.log("Student Created successfully, Connection closed");
                res.status(200).json({
                    message: "Student Created..!!",
                });
            });
    });
});

app.post("/StaffCreation", (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        client
            .db('Records')
            .collection("staffDetails")
            .insertOne(req.body, (err, data) => {
                if (err) throw err
                client.close()
                console.log('User Created successfully, Connection closed')
                res.status(200).json({
                    message: 'User Created..!!'
                })
            })
    })
});

app.get("/Students", (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err;
        let db = client.db("Records");
        db.collection("studentDetails")
            .find()
            .toArray()
            .then((data) => {
                res.status(200).json(data);
            })
            .catch((err) => {
                res.status(404).json({
                    message: "No data Found or some error happen",
                    error: err,
                });
            });
    });
});

app.get("/GetAllStaff", (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err
        let db = client.db('Records')
        db.collection("staffDetails")
            .find()
            .toArray()
            .then(Data => {
                db.collection("studentDetails")
                    .find()
                    .toArray()
                    .then(data1 => {
                        let staff = Data.map((data) => {
                            let count = data1.filter((item) => item.staff_id == data.id)
                                .length;
                            return {
                                _id: data._id,
                                id: data.id,
                                name: data.name,
                                email: data.email,
                                student_count: count,
                            };
                        });
                        res.status(200).json(staff)
                    })
                //res.status(200).json(data)
            })
            .catch(err => {
                res.status(404).json({
                    message: 'No data Found or some error happen',
                    error: err
                })
            })
    })
});

app.put("/StudentCreation/:id", (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err;
        client
            .db("Records")
            .collection("studentDetails")
            .findOneAndUpdate({ _id: objectID(req.params.id) }, { $set: req.body })
            .then((data) => {
                console.log("Student data update successfully..!!");
                client.close();
                res.status(200).json({
                    message: "Student data updated..!!",
                });
            });
    });
});

app.delete("/StudentCreation/:id", (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err;
        client
            .db("Records")
            .collection("studentDetails")
            .deleteOne({ _id: objectID(req.params.id) }, (err, data) => {
                if (err) throw err;
                client.close();
                res.status(200).json({
                    message: "Student deleted...!!",
                });
            });
    });
});

app.put("/StaffCreation/:id", (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err;
        client
            .db("Records")
            .collection("staffDetails")
            .findOneAndUpdate({ _id: objectID(req.params.id) }, { $set: req.body })
            .then((data) => {
                console.log("Staff data update successfully..!!");
                client.close();
                res.status(200).json({
                    message: "Staff data updated..!!",
                });
            });
    });
});

app.delete("/StaffCreation/:id", (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err;
        client
            .db("Records")
            .collection("staffDetails")
            .deleteOne({ _id: objectID(req.params.id) }, (err, data) => {
                if (err) throw err;
                client.close();
                res.status(200).json({
                    message: "Staff deleted...!!",
                });
            });
    });
});


app.post("/register", (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err;
        let db = client.db("Records");
        db.collection("users").findOne({ email: req.body.email }, (err, data) => {
            if (err) throw err;
            if (data) {
                res.status(400).json({ message: "Email already exists..!!" });
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(req.body.password, salt, (err, cryptPassword) => {
                        if (err) throw err;
                        req.body.password = cryptPassword;
                        db.collection("users").insertOne(req.body, (err, result) => {
                            if (err) throw err;
                            client.close();
                            res
                                .status(200)
                                .json({ message: "Registration successful..!! " });
                        });
                    });
                });
            }
        });
    });
});


app.get("/register", (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err;
        let db = client.db("Records");
        db.collection("users")
            .find()
            .toArray()
            .then((data) => {
                res.status(200).json(data);
            })
            .catch((err) => {
                res.status(404).json({
                    message: "No data Found or some error happen",
                    error: err,
                });
            });
    });
});


app.post("/login", (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err;
        client
            .db("Records")
            .collection("users")
            .findOne({ email: req.body.email }, (err, data) => {
                if (err) throw err;
                if (data) {
                    bcrypt.compare(req.body.password, data.password, (err, validUser) => {
                        if (err) throw err;
                        if (validUser) {
                            jwt.sign(
                                { userId: data._id, email: data.email },
                                "uzKfyTDx4v5z6NSV",
                                { expiresIn: "1h" },
                                (err, token) => {
                                    res.status(200).json({ message: "Login success..!!", token });
                                }
                            );
                        } else {
                            res
                                .status(403)
                                .json({ message: "Bad Credentials, Login unsuccessful..!!" });
                        }
                    });
                } else {
                    res.status(401).json({
                        message: "Email is not registered, Kindly register..!!",
                    });
                }
            });
    });
});


app.get("/login", (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err;
        let db = client.db("Records");
        db.collection("users")
            .find()
            .toArray()
            .then((data) => {
                res.status(200).json(data);
            })
            .catch((err) => {
                res.status(404).json({
                    message: "No data Found or some error happen",
                    error: err,
                });
            });
    });
});
app.get("/home", authenticatedUser, (req, res) => {
    res.status(200).json({
        message: "Only Authenticated Staff users can see this message..!!!",
    });
});


function authenticatedUser(req, res, next) {
    if (req.headers.authorization == undefined) {
        res.status(401).json({
            message: "No token available in headers",
        });
    } else {
        jwt.verify(
            req.headers.authorization,
            "uzKfyTDx4v5z6NSV",
            (err, decodedString) => {
                if (decodedString == undefined) {
                    res.status(401).json({ message: "Invalid Token" });
                } else {
                    console.log(decodedString);
                    next();
                }
            }
        );
    }
}

