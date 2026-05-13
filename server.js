
require("dotenv").config({
    quiet:true
});
const fetch =
    require("node-fetch");

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
    process.env.MONGODB_URL,
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
    WEATHER RISK API
*/
app.use(
    "/api/weather-risk",
    require("./server/routes/weatherRiskRoutes")
);

/*
    LOGIN API
*/
app.post(
    "/api/login",
    async(req,res)=>{

        const {
            email,
            password
        } = req.body;

        if(

            email === "admin@resq.com"

            &&

            password === "admin123"

        ){

            return res.json({

                success:true,

                role:"admin"

            });

        }

        return res.status(401).json({

            success:false,
            message:"Invalid credentials"

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