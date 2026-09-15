import crawlerUserAgents from "crawler-user-agents";

const detectRobot = (userAgent: string) => {
  const robots = new RegExp(
    crawlerUserAgents.map((r) => r.pattern).join("|"),
    "i",
  );

  return robots.test(userAgent);
};

export { detectRobot };
