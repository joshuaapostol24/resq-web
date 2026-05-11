const express =
    require("express");

const fetch =
    require("node-fetch");

const router =
    express.Router();

async function notifyUsersOfNews(newsItem){

    try{

        const response =
            await fetch(

                "https://jpovamcznyzoemcnjrgs.supabase.co/functions/v1/send-news-push",

                {

                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body: JSON.stringify({

                        title:
                            newsItem.title,

                        message:
                            newsItem.message,

                        category:
                            newsItem.category,

                        priority:
                            newsItem.priority

                    })

                }

            );

        const result =
            await response.json();

        console.log(
            "Push notification sent:",
            result
        );

    }catch(err){

        console.error(

            "Push notification failed:",

            err

        );

    }

}

const News =
    require("../models/News");

router.post(
    "/create",
    async (req, res) => {

        try {

            console.log(req.body);

            const news =
                new News(req.body);

            await news.save();
            
            notifyUsersOfNews(news);

            res.json({
                success: true
            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                success: false,
                error: error.message
            });

        }

    }
);

router.get(
    "/all",
    async (req, res) => {

        try {

            const news =
                await News.find()
                .sort({
                    createdAt: -1
                });

            res.json(news);

        } catch (error) {

            console.log(error);

            res.status(500).json({
                success: false
            });

        }

    }
);

router.get(
    "/public",
    async (req, res) => {
        try {
            const news =
                await News.find()
                .sort({ createdAt: -1 });
            res.json(news);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
);

module.exports =
    router;