import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());

  // API Route for testing
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy Myfxbook API
  app.get("/api/myfxbook/login.json", async (req, res) => {
    try {
      const { email, password } = req.query;
      const targetUrl = `https://www.myfxbook.com/api/login.json?email=${encodeURIComponent(String(email))}&password=${encodeURIComponent(String(password))}`;
      const response = await fetch(targetUrl);
      const data = await response.json();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: true, message: e.message });
    }
  });

  // Proxy Myfxbook Extra API
  app.get("/api/myfxbook/get-history.json", async (req, res) => {
    try {
      const { session, id } = req.query;
      const targetUrl = `https://www.myfxbook.com/api/get-history.json?session=${encodeURIComponent(String(session))}&id=${encodeURIComponent(String(id))}`;
      const response = await fetch(targetUrl);
      const data = await response.json();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: true, message: e.message });
    }
  });

  // Proxy FTP Reports
  app.get("/api/ftp-proxy", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url)
        return res.status(400).json({ error: true, message: "Missing URL" });
      const response = await fetch(String(url));
      const text = await response.text();
      res.send(text);
    } catch (e: any) {
      res.status(500).json({ error: true, message: e.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Since Express v4, we can use *
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
