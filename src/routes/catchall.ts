import { type Request, type Response } from "express";
import { detectRobot } from "../utils/detectRobot";
import { parse } from "node-html-parser";
import { decode } from "he";
import { getSiteParams } from "../utils/getSiteParams";
import { ProxyAgent, fetch as undiciFetch } from "undici";

import { bumpStat } from "../utils/usageStats";

export const catchall = async (req: Request, res: Response) => {
    const proxyUrl = process.env.PROXY_URL;
    async function proxyFetch(actualUrl: string) {
        if (proxyUrl) {
            const dispatcher = new ProxyAgent(proxyUrl);

            return await undiciFetch(actualUrl, { method: "GET", dispatcher });
        } else {
            req.log.warn(
                `no proxy url provided, falling back to raw request for ${actualUrl}`,
            );
            return await undiciFetch(actualUrl, {
                method: "GET",
            });
        }
    }

    const host = req.host;
    const siteParams = await getSiteParams(host);

    // stats (literally ONLY tracks the number of page views)
    try {
        if (detectRobot(req.headers["user-agent"] || "bot")) {
            // increment the redirect count for crawlers
            await bumpStat(siteParams.site, 'bot')
        } else {
            // increment the redirect count for users
            await bumpStat(siteParams.site, 'user')
        }
    } catch (e) {
        req.log.warn(`looks like the db died.\n${JSON.stringify(e)}`);
    }

    let baseUrl = host.split(":")[0];
    const path = req.params.path ? [...req.params.path].join("/") : "";

    siteParams.urlReplace.fake.forEach((u) => {
        baseUrl = baseUrl.replace(u, siteParams.urlReplace.real);
    });

    // catch local testing, or if the url hasn't been changed for some reason
    if (baseUrl === "localhost" || baseUrl === host) {
        baseUrl = siteParams.urlReplace.real;
        req.log.warn(
            `unmodified url https://${host}/${path}, replacing with https://${baseUrl}/${path}`,
        );
    }

    let actualUrl = `https://${baseUrl}/${path}`;

    // nintendo.uk.net specific: if fetching the root path, fall back to en-gb
    if (
        actualUrl === "https://nintendo.com/" ||
        actualUrl === "https://www.nintendo.com/"
    ) {
        actualUrl = "https://www.nintendo.com/en-gb/";
    }

    // we check if the user has been rickrolled on this page before
    const rickrolled = Boolean(
        req.cookies?.[`${encodeURIComponent(`${baseUrl}/${path}`)}`],
    );
    // if not, we set a cookie
    if (!rickrolled) {
        res.setHeader(
            "Set-Cookie",
            `${encodeURIComponent(`${baseUrl}/${path}`)}==1; path=/; Max-Age=300`,
        );
    }

    // fetch the actual page
    let fetchActualPage = await undiciFetch(actualUrl, {
        method: "GET",
    });

    // use proxy if raw request fails. do not attempt to fetch 4xx and 5xx errors with proxy
    if (!fetchActualPage.ok) {
        const scs = fetchActualPage.status.toString();
        if (!scs.startsWith("4") || !scs.startsWith("5")) {
            fetchActualPage = await proxyFetch(actualUrl);
        }
    }

    let pageData = {};

    if (fetchActualPage.headers.get("content-type")?.includes("html")) {
        const actualPage = await fetchActualPage.text();

        const actualPageDom = parse(actualPage);

        // extrapolate the title, description, and image
        pageData = {
            title:
                decode(actualPageDom.querySelector("title")?.innerHTML || "") ||
                "",

            description:
                actualPageDom
                    .querySelector("meta[name='description']")
                    ?.getAttribute("content") ||
                actualPageDom
                    .querySelector("meta[property='description']")
                    ?.getAttribute("content") ||
                "",

            image:
                actualPageDom
                    .querySelector("meta[property='twitter:image']")
                    ?.getAttribute("content") ||
                actualPageDom
                    .querySelector("meta[name='twitter:image']")
                    ?.getAttribute("content") ||
                actualPageDom
                    .querySelector("meta[property='og:image']")
                    ?.getAttribute("content") ||
                actualPageDom
                    .querySelector("meta[name='og:image']")
                    ?.getAttribute("content") ||
                "",

            imageAlt:
                actualPageDom
                    .querySelector("meta[property='twitter:image:alt']")
                    ?.getAttribute("content") ||
                actualPageDom
                    .querySelector("meta[name='twitter:image:alt']")
                    ?.getAttribute("content") ||
                actualPageDom
                    .querySelector("meta[property='og:image:alt']")
                    ?.getAttribute("content") ||
                actualPageDom
                    .querySelector("meta[name='og:image:alt']")
                    ?.getAttribute("content") ||
                "",

            twitterCard:
                actualPageDom
                    .querySelector("meta[property='twitter:card']")
                    ?.getAttribute("content") ||
                actualPageDom
                    .querySelector("meta[name='twitter:card']")
                    ?.getAttribute("content") ||
                "",

            twitterSite:
                actualPageDom
                    .querySelector("meta[property='twitter:site']")
                    ?.getAttribute("content") ||
                actualPageDom
                    .querySelector("meta[name='twitter:site']")
                    ?.getAttribute("content") ||
                "",

            ogSiteName:
                actualPageDom
                    .querySelector("meta[property='og:site_name']")
                    ?.getAttribute("content") ||
                actualPageDom
                    .querySelector("meta[property='og:site_name']")
                    ?.getAttribute("content") ||
                "",

            favicon:
                actualPageDom
                    .querySelector("link[rel='icon']")
                    ?.getAttribute("href") ||
                actualPageDom
                    .querySelector("link[rel='shortcut icon']")
                    ?.getAttribute("href") ||
                "",
        };
    }

    /* if the user has already been rickrolled by the page, we redirect to the actual repo.
     * we can bypass this by setting process.env.ALWAYS_RICKROLL
     */
    const redirectUrl =
        rickrolled && !process.env.ALWAYS_RICKROLL
            ? actualUrl
            : "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

    const context = {
        pageData,
        path,
        redirectUrl,
        host,
        siteParams,
        layout: false,
    };

    res.render("catchall", context);
};
