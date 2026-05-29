import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const KOBIS_API_KEY = process.env.KOBIS_API_KEY || "99972d63afe55286f4c034eac28d0637";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Daily Box Office Proxy Route
  app.get("/api/boxoffice", async (req, res) => {
    try {
      const date = req.query.date as string;
      if (!date || !/^\d{8}$/.test(date)) {
        return res.status(400).json({ error: "Invalid date format. Expected YYYYMMDD." });
      }

      const url = `https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${KOBIS_API_KEY}&targetDt=${date}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`KOBIS API responded with status ${response.status}`);
      }
      const data = await response.json();
      console.log(`[KOBIS API] GET /api/boxoffice?date=${date} fetched successfully. Raw response keys:`, Object.keys(data));
      if (data.faultInfo) {
        console.error("[KOBIS API] Error returned from Kobis server:", data.faultInfo);
      }
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching box office data: ", error);
      res.status(500).json({ error: "Failed to fetch box office data", details: error.message });
    }
  });

  // 2. Movie Detail Proxy Route
  app.get("/api/movie", async (req, res) => {
    try {
      const code = req.query.code as string;
      if (!code) {
        return res.status(400).json({ error: "Movie code is required." });
      }

      const url = `https://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${KOBIS_API_KEY}&movieCd=${code}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`KOBIS API responded with status ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching movie details: ", error);
      res.status(500).json({ error: "Failed to fetch movie details", details: error.message });
    }
  });

  // 3. AI Movie Review Generation Route (Lazy-instantiated Gemini API)
  app.post("/api/review", async (req, res) => {
    try {
      const { movieNm, movieNmEn, genres, directors, actors, keywords } = req.body;
      if (!movieNm) {
        return res.status(400).json({ error: "Movie name (movieNm) is required." });
      }

      // Check if GEMINI_API_KEY is available
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY가 설정되지 않았습니다. AI Studio의 Settings > Secrets 패널에서 API 키를 설정해주세요."
        });
      }

      // Import standard Node.js dynamic import or just load from package
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      const movieTitle = movieNmEn ? `${movieNm} (${movieNmEn})` : movieNm;
      const prompt = `
영진위 KOBIS 영화 정보를 바탕으로 사용자가 입력한 키워드를 포함한 개성있고 몰입감 높은 영화 감상평(리뷰)을 작성해주세요.

[영화 정보]
- 제목: ${movieTitle}
- 장르: ${genres || "알수없음"}
- 감독: ${directors || "알수없음"}
- 주요 출연진: ${actors || "알수없음"}

[사용자 지정 키워드]
"${keywords || "재미있음, 추천"}"

[작성 가이드라인]
1. 사용자가 준 키워드의 분위기나 내용을 반드시 자연스럽게 포함해야 합니다.
2. 친근하면서도 깊이 있는 영화 평론가 혹은 열정적인 영화 팬의 어조로 한국어로 작성하세요.
3. 2~3개 분단으로 구성하고 각 문단이 긴밀하게 연결되도록 해주세요.
4. 마크다운 형식을 활용하여 이 가독성 높게 소제목이나 글머리표를 곁들이면 좋습니다.
`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const generatedReview = aiResponse.text || "감상평을 생성할 수 없습니다.";
      res.json({ review: generatedReview });
    } catch (error: any) {
      console.error("Error generating AI review: ", error);
      res.status(500).json({ error: "AI 감상평 생성 과정에서 오류가 발생했습니다.", details: error.message });
    }
  });

  // Serve static files / Vite dev server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
