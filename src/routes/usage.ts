import { type Request, type Response } from "express";

import { getSiteParams } from "../utils/getSiteParams";
import { getUsageStats } from "../utils/usageStats";

export const usage = async (req: Request, res: Response) => {
    const siteParams = await getSiteParams(req.host);

    const fakeSiteArray = siteParams.urlReplace.fake;

    const fakeSiteElements = [
        `<code class="bg">${fakeSiteArray[0]}</code>`,
    ];

    if (fakeSiteArray.length > 1) {
        for (let i = 1; i < fakeSiteArray.length; i++) {
            let joiner = ", ";
            if (i === fakeSiteArray.length - 1) {
                joiner = " or ";
            }

            const el = `<code class="bg">${fakeSiteArray[i]}</code>`;
            fakeSiteElements.push(joiner);
            fakeSiteElements.push(el);
        }
    }

    const context = {
        layout: false,
        siteParams,
        stats: await getUsageStats(siteParams.site),
        fakeSites: fakeSiteElements.join(''),
    };

    res.render("usage", context);
};
