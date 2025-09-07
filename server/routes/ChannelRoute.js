import {Router} from 'express';
import ChannelController from "../controllers/ChannelController.js";
import {verifyToken} from "../middlewares/AuthMiddleware.js";

const channelRouter=new Router();

channelRouter.post("/create-channel",verifyToken,ChannelController.createChannel);
channelRouter.get("/get-user-channels",verifyToken,ChannelController.getUserChannels);
channelRouter.get("/get-channel-messages/:channelId",verifyToken,ChannelController.getChannelMessages);
export default channelRouter;