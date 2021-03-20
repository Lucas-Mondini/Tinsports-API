import mongo from "mongoose"

export default { 
	async connect() {
		const url = process.env.MONGO_URL;
		if (url)
		try{
			await mongo.connect(url, 
				{
					useNewUrlParser: true,
					useFindAndModify: true,
					useUnifiedTopology: true,
					useCreateIndex: true,
				});
				console.log("Conectou irmão!\n");
		}catch(err)
			{
				console.log("\nunable to connect: ", err);
			}
		}
	}