import mongo from "mongoose";

import logger from "../utils/logger";

export default {
	async connect() {
		const url = Boolean(process.env.TEST) ? process.env.TEST_MONGO_URL : process.env.MONGO_URL;

		if (url) {
			try{
				await mongo.connect(url, {
						useNewUrlParser: true,
						useFindAndModify: true,
						useUnifiedTopology: true,
						useCreateIndex: true,
					});
				logger.info("DB connected!");
			} catch(err) {
				logger.error(err);
			}
		}
	}
}