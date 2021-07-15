import mongo from "mongoose"

export default {
	async connect() {
		const url = Boolean(process.env.TEST) ? process.env.TEST_MONGO_URL : process.env.MONGO_URL;
		if (url)
		try{
			await mongo.connect(url,
				{
					useNewUrlParser: true,
					useFindAndModify: true,
					useUnifiedTopology: true,
					useCreateIndex: true,
				});
				console.log("DB connected!\n");
		}catch(err)
			{
				console.log("\nunable to connect: ", err);
			}
		}
	}