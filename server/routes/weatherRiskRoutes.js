const express =
    require("express");

const fetch =
    (...args) =>
        import("node-fetch")
        .then(({default: fetch}) =>
            fetch(...args)
        );

const router =
    express.Router();

router.get(
    "/:lat/:lon",
    async(req,res)=>{

        try{

            const lat =
                req.params.lat;

            const lon =
                req.params.lon;

            const apiKey =
                process.env.OPENWEATHER_API_KEY;

            const response =
                await fetch(

                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`

                );

            const data =
                await response.json();

            let riskLevel =
                "Low";

            const rainfall =
                data.rain
                ? data.rain["1h"] || 0
                : 0;

            const wind =
                data.wind.speed;

            if(
                rainfall > 20 ||
                wind > 15
            ){

                riskLevel =
                    "High";

            }else if(
                rainfall > 10 ||
                wind > 8
            ){

                riskLevel =
                    "Moderate";

            }

            res.json({

                success:true,

                city:
                    data.name,

                temperature:
                    data.main.temp,

                weather:
                    data.weather[0].main,

                rainfall,

                windSpeed:
                    wind,

                humidity:
                    data.main.humidity,

                riskLevel

            });

        }catch(error){

            console.log(error);

            res.status(500).json({

                success:false,

                error:error.message

            });

        }

    }
);

module.exports =
    router;