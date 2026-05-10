const express =
    require("express");

const router =
    express.Router();

/*
    GET RISK REPORT
*/
router.get(
    "/:barangay",
    async (req, res) => {

        try {

            const barangay =
                req.params.barangay;

            const rainfall =
                Math.floor(
                    Math.random() * 180
                );

            const humidity =
                Math.floor(
                    60 + Math.random() * 40
                );

            const wind_speed =
                Math.floor(
                    10 + Math.random() * 80
                );

            let risk_score = 0;

            risk_score += rainfall * 2;
            risk_score += humidity * 0.5;
            risk_score += wind_speed * 1.2;

            let risk_level = "LOW";

            if(risk_score >= 160){

                risk_level = "CRITICAL";

            } else if(risk_score >= 100){

                risk_level = "HIGH";

            } else if(risk_score >= 60){

                risk_level = "MODERATE";

            }

            let recommendations = [];

            if(risk_level === "CRITICAL"){

                recommendations = [

                    "Immediate evacuation recommended.",

                    "Deploy rescue responders.",

                    "Activate emergency response center.",

                    "Issue emergency SMS alerts."

                ];

            } else if(risk_level === "HIGH"){

                recommendations = [

                    "Prepare evacuation facilities.",

                    "Monitor flood-prone areas.",

                    "Alert barangay responders."

                ];

            } else if(risk_level === "MODERATE"){

                recommendations = [

                    "Monitor weather conditions.",

                    "Keep responders on standby."

                ];

            } else {

                recommendations = [

                    "Continue normal monitoring."

                ];

            }

            res.json({

                barangay,

                rainfall,

                humidity,

                wind_speed,

                risk_score:
                    Math.floor(risk_score),

                risk_level,

                recommendations

            });

        } catch(error){

            console.log(error);

            res.status(500).json({

                success:false,

                error:error.message

            });

        }

    }
);

/*
    SUMMARY
*/
router.get(
    "/summary",
    async (req, res) => {

        res.json({

            total:15,

            high:4,

            moderate:6,

            low:5

        });

    }
);

/*
    HISTORY
*/
router.get(
    "/history",
    async (req, res) => {

        res.json([]);

    }
);

/*
    SAVE REPORT
*/
router.post(
    "/",
    async (req, res) => {

        res.json({
            success:true
        });

    }
);

module.exports =
    router;