import puppeteer from "puppeteer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
await page.goto(`file://${path.join(__dirname, "generate-og.html")}`, { waitUntil: "networkidle0" });
await page.screenshot({
  path: path.join(__dirname, "..", "frontend", "public", "og.png"),
  type: "png",
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});
await browser.close();
console.log("Generated frontend/public/og.png");
