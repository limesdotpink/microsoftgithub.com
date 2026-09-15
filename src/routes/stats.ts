import { type Request, type Response } from "express";

import { getSiteParams } from "../utils/getSiteParams";
import { getUsageStats } from "../utils/usageStats";

export const stats = async (req: Request, res: Response) => {
    const siteParams = await getSiteParams(req.host);

    res.json(await getUsageStats(siteParams.site))
};
