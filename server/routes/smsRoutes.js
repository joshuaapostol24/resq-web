const express =
    require("express");

const fetch =
    require("node-fetch");

const router =
    express.Router();

router.post(
    "/send",
    async(req,res)=>{

        try{

            const {
                number,
                message
            } = req.body;

            const response =
                await fetch(

                    "https://www.iprogsms.com/api/v1/sms_messages",

                    {

                        method:"POST",

                        headers:{
                            "Content-Type":
                                "application/json"
                        },

                        body:JSON.stringify({

                            api_token:
                                process.env.IPROGSMS_API_TOKEN,

                            phone_number:
                                number,

                            message:
                                message

                        })

                    }

                );

            const data =
                await response.json();

            console.log(data);

            res.json({

                success:true,
                data

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

module.exports = router;

