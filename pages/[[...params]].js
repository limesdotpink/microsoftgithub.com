import Head from "next/head";
import { SupabaseAdmin } from "../lib/supabase-admin";
import { detectRobot } from "../lib/detectRobot";
import { parse } from "node-html-parser";
import { decode } from "he";
import getSiteParams from "../lib/getSiteParams";

export async function getServerSideProps({ req, res, query }) {
  const host = req.headers.host;
  const siteParams = await getSiteParams(host);

  // stats (literally ONLY tracks the number of page views)
  try {
    if (detectRobot(req.headers["user-agent"])) {
      // increment the redirect count for crawlers
      await SupabaseAdmin.rpc("increment_page_view", {
        page_slug: `${siteParams.supabaseKeyPrefix}-crawler`,
      });
    } else {
      // increment the redirect count for users
      await SupabaseAdmin.rpc("increment_page_view", {
        page_slug: `${siteParams.supabaseKeyPrefix}-user`,
      });
    }
  } catch (e) {
    console.log("looks like supabase died.", e);
  }

  let baseUrl = host;

  // for local testing
  if (baseUrl === "localhost:3000") {
    baseUrl = siteParams.urlReplace.real;
  }
  siteParams.urlReplace.fake.forEach((u) => {
    baseUrl = baseUrl.replace(u, siteParams.urlReplace.real);
  });

  const path = query.params?.join("/") || "";

  const actualUrl = `https://${baseUrl}/${path}`;

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
  const fetchActualPage = await fetch(actualUrl, {
    method: "GET",
  });

  let pageData = {};

  if (fetchActualPage.headers.get("content-type").includes("html")) {
    const actualPage = await fetchActualPage.text();

    const actualPageDom = parse(actualPage);

    // extrapolate the title, description, and image
    pageData = {
      title: decode(actualPageDom.querySelector("title").innerHTML) || "",

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
        actualPageDom.querySelector("link[rel='icon']")?.getAttribute("href") ||
        actualPageDom
          .querySelector("link[rel='shortcut icon']")
          ?.getAttribute("href") ||
        "",
    };
  }

  console.log(pageData);

  /* if the user has already been rickrolled by the page, we redirect to the actual repo.
   * we can bypass this by setting process.env.NEXT_PUBLIC_ALWAYS_RICKROLL
   */
  const redirectUrl =
    rickrolled && !process.env.NEXT_PUBLIC_ALWAYS_RICKROLL
      ? actualUrl
      : "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

  return {
    props: {
      pageData,
      path,
      redirectUrl,
      host,
      siteParams,
    },
  };
}

export default function Home({
  pageData,
  path,
  redirectUrl,
  host,
  siteParams,
}) {
  if (typeof window !== "undefined") {
    location.assign(redirectUrl);
  }

  return (
    <div>
      {pageData && (
        <Head>
          <title>{pageData.title}</title>

          <meta name="description" content={pageData.description} />
          <meta property="twitter:card" content={pageData.twitterCard} />
          <meta property="twitter:site" content={pageData.twitterSite} />
          <meta property="twitter:title" content={pageData.title} />
          <meta property="twitter:description" content={pageData.description} />
          <meta property="twitter:image" content={pageData.image} />
          <meta property="og:title" content={pageData.title} />
          <meta property="og:description" content={pageData.description} />
          <meta property="og:image" content={pageData.image} />
          <meta property="og:image:alt" content={pageData.imageAlt} />
          <meta property="og:url" content={`https://${host}/${path}`} />
          <meta property="og:site_name" content={pageData.ogSiteName} />
          <meta property="og:type" content="object" />

          <link rel="icon" href={pageData.favicon} />
        </Head>
      )}

      {/**
      <p style={{ margin: "1em", fontSize: "18px" }}>
        We're taking you to your requested page. If you're not redirected automatically, just click {" "}
        <a
          style={{ fontWeight: 500, textDecoration: "underline" }}
          href={redirectUrl}
        >
          here
        </a>
        .
      </p>
      **/}
      <a
        rel="me"
        style={{ display: "none" }}
        className={siteParams.site}
        aria-hidden="true"
        href="https://fedi.limes.pink/@limes"
      ></a>
    </div>
  );
}
