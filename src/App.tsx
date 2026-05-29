import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Calendar,
  Layers,
  Moon,
  Sun,
  Tv,
  Film,
  Search,
  ChevronRight,
  TrendingUp,
  Award,
  Clapperboard,
  RotateCcw
} from "lucide-react";
import { DailyBoxOffice, BoxOfficeResponse } from "./types";
import { BoxOfficeList } from "./components/BoxOfficeList";
import { MovieDetail } from "./components/MovieDetail";

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Date states
  const getYesterdayDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  };

  const formatDateToYYYYMMDD = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  };

  const formatDateToYYYY_MM_DD = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const maxDateString = formatDateToYYYY_MM_DD(getYesterdayDate());
  const [selectedDate, setSelectedDate] = useState<string>(maxDateString);

  // Data states
  const [movies, setMovies] = useState<DailyBoxOffice[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<DailyBoxOffice[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedMovieCd, setSelectedMovieCd] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Mobile scroll reference
  const detailRef = useRef<HTMLDivElement>(null);

  // Initialize Theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Theme Toggle Handler
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  // Fetch box office data whenever date changes
  useEffect(() => {
    const fetchBoxOffice = async () => {
      setLoading(true);
      setError(null);
      // Convert standard YYYY-MM-DD back to KOBIS YYYYMMDD
      const rawDate = selectedDate.replace(/-/g, "");
      
      try {
        const response = await fetch(`/api/boxoffice?date=${rawDate}`);
        if (!response.ok) {
          throw new Error("박스오피스 데이터를 불러오는데 실패했습니다.");
        }
        const data: BoxOfficeResponse = await response.json();
        const list = data.boxOfficeResult?.dailyBoxOfficeList || [];
        setMovies(list);
        setFilteredMovies(list);
        setSearchTerm(""); // reset search on date change
        
        // Auto select the #1 movie
        if (list.length > 0) {
          setSelectedMovieCd(list[0].movieCd);
        } else {
          setSelectedMovieCd(null);
        }
      } catch (err: any) {
        console.error(err);
        setError("영화진흥위원회 OpenAPI 서버로부터 일별 박스오피스 순위를 받아오지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setMovies([]);
        setFilteredMovies([]);
        setSelectedMovieCd(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBoxOffice();
  }, [selectedDate]);

  // Client-side text filter handler
  useEffect(() => {
    if (!searchTerm) {
      setFilteredMovies(movies);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = movies.filter((m) =>
        m.movieNm.toLowerCase().includes(lowerSearch)
      );
      setFilteredMovies(filtered);
      
      // Select first item in filtered list if current selection is not visible
      if (filtered.length > 0) {
        const carriesSelection = filtered.some((m) => m.movieCd === selectedMovieCd);
        if (!carriesSelection) {
          setSelectedMovieCd(filtered[0].movieCd);
        }
      } else {
        setSelectedMovieCd(null);
      }
    }
  }, [searchTerm, movies]);

  // Handle movie selection (including mobile anchor scrolls)
  const handleSelectMovie = (movieCd: string) => {
    setSelectedMovieCd(movieCd);
    if (window.innerWidth < 768) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${
        isDarkMode ? "dark bg-[#0f172a] text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
      id="app-theme-container"
    >
      {/* Upper Navigation and Header Block */}
      <header className="border-b border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Headline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-sans font-extrabold text-xl tracking-tight leading-none text-slate-900 dark:text-slate-100">
                Box Office Explorer
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                KOBIS OPEN DAILY DB ENGINE
              </p>
            </div>
          </div>

          {/* Date Picker and Settings Toggles Controls */}
          <div className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto">
            
            {/* Date Input Card */}
            <div className="flex items-center space-x-2 bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700/50 rounded-xl px-3 py-1.5 shadow-inner">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                id="box-office-date-picker"
                value={selectedDate}
                max={maxDateString}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-0 text-sm font-sans font-medium hover:text-indigo-600 focus:outline-none dark:text-slate-200 cursor-pointer"
              />
            </div>

            {/* Dark Mode toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/60 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm cursor-pointer"
              aria-label="Toggle dark mode"
              id="theme-toggler"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </motion.button>
          </div>

        </div>
      </header>

      {/* Primary Dashboard Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Notification system */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl border border-rose-100 dark:border-rose-950/30 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-sm flex items-start gap-3"
            id="error-notification"
          >
            <div className="w-5 h-5 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-0.5">!</div>
            <div className="flex-1">
              <p className="font-semibold">자료 연동 오류</p>
              <p className="mt-0.5 text-xs opacity-90">{error}</p>
              <button
                onClick={() => setSelectedDate(maxDateString)}
                className="mt-2 text-xs font-semibold text-rose-800 dark:text-rose-300 underline underline-offset-2 flex items-center cursor-pointer gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                최신 데이터 날짜({maxDateString})로 리셋하기
              </button>
            </div>
          </motion.div>
        )}

        {/* Dynamic Header details */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/50 text-indigo-750 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              일별 박스오피스 순위
            </span>
            <div className="flex items-center space-x-2 mt-2">
              <h2 className="font-sans font-extrabold text-2xl tracking-tight text-slate-800 dark:text-slate-100">
                {selectedDate.replace(/-/g, ".")} 영화 순위
              </h2>
              <span className="text-xs text-slate-400 font-mono mt-1.5">(매일 오전 업데이트)</span>
            </div>
          </div>

          {/* Quick Client Search Input */}
          {!error && movies.length > 0 && (
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="movie-search-input"
                placeholder="결과 내 영화 제목 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-sans tracking-wide transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  지우기
                </button>
              )}
            </div>
          )}
        </div>

        {/* Responsive Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          
          {/* Column A: Left Box Office List Column */}
          <div className="md:col-span-2 space-y-4">
            <BoxOfficeList
              movies={filteredMovies}
              selectedMovieCd={selectedMovieCd}
              onSelectMovie={handleSelectMovie}
              loading={loading}
            />
          </div>

          {/* Column B: Right Real-time details card Column */}
          <div ref={detailRef} className="md:col-span-3 transition-all">
            <div className="sticky top-24">
              <MovieDetail movieCd={selectedMovieCd} />
            </div>
          </div>

        </div>

      </main>

      {/* Styled App Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/80 mt-16 py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400 space-y-2">
          <p className="font-sans">
            포털 웹사이트의 박스오피스 정보는 영진위 API 가이드에 맞춰 제공됩니다.
          </p>
          <p className="font-mono opacity-80">
            © 2026 Movie Daily Box Office Engine. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
