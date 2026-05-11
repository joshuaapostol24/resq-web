const express =
    require("express");

const router =
    express.Router();

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