module.exports = (mongoose) => {
    mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const mongoCon = mongoose.connection;
    mongoCon.on("open", () => {
        console.log("Connected to MongoDB");
    });
};