require("dotenv").config();

const express =
    require("express");

const cors =
    require("cors");

const fetch =
    require("node-fetch");

const app =
    express();

/*
    MIDDLEWARE
*/
app.use(cors());

app.use(express.json());

/*
    ROOT
*/
app.get("/", (req,res)=>{

    res.json({

        message:
            "SMS Backend Running"

    });

});

/*
    SEND SMS
*/
app.post(
    "/api/send-sms",
    async(req,res)=>{

        try{

            let {
                phone,
                message
            } = req.body;

            if(
                !phone ||
                !message
            ){

                return res.status(400).json({

                    success:false,

                    message:
                        "Missing phone or message"

                });

            }

            phone =
                phone.trim();

            /*
                09xxxxxxxxx
                =>
                639xxxxxxxxx
            */
            if(
                phone.startsWith("09")
            ){

                phone =
                    "63" + phone.slice(1);

            }

            /*
                +639xxxxxxxxx
                =>
                639xxxxxxxxx
            */
            if(
                phone.startsWith("+63")
            ){

                phone =
                    phone.replace("+","");

            }

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
                                phone,

                            message:
                                message

                        })

                    }

                );

            const data =
                await response.json();

            console.log(data);

            return res.json({

                success:true,

                data

            });

        }catch(error){

            console.log(error);

            return res.status(500).json({

                success:false,

                message:
                    "SMS sending failed"

            });

        }

    }
);

/*
    SERVER
*/
const PORT =
    process.env.PORT || 8080;

app.listen(PORT, ()=>{

    console.log(
        `SMS Server running on port ${PORT}`
    );

});