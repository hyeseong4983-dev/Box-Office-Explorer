import { motion } from "motion/react";
import { Calendar, TrendingUp, TrendingDown, Minus, Sparkles, Users, Award } from "lucide-react";
import { DailyBoxOffice } from "../types";

interface BoxOfficeListProps {
  movies: DailyBoxOffice[];
  selectedMovieCd: string | null;
  onSelectMovie: (movieCd: string) => void;
  loading: boolean;
  onSetRecommendedDate?: (dateStr: string) => void;
}

export function BoxOfficeList({
  movies,
  selectedMovieCd,
  onSelectMovie,
  loading,
  onSetRecommendedDate,
}: BoxOfficeListProps) {
  if (loading) {
    return (
      <div className="space-y-4" id="box-office-list-loading">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-4 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 animate-pulse"
          >
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
        id="box-office-list-empty"
      >
        <Award className="w-10 h-10 text-amber-500 mb-3 animate-bounce" />
        <h3 className="font-sans font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
          조회 결과가 비어 있습니다
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mb-5 leading-relaxed">
          영화진흥위원회(KOBIS) 데이터는 실제 과거 날짜에만 존재합니다. 테스트 시 시스템 날짜(2026년 등)가 미래 시점인 경우 영화 기록을 받아올 수 없습니다.
        </p>
        
        {onSetRecommendedDate && (
          <div className="w-full space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-505 block uppercase tracking-wider">
              실제 영화 기록이 있는 추천 날짜 선택
            </span>
            <div className="grid grid-cols-1 gap-1.5 pt-1">
              {[
                { label: "2025년 2월 25일 (최근 기록)", date: "2025-02-25" },
                { label: "2024년 12월 25일 (크리스마스)", date: "2024-12-25" },
                { label: "2024년 5월 28일 (과거 봄 시즌)", date: "2024-05-28" }
              ].map((item) => (
                <button
                  key={item.date}
                  onClick={() => onSetRecommendedDate(item.date)}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100/60 dark:border-indigo-900/40 cursor-pointer transition-all active:scale-[0.98]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Format Helper for large numbers
  const formatNumber = (numStr: string) => {
    return parseInt(numStr, 10).toLocaleString();
  };

  return (
    <div className="space-y-3" id="box-office-list-container">
      {movies.map((movie, index) => {
        const isSelected = selectedMovieCd === movie.movieCd;
        const rankInten = parseInt(movie.rankInten, 10);
        const isNew = movie.rankOldAndNew === "NEW";

        return (
          <motion.button
            key={movie.movieCd}
            id={`movie-item-${movie.movieCd}`}
            onClick={() => onSelectMovie(movie.movieCd)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full text-left flex items-center p-4 rounded-xl transition-all duration-300 border ${
              isSelected
                ? "bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-500/20"
                : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-100 dark:border-slate-800"
            } shadow-sm cursor-pointer`}
          >
            {/* Rank Visual block */}
            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800/80 mr-4 flex-shrink-0">
              <span className="font-sans font-bold text-xl text-slate-800 dark:text-slate-100">
                {movie.rank}
              </span>
              
              {/* Rank Change Indicator */}
              <div className="flex items-center text-[11px] font-mono leading-none mt-0.5">
                {isNew ? (
                  <span className="flex items-center text-amber-500 dark:text-amber-400 font-bold scale-90">
                    <Sparkles className="w-2.5 h-2.5 mr-0.5 fill-current" />
                    NEW
                  </span>
                ) : rankInten > 0 ? (
                  <span className="flex items-center text-rose-500 font-semibold">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                    {rankInten}
                  </span>
                ) : rankInten < 0 ? (
                  <span className="flex items-center text-blue-500 font-semibold">
                    <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                    {Math.abs(rankInten)}
                  </span>
                ) : (
                  <span className="flex items-center text-slate-400">
                    <Minus className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            </div>

            {/* Movie details summary */}
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-sans font-medium text-base text-slate-900 dark:text-slate-100 truncate">
                  {movie.movieNm}
                </h4>
                {parseInt(movie.rank) <= 3 && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold border ${
                    movie.rank === "1" 
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900"
                      : movie.rank === "2"
                      ? "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-800"
                      : "bg-amber-50/50 text-amber-800/80 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-950"
                  }`}>
                    TOP {movie.rank}
                  </span>
                )}
              </div>

              {/* Stats line */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {movie.openDt} 개봉
                </span>
                <span className="flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  일 {formatNumber(movie.audiCnt)}명 <span className="text-slate-300 dark:text-slate-700 mx-1">|</span> 누적 {formatNumber(movie.audiAcc)}명
                </span>
              </div>

              {/* Sales Share Bar */}
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>매출 점유율</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{movie.salesShare}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${movie.salesShare}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
