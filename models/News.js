const mongoose =
    require("mongoose");

const NewsSchema =
    new mongoose.Schema({

        title:{
            type:String,
            required:true
        },

        category:{
            type:String,
            default:"General News"
        },

        priority:{
            type:String,
            default:"Low"
        },

        date:{
            type:String
        },

        audience:{
            type:String,
            default:"All Residents"
        },

        pinned:{
            type:String,
            default:"No"
        },

        message:{
            type:String,
            required:true
        }

    },
    {
        timestamps:true
    }
);

module.exports =
    mongoose.model(
        "News",
        NewsSchema
    );