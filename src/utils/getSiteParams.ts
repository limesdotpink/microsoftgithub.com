// is this microsoftgithub.com or nintendo.uk.net
export async function getSiteParams(host: string) {
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
    title: "Nottendo",
    realName: "Nintendo",
    affiliation: "Nintendo",
    urlReplace: {
      fake: process.env.TESTING ? ["t.nintendo.uk.net", "t.nintendoswitch1.com"] : ["nintendo.uk.net", "nintendoswitch1.com"],
      real: "nintendo.com",
    },
    ogImage: "https://nintendo.uk.net/img/nin.png",
    example: {
      from: "https://www.nintendo.<u>com</u>/en-gb/Games/",
      to: "https://www.nintendo.<u>uk.net</u>/en-gb/Games/",
    },
    sibling: process.env.TESTING ? "t.microsoftgithub.com" : "microsoftgithub.com"
  },
  {
    site: "gh",
    title: "NotHub",
    realName: "GitHub",
    affiliation: "Microsoft",
    urlReplace: {
      fake: process.env.TESTING ? ["t.microsoftgithub.com"] : ["microsoftgithub.com"],
      real: "github.com",
    },
    ogImage: "https://microsoftgithub.com/img/gh.png",
    example: {
      from: "https://github.com/github/dmca",
      to: "https://<u>microsoft</u>github.com/github/dmca",
    },
    sibling: process.env.TESTING ? "t.nintendo.uk.net" : "nintendo.uk.net",
  },
];
