const express =
    require("express");

    
const router =
    express.Router();

async function notifyUsersOfNews(newsItem){

    try{

        const response =
            await fetch(
                "https://jpovamcznyzoemcnjrgs.supabase.co/functions/v1/send-news-notification",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwb3ZhbWN6bnl6b2VtY25qcmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODMwMTcsImV4cCI6MjA5MzQ1OTAxN30.1WTdf3j4F6z-attUvvPi5Z7i8Q81hB4hhQtpyrgU8ao",

                        "apikey":
                            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwb3ZhbWN6bnl6b2VtY25qcmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODMwMTcsImV4cCI6MjA5MzQ1OTAxN30.1WTdf3j4F6z-attUvvPi5Z7i8Q81hB4hhQtpyrgU8ao"
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

            console.log(
                "Incoming News:"
            );

            console.log(req.body);

            const news =
                new News({

                    title:
                        req.body.title,

                    category:
                        req.body.category,

                    priority:
                        req.body.priority,

                    date:
                        req.body.date,

                    audience:
                        req.body.audience,

                    pinned:
                        req.body.pinned,

                    message:
                        req.body.message

                });

            await news.save();

            console.log(
                "News saved successfully"
            );

           // notifyUsersOfNews(news);

            res.json({
                success: true
            });

        } catch (error) {

            console.log(
                "NEWS SAVE ERROR:"
            );

            console.log(error);

            console.log(
                error.message
            );

            res.status(500).json({

                success: false,

                error:
                    error.message

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