import crawlerUserAgents from "crawler-user-agents";

const detectRobot = (userAgent) => {
  const robots = new RegExp(
    crawlerUserAgents.map((r) => r.pattern).join("|"),
    "i",
  ); // BUILD REGEXP + "i" FLAG

  return robots.test(userAgent);
};

export { detectRobot };
