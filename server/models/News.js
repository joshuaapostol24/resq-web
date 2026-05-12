const mongoose =
    require("mongoose");

const newsSchema =
    new mongoose.Schema({

        title:{
            type:String,
            required:true
        },

        category:{
            type:String
        },

        priority:{
            type:String
        },

        date:{
            type:String
        },

        audience:{
            type:String
        },

        pinned:{
            type:String
        },

        message:{
            type:String
        }

    },

    {
        timestamps:true
    }

);

module.exports =

    mongoose.models.news ||

    mongoose.model(

        "news",

        newsSchema

    );