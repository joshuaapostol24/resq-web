const mongoose =
    require("mongoose");

const NewsSchema =
    new mongoose.Schema({

        title: String,

        category: String,

        priority: String,

        date: String,

        audience: String,

        pinned: String,

        message: String,

        createdAt: {

            type: Date,

            default: Date.now

        }

    });

module.exports =
    mongoose.model(
        "News",
        NewsSchema
    );