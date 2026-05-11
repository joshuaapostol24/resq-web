const express =
    require("express");

const mongoose =
    require("mongoose");

const cors =
    require("cors");

const path =
    require("path");

const newsRoutes =
    require("./server/routes/newsRoutes");

const app =
    express();

/*
    MIDDLEWARE
*/
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended:true
}));

/*
    SERVE ENTIRE PROJECT
*/
app.use(
    express.static(__dirname)
);

/*
    MONGODB
*/
mongoose.connect(
    "mongodb://batutoytria_db_user:October1001%21%40%23@ac-cmgnn9t-shard-00-00.rvgegja.mongodb.net:27017,ac-cmgnn9t-shard-00-01.rvgegja.mongodb.net:27017,ac-cmgnn9t-shard-00-02.rvgegja.mongodb.net:27017/?ssl=true&replicaSet=atlas-6e6lj1-shard-0&authSource=admin&appName=resq-cluster"
)
.then(() => {

    console.log(
        "MongoDB Connected"
    );

})
.catch(err => {

    console.log(err);

});

/*
    NEWS API
*/
app.use(
    "/api/news",
    newsRoutes
);

//risk report route
app.use(
    "/api/risk-report",
    require("./server/routes/riskReportRoutes")
);

/*
    LOGIN API
*/
app.post(
    "/api/login",
    async(req,res)=>{

        const {
            username,
            password
        } = req.body;

        if(
            username === "admin" &&
            password === "admin123"
        ){

            return res.json({

                success:true,

                redirect:
                    "/DASHBOARD/dashboard.html"

            });

        }

        res.status(401).json({

            success:false,

            message:
                "Invalid username or password"

        });

    }
);

/*
    START WITH LOGIN PAGE
*/
app.get("/", (req,res)=>{

    res.sendFile(
        path.join(
            __dirname,
            "LOGIN",
            "login.html"
        )
    );

});

/*
    SERVER
*/
const PORT =
    process.env.PORT || 8080;

app.listen(PORT, ()=>{

    console.log(
        `Server running on port ${PORT}`
    );

});