import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  User,
  Users,
  Building,
  Shield,
  Clapperboard,
  Globe,
  Film,
  Calendar,
  X,
  AlertCircle,
  HelpCircle,
  Hash
} from "lucide-react";
import { MovieInfo, MovieDetailResponse } from "../types";

interface MovieDetailProps {
  movieCd: string | null;
  onClose?: () => void;
}

export function MovieDetail({ movieCd, onClose }: MovieDetailProps) {
  const [movie, setMovie] = useState<MovieInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieCd) {
      setMovie(null);
      return;
    }

    const fetchMovieDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/movie?code=${movieCd}`);
        if (!response.ok) {
          throw new Error("영화 정보를 불러오는데 실패했습니다.");
        }
        const data: MovieDetailResponse = await response.json();
        const info = data.movieInfoResult?.movieInfo;
        if (info) {
          setMovie(info);
        } else {
          throw new Error("결과데이터를 찾을 수 없습니다.");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "원하지 않은 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetail();
  }, [movieCd]);

  if (!movieCd) {
    return (
      <div
        className="flex flex-col items-center justify-center h-[500px] text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-8"
        id="movie-detail-placeholder"
      >
        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mb-4 text-indigo-500">
          <Film className="w-8 h-8" />
        </div>
        <h3 className="font-sans font-medium text-slate-800 dark:text-slate-200 text-lg mb-2">
          선택된 영화가 없습니다
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          왼쪽 박스오피스 목록에서 영화를 선택하시면 상세 정보(감독, 출연진, 심의등급, 러닝타임 등)를 이곳에서 확인할 수 있습니다.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center h-[500px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm space-y-4 p-8"
        id="movie-detail-loading"
      >
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Film className="w-5 h-5 text-indigo-500/80" />
          </div>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          영화 상세 정보를 안전하게 다이렉트 호출 중...
        </p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div
        className="flex flex-col items-center justify-center h-[500px] border border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-8"
        id="movie-detail-error"
      >
        <div className="w-12 h-12 rounded-full col-red-50 bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-sans font-medium text-slate-800 dark:text-slate-200 mb-1">
          정보를 불러올 수 없습니다
        </h3>
        <p className="text-sm text-slate-500 text-center max-w-xs">{error || "오류가 발생했습니다"}</p>
      </div>
    );
  }

  // Genre coloring mapper
  const genresList = movie.genres.map((g) => g.genreNm);
  const theme = {
    bg: "from-indigo-600 to-slate-900 dark:from-indigo-950/50 dark:to-slate-950/90",
    accent: "text-indigo-550 border-indigo-500/20",
    badge: "bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-750 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-900/40"
  };
  const mainGenre = genresList[0] || "";
  if (mainGenre.includes("액션") || mainGenre.includes("스릴러") || mainGenre.includes("범죄") || mainGenre.includes("공포")) {
    theme.bg = "from-rose-600 to-slate-900 dark:from-rose-950/40 dark:to-slate-950/90";
    theme.accent = "text-rose-505 border-rose-500/20";
    theme.badge = "bg-rose-50/65 dark:bg-rose-950/30 text-rose-750 dark:text-rose-400 border-rose-100/50 dark:border-rose-900/40";
  } else if (mainGenre.includes("코미디") || mainGenre.includes("가족") || mainGenre.includes("애니메이션") || mainGenre.includes("모험") || mainGenre.includes("SF")) {
    theme.bg = "from-amber-500 to-slate-900 dark:from-amber-950/35 dark:to-slate-950/90";
    theme.accent = "text-amber-505 border-amber-500/20";
    theme.badge = "bg-amber-50/65 dark:bg-amber-950/30 text-amber-750 dark:text-amber-400 border-amber-100/50 dark:border-amber-900/40";
  } else if (mainGenre.includes("멜로") || mainGenre.includes("로맨스") || mainGenre.includes("드라마")) {
    theme.bg = "from-emerald-600 to-slate-900 dark:from-emerald-950/30 dark:to-slate-950/90";
    theme.accent = "text-emerald-505 border-emerald-500/20";
    theme.badge = "bg-emerald-50/65 dark:bg-emerald-950/30 text-emerald-750 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/40";
  }

  // Format Helper for date (YYYYMMDD to YYYY-MM-DD)
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={movie.movieCd}
        id="movie-detail-card"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-md overflow-hidden flex flex-col h-full"
      >
        {/* Banner with gradient backdrop */}
        <div className={`relative px-6 py-8 bg-gradient-to-br ${theme.bg} text-white`}>
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/45 transition-colors cursor-pointer text-white/90"
              id="close-detail-button"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Subtitle / English title */}
          <div className="flex items-center space-x-2 text-white/80 text-[11px] uppercase tracking-wider font-mono">
            <span>{movie.typeNm} 영화</span>
            <span>•</span>
            <span>{movie.nations[0]?.nationNm || "지역미상"}</span>
          </div>

          {/* Primary Title */}
          <h2 className="font-sans font-bold text-2xl mt-1.5 leading-snug tracking-tight">
            {movie.movieNm}
          </h2>

          {/* English title */}
          {movie.movieNmEn && (
            <p className="text-sm text-white/70 font-sans tracking-wide truncate mt-0.5">
              {movie.movieNmEn}
            </p>
          )}

          {/* Core Badges on banner */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {genresList.map((g, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-white/15 text-white text-xs rounded-md backdrop-blur-md"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Info Grid Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[600px] flex-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          
          {/* Section 1: Core quick information grids */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/45 rounded-xl border border-slate-100/70 dark:border-slate-800/30">
              <div className="flex items-center text-slate-400 dark:text-slate-500 text-xs mb-1">
                <Clock className="w-4 h-4 mr-1.5" />
                <span>상영시간</span>
              </div>
              <p className="font-sans font-medium text-slate-800 dark:text-slate-100 text-sm">
                {movie.showTm ? `${movie.showTm}분` : "정보없음"}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/45 rounded-xl border border-slate-100/70 dark:border-slate-800/30">
              <div className="flex items-center text-slate-400 dark:text-slate-500 text-xs mb-1">
                <Calendar className="w-4 h-4 mr-1.5" />
                <span>개봉 연월일</span>
              </div>
              <p className="font-sans font-medium text-slate-800 dark:text-slate-100 text-sm">
                {formatDate(movie.openDt)}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/45 rounded-xl border border-slate-100/70 dark:border-slate-800/30">
              <div className="flex items-center text-slate-400 dark:text-slate-500 text-xs mb-1">
                <Shield className="w-4 h-4 mr-1.5" />
                <span>심의 등급</span>
              </div>
              <p className="font-sans font-medium text-slate-800 dark:text-slate-100 text-sm truncate">
                {movie.audits[0]?.watchGradeNm || "등급 심의 보류"}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/45 rounded-xl border border-slate-100/70 dark:border-slate-800/30">
              <div className="flex items-center text-slate-400 dark:text-slate-500 text-xs mb-1">
                <Hash className="w-4 h-4 mr-1.5" />
                <span>영화 코드</span>
              </div>
              <p className="font-mono text-slate-800 dark:text-slate-100 text-xs">
                {movie.movieCd}
              </p>
            </div>
          </div>

          {/* Section 2: Director block */}
          <div className="space-y-2">
            <h3 className="font-sans font-medium text-slate-800 dark:text-slate-200 text-sm flex items-center">
              <User className="w-4 h-4 mr-2 text-indigo-550" />
              감독
            </h3>
            <div className="flex flex-wrap gap-2">
              {movie.directors.length > 0 ? (
                movie.directors.map((dir, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-lg text-xs"
                  >
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{dir.peopleNm}</p>
                    {dir.peopleNmEn && (
                      <p className="text-[10px] text-slate-400 font-mono">{dir.peopleNmEn}</p>
                    )}
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400">등록된 감독 정보가 없습니다.</span>
              )}
            </div>
          </div>

          {/* Section 3: Cast Actors block */}
          <div className="space-y-2">
            <h3 className="font-sans font-medium text-slate-800 dark:text-slate-200 text-sm flex items-center">
              <Users className="w-4 h-4 mr-2 text-indigo-550" />
              출연 배우
            </h3>
            {movie.actors.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 h-auto max-h-[180px] overflow-y-auto pr-1">
                {movie.actors.map((actor, idx) => (
                  <div
                    key={idx}
                    className="p-2 border border-slate-50 dark:border-slate-800/60 bg-slate-50/45 dark:bg-slate-900/50 rounded-lg flex items-center gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-600 dark:text-slate-300">
                      {actor.peopleNm.substring(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{actor.peopleNm}</p>
                      {actor.cast ? (
                        <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-medium truncate">역: {actor.cast}</p>
                      ) : (
                        <p className="text-[9px] text-slate-400 font-mono truncate">{actor.peopleNmEn || "Actor"}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">출연 배우 정보가 등록되어 있지 않습니다.</p>
            )}
          </div>

          {/* Section 4: Production and distribution company block */}
          {movie.companys.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-sans font-medium text-slate-800 dark:text-slate-200 text-sm flex items-center">
                <Building className="w-4 h-4 mr-2 text-indigo-550" />
                영화사 참여 정보
              </h3>
              <div className="space-y-1.5">
                {movie.companys.map((comp, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs p-2 bg-slate-50/30 dark:bg-slate-900/40 border border-slate-100/50 dark:border-slate-800/50 rounded-lg"
                  >
                    <span className="font-medium text-slate-750 dark:text-slate-200">{comp.companyNm}</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 rounded px-1.5 py-0.5">
                      {comp.companyPartNm}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Staff breakdown if they exist */}
          {movie.staffs.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-sans font-medium text-slate-800 dark:text-slate-200 text-sm flex items-center">
                <Clapperboard className="w-4 h-4 mr-2 text-indigo-550" />
                제작 스태프
              </h3>
              <div className="h-auto max-h-[100px] overflow-y-auto text-xs space-y-1.5 pr-1">
                {movie.staffs.slice(0, 10).map((staff, idx) => (
                  <div key={idx} className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span className="font-medium">{staff.peopleNm}</span>
                    <span className="text-[11px] font-mono text-slate-400">{staff.staffRoleNm}</span>
                  </div>
                ))}
                {movie.staffs.length > 10 && (
                  <div className="text-[10px] text-slate-400 text-center pt-1 border-t border-slate-50 dark:border-slate-850">
                    외 {movie.staffs.length - 10}명의 스태프진 등록됨
                  </div>
                )}
              </div>
            </div>
          )}
          
        </div>

        {/* Info source footer */}
        <div className="border-t border-slate-50 dark:border-slate-850 px-6 py-3 bg-slate-50 dark:bg-slate-900/60 text-right">
          <span className="text-[10px] text-slate-400 font-mono">
            제공처: 영화진흥위원회 (KOBIS) Open API
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
