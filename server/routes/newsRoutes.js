
const express =
    require("express");

const router =
    express.Router();

const fetch = require("node-fetch");


async function notifyUsersOfNews(newsItem){
    console.log("notifyUsersOfNews called with:", newsItem.title);
    try{

        const response =
            await fetch(

                "https://jpovamcznyzoemcnjrgs.supabase.co/functions/v1/send-news-notification",

                {

                    method:"POST",

                    headers:{

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwb3ZhbWN6bnl6b2VtY25qcmdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg4MzAxNywiZXhwIjoyMDkzNDU5MDE3fQ.A8XUmo61hrxr1nGm0kICPZsDvUAgUhcA5-Gz4Z6Qak0",

                    },

                    body:JSON.stringify({

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
            process.stdout.write("STEP 1 - route hit");
            
            const news = new News({
                title: req.body.title,
                category: req.body.category,
                priority: req.body.priority,
                date: req.body.date,
                audience: req.body.audience,
                pinned: req.body.pinned,
                message: req.body.message
            });

            await news.save();
            process.stdout.write("STEP 2 - saved");

            await notifyUsersOfNews(news);
            process.stdout.write("STEP 3 - notify called");

            res.json({ success: true });

        } catch (error) {
            process.stdout.write("ERROR: " + error.message);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
);



/*
    DELETE NEWS
*/
router.delete(
    "/delete/:id",
    async(req,res)=>{

        try{

            const deletedNews =
                await News.findByIdAndDelete(
                    req.params.id
                );

            if(!deletedNews){

                return res.status(404).json({

                    success:false,

                    message:
                        "News not found"

                });

            }

            return res.json({

                success:true,

                message:
                    "News deleted successfully"

            });

        }catch(error){

            console.log(error);

            return res.status(500).json({

                success:false,

                message:
                    "Failed to delete news"

            });

        }

    }
);



router.get(
    "/all",
    async (req, res) => {

        try {
            console.log("ALL ROUTE V2 - with id mapping");
            const news =
                await News.find()
                .sort({ createdAt: -1 });

            const result =
                news.map(item => ({

                    _id: item._id.toString(),

                    id: item._id.toString(),

                    title: item.title,
                    category: item.category,
                    priority: item.priority,
                    date: item.date,
                    audience: item.audience,
                    pinned: item.pinned,
                    message: item.message

                }));

            res.json(result);

        } catch (error) {

            console.log(error);

            res.status(500).json({
                success:false
            });

        }

    }
);


router.get("/public", async (req, res) => {
    try {
        const news = await News.find().sort({ createdAt: -1 });
        // ✅ Use toJSON() so virtuals are applied
        res.json(news.map(item => item.toJSON()));
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
});
module.exports =
    router;