export default async function handler(req, res) {
  try {
    const response = await fetch("https://longreads.com/feed/", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/rss+xml",
      },
    });

    if (!response.ok) {
      return res.status(500).send("Failed to fetch upstream feed");
    }

    const xmlText = await response.text();

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "s-maxage=600");
    res.status(200).send(xmlText);
  } catch (err) {
    res.status(500).send("Failed to fetch feed");
  }
}
