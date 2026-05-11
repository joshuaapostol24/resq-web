require("dotenv").config({
    quiet:true
});

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
    process.env.MONGO_URI,
    {
        family:4
    }
)
.then(() => {

    console.log(
        "MongoDB Connected"
    );

})
.catch(err => {

    console.log(
        "MongoDB Error:"
    );

    console.log(err);

});

/*
    NEWS API
*/
app.use(
    "/api/news",
    newsRoutes
);

/*
    RISK REPORT ROUTE
*/
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