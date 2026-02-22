import Head from "next/head";
import styles from "../styles/usage.module.css";

import { useState } from "react";
import getSiteParams from "../lib/getSiteParams";

export async function getServerSideProps(context) {
  const siteParams = await getSiteParams(context.req.headers["host"]);

  async function getStats() {
    const statsFetch = await fetch(siteParams.statsEndpoint);

    if (!statsFetch.ok) {
      return { rickrolled: null };
    }
    const statsJson = await statsFetch.json();
    return statsJson;
  }
  const { rickrolled } = await getStats();

  return {
    props: {
      rickrolled,
      siteParams,
    },
  };
}

export default function Home({ rickrolled, siteParams }) {
  const [extendedStats, setExtendedStats] = useState(false);

  const fakeSiteArray = siteParams.urlReplace.fake;

  let fakeSiteElements = [
    <code className="bg" key={0}>
      {fakeSiteArray[0]}
    </code>,
  ];

  if (fakeSiteArray.length > 1) {
    for (let i = 1; i < fakeSiteArray.length; i++) {
      let joiner = ", ";
      if (i === fakeSiteArray.length - 1) {
        joiner = " or ";
      }

      const el = (
        <code className="bg" key={i}>
          {fakeSiteArray[i]}
        </code>
      );
      fakeSiteElements.push(joiner);
      fakeSiteElements.push(el);
    }
  }

  return (
    <div className={`${styles.wrapper} ${siteParams.site}`}>
      <Head>
        <title>{siteParams.title}</title>
        <meta
          name="description"
          content={`A website that lets you create official-looking ${siteParams.realName} links that
          rickroll the visitor. Not affiliated with ${siteParams.affiliation} or any of its subsidiaries.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteParams.title} />
        <meta
          name="twitter:description"
          content={`A website that lets you create official-looking ${siteParams.realName} links that
          rickroll the visitor. Not affiliated with ${siteParams.affiliation} or any of its subsidiaries.`}
        />
        <meta
          name="twitter:image"
          content={`https://${siteParams.urlReplace.fake[0]}/${siteParams.site}.png`}
        />
      </Head>

      <div className={styles.content}>
        <div className={styles.hero}>
          <h1>{siteParams.title}</h1>
          <p>
            A website that lets you create official-looking{" "}
            {siteParams.realName} links that rickroll the visitor.
          </p>
        </div>

        <div className={styles.section}>
          <h2>Usage</h2>
          <p>
            Simply replace{" "}
            {<code className="bg">{siteParams.urlReplace.real}</code>} with{" "}
            {fakeSiteElements.map((e) => e)}. The resulting URL will redirect to
            the rickroll video, and its social media preview will look identical
            to the official one.
          </p>
          <p>
            For example,{" "}
            <code
              className="bg"
              dangerouslySetInnerHTML={{ __html: siteParams.example.from }}
            ></code>{" "}
            becomes{" "}
            <code
              className="bg"
              dangerouslySetInnerHTML={{ __html: siteParams.example.to }}
            ></code>
            .
          </p>
        </div>

        <div className={styles.section}>
          <h2>Why?</h2>
          <p>
            When I realized this domain hadn't been bought by{" "}
            {siteParams.affiliation}, I decided to purchase it. It was dirt
            cheap, and I didn't want it to fall into the hands of scammers who
            might use it for phishing. With the domain in my hands, it would
            have been a waste not to use it to rickroll unsuspecting people.
          </p>
          {rickrolled ? (
            <p>
              To date,{" "}
              <code
                className="bg clickable"
                onClick={() => setExtendedStats(!extendedStats)}
              >
                {extendedStats ? rickrolled.users : `${rickrolled.kusers}k`}
              </code>{" "}
              visitors (excluding bots and crawlers) have been rickrolled, and
              the number keeps growing!
            </p>
          ) : (
            <p>
              P.S.: If you're looking for the statistics, they are currently
              unavailable. Please check back later!
            </p>
          )}
        </div>

        <div className={styles.section}>
          <p>
            Make sure to also check out{" "}
            <a
              href={`https://${siteParams.sibling}/usage`}
              rel="noreferrer noopener"
            >
              {siteParams.sibling}
            </a>
            !
          </p>
        </div>
      </div>

      <footer>
        <p>
          Made with{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M240,102c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,228.66,16,172,16,102A62.07,62.07,0,0,1,78,40c20.65,0,38.73,8.88,50,23.89C139.27,48.88,157.35,40,178,40A62.07,62.07,0,0,1,240,102Z"></path>
          </svg>{" "}
          by{" "}
          <a href="https://limes.pink" target="_blank" rel="noreferrer">
            limes.pink
          </a>{" "}
          • Not affiliated with {siteParams.affiliation} or any of its
          subsidiaries •{" "}
          <a
            href="https://github.com/limesdotpink/microsoftgithub.com"
            target="_blank"
            rel="noreferrer"
          >
            Source code
          </a>
        </p>
        <a
          rel="me"
          style={{ display: "none" }}
          href="https://fedi.limes.pink/@limes"
          aria-hidden="true"
        ></a>
      </footer>
    </div>
  );
}
