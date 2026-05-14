const mongoose =
    require("mongoose");

const NewsSchema =
    new mongoose.Schema(

        {

            title:String,

            category:String,

            priority:String,

            date:String,

            audience:String,

            pinned:String,

            message:String

        },

        {

            timestamps:true

        }

    );




NewsSchema.virtual("id").get(function(){

    return this._id.toHexString();

});

NewsSchema.set(
    "toJSON",
    {
        virtuals: true,
        transform: function(doc, ret) {
            ret.id = ret._id.toString();
            return ret;
        }
    }
);

NewsSchema.set(
    "toObject",
    {
        virtuals:true
    }
);



module.exports =
    mongoose.model(
        "News",
        NewsSchema
    );

