import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { injectMeta } from "./seo-metadata";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  const indexHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

  app.use("*", (req, res) => {
    const pathname = req.originalUrl.split("?")[0];
    const html = injectMeta(indexHtml, pathname);
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  });
}
