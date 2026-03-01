// is this microsoftgithub.com or nintendo.uk.net
export default async function getSiteParams(host) {
  let site = "gh"; // fallback, used for testing

  const ghRegex = /microsoftgithub\.com$/;
  const ninRegex =
    /((nintendo\.uk\.net)|(nintenclo\.com)|(nintendoswitch1\.com))$/;

  if (ghRegex.test(host)) {
    site = "gh";
  } else if (ninRegex.test(host)) {
    site = "nin";
  } else {
    console.error(`[WARN] invalid site, falling back to ${site}`);
  }

  return siteParams.filter((s) => s.site === site)[0];
}

const siteParams = [
  {
    site: "nin",
    title: "NotTendo",
    realName: "Nintendo",
    affiliation: "Nintendo",
    urlReplace: {
      fake: ["nintendo.uk.net", "nintenclo.com", "nintendoswitch1.com"],
      real: "nintendo.com",
    },
    statsEndpoint: "https://nintendo.uk.net/api/stats",
    example: {
      from: "https://www.nintendo.<u>com</u>/​en-gb/​Games/",
      to: "https://www.nintendo.<u>uk.net</u>/​en-gb/​Games/",
    },
    sibling: "microsoftgithub.com",
    supabaseKeyPrefix: "nintenclo-rickrolled",
  },
  {
    site: "gh",
    title: "NotHub",
    realName: "GitHub",
    affiliation: "Microsoft",
    urlReplace: {
      fake: ["microsoftgithub.com"],
      real: "github.com",
    },
    statsEndpoint: "https://microsoftgithub.com/api/stats",
    example: {
      from: "https://github.com/​github/​dmca",
      to: "https://<u>microsoft</u>github.com/​github/​dmca",
    },
    sibling: "nintendo.uk.net",
    supabaseKeyPrefix: "rickrolled",
  },
];
