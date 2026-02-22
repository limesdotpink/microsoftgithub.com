import { SupabaseAdmin } from "../../lib/supabase-admin";

import getSiteParams from "../../lib/getSiteParams";

export default async function handler(req, res) {
  const siteParams = await getSiteParams(req.headers.host);
  try {
    const {
      data: {
        [0]: { view_count: rickrolledUsers },
      },
    } = await SupabaseAdmin.from("pages")
      .select("view_count")
      .filter("slug", "eq", `${siteParams.supabaseKeyPrefix}-user`);

    const {
      data: {
        [0]: { view_count: rickrolledCrawlers },
      },
    } = await SupabaseAdmin.from("pages")
      .select("view_count")
      .filter("slug", "eq", `${siteParams.supabaseKeyPrefix}-crawler`);

    let jsonStats = {
      rickrolled: {
        users: rickrolledUsers,
        bots: rickrolledCrawlers,
      },
    };

    jsonStats.rickrolled.total =
      jsonStats.rickrolled.users + jsonStats.rickrolled.bots;

    // we convert to thousands (e.g. 1275 => 1.3)
    function calcK(key) {
      return Math.round(jsonStats.rickrolled[key] / 100) / 10;
    }

    jsonStats.rickrolled.kusers = calcK("users");
    jsonStats.rickrolled.kbots = calcK("bots");
    jsonStats.rickrolled.ktotal = calcK("total");

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(jsonStats);
  } catch (e) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).send(`error: ${e}`);
  }
}
