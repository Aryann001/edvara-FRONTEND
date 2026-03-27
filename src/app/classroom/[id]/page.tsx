"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import api from "@/services/api";
import {
  PlayCircle,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  Maximize,
  Settings,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Gauge,
} from "lucide-react";

export default function CoursePlayerPage() {
  const { id: courseId } = useParams();
  const router = useRouter();

  const isCoding = useAppSelector((state) => state.app.isCodingDomain);
  const user = useAppSelector((state: any) => state.app.user);

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedLectures, setCompletedLectures] = useState<string[]>([]);

  const [activeLecture, setActiveLecture] = useState<any>(null);
  const [obfuscatedVideoUrl, setObfuscatedVideoUrl] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"content" | "notes" | "pyqs">(
    "content"
  );
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>(
    {}
  );

  // Anti-Piracy States
  const [watermarkId, setWatermarkId] = useState({
    top: "10%",
    left: "10%",
    scale: 1,
    visible: false,
    trace: null as any,
  });
  const [watermarkIp, setWatermarkIp] = useState({
    top: "80%",
    left: "80%",
    scale: 1,
    visible: false,
  });
  const [isObscured, setIsObscured] = useState(false);

  const [silentIp, setSilentIp] = useState<string>("Tracking...");
  const [geoCoords, setGeoCoords] = useState<string>("Locating...");

  // Legacy Video Player States
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tabsRef = useRef<HTMLDivElement>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      4000
    );
  };

  useEffect(() => {
    const fetchSilentLocation = async () => {
      try {
        const response = await fetch("https://ipinfo.io/json");
        const data = await response.json();
        setSilentIp(data.ip || "IP Hidden");
        if (data.loc) {
          setGeoCoords(data.loc);
        } else {
          setGeoCoords("Location Hidden");
        }
      } catch (err) {
        setSilentIp("IP Hidden");
        setGeoCoords("Location Hidden");
      }
    };
    fetchSilentLocation();
  }, []);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseAndEnrollment = async () => {
      try {
        const { data } = await api.get(`/courses/${courseId}`);
        setCourse(data.data);

        let userIsEnrolled = false;
        let completedIds: string[] = [];

        if (user) {
          try {
            const { data: enrollData } = await api.get(
              "/courses/my-enrollments"
            );
            if (enrollData.success) {
              const currentEnrollment = enrollData.data.find(
                (e: any) => e.course?._id === courseId || e.course === courseId
              );
              if (currentEnrollment) {
                userIsEnrolled = true;
                setIsEnrolled(true);
                completedIds = currentEnrollment.completedLectures || [];
                setCompletedLectures(completedIds);
              }
            }
          } catch (e) {
            console.error("Failed to check enrollment.");
          }
        }

        if (data.data.lectures && data.data.lectures.length > 0) {
          const firstFolder = data.data.lectures[0].folderName || "General";
          setExpandedUnits({ [firstFolder]: true });

          const firstUncompleted = data.data.lectures.find(
            (l: any) =>
              (l.isFree || userIsEnrolled) && !completedIds.includes(l._id)
          );
          const lectureToPlay =
            firstUncompleted ||
            data.data.lectures.find((l: any) => l.isFree || userIsEnrolled);

          if (lectureToPlay) {
            handleSelectLecture(lectureToPlay, userIsEnrolled);
          }
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load course content."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourseAndEnrollment();
  }, [courseId, user]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setActiveTab("notes");
      else setActiveTab("content");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const obfuscateVideo = async (realUrl: string) => {
    try {
      if (obfuscatedVideoUrl) URL.revokeObjectURL(obfuscatedVideoUrl);
      const response = await fetch(realUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setObfuscatedVideoUrl(blobUrl);
    } catch (error) {
      setObfuscatedVideoUrl(realUrl);
    }
  };

  const handleSelectLecture = async (
    lectureMeta: any,
    currentEnrollmentStatus: boolean = isEnrolled
  ) => {
    if (!lectureMeta.isFree && !currentEnrollmentStatus) {
      showToast(
        "This lecture is locked. Please enroll in the course to access it.",
        "error"
      );
      return;
    }

    try {
      const { data } = await api.get(`/lectures/${lectureMeta._id}`);
      if (data.success) {
        setActiveLecture(data.data);
        setWatermarkId((prev) => ({ ...prev, trace: data.trace }));

        if (data.data.videoUrl && !data.data.cloudflareUid) {
          await obfuscateVideo(data.data.videoUrl);
        }

        setIsPlaying(true);
        setShowSettings(false);
        if (window.innerWidth < 1024)
          window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      showToast(
        err.response?.data?.message ||
          "Failed to load video stream. Please verify your enrollment.",
        "error"
      );
    }
  };

  useEffect(() => {
    return () => {
      if (obfuscatedVideoUrl) URL.revokeObjectURL(obfuscatedVideoUrl);
    };
  }, [obfuscatedVideoUrl]);

  // --- ADVANCED ANTI-PIRACY & SMART BLACKOUT ---
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    const handleKeyDownSecurity = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "u") ||
        e.key === "PrintScreen" ||
        e.key === "Meta"
      ) {
        e.preventDefault();
        setIsObscured(true);

        if (e.key === "PrintScreen") {
          navigator.clipboard
            .writeText("Screenshots are disabled for secure content.")
            .catch(() => {});
        }

        setTimeout(() => setIsObscured(false), 3000);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (videoRef.current && isPlaying) videoRef.current.pause();
        setIsObscured(true);
      } else {
        setIsObscured(false);
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDownSecurity);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDownSecurity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPlaying]);

  // --- SPLIT DYNAMIC WATERMARKS ---
  useEffect(() => {
    if (!activeLecture || !watermarkId.trace) return;

    const intervalId = setInterval(() => {
      setWatermarkId((prev) => ({
        ...prev,
        top: `${Math.floor(Math.random() * 80) + 10}%`,
        left: `${Math.floor(Math.random() * 80) + 10}%`,
        scale: Math.random() * 0.1 + 0.95,
        visible: true,
      }));
      setTimeout(
        () => setWatermarkId((prev) => ({ ...prev, visible: false })),
        8000
      );
    }, 25000);

    const intervalIp = setInterval(() => {
      setWatermarkIp((prev) => ({
        ...prev,
        top: `${Math.floor(Math.random() * 80) + 10}%`,
        left: `${Math.floor(Math.random() * 80) + 10}%`,
        scale: Math.random() * 0.1 + 0.95,
        visible: true,
      }));
      setTimeout(
        () => setWatermarkIp((prev) => ({ ...prev, visible: false })),
        8000
      );
    }, 35000);

    return () => {
      clearInterval(intervalId);
      clearInterval(intervalIp);
    };
  }, [activeLecture, watermarkId.trace]);

  // ==========================================
  // LEGACY VIDEO PLAYER LOGIC (For Cloudinary Fallbacks)
  // ==========================================
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      if (dur > 0) {
        setProgress((current / dur) * 100);
      }
      setCurrentTime(formatTime(current));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(formatTime(videoRef.current.duration));
      videoRef.current.playbackRate = playbackRate;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime =
      (Number(e.target.value) / 100) * (videoRef.current?.duration || 0);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setProgress(Number(e.target.value));
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showSettings) {
          setShowControls(false);
        }
      }, 3000);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSettings(false);
    }
  };

  const handleVideoEnd = async () => {
    setIsPlaying(false);
    setShowControls(true);

    let updatedCompleted = [...completedLectures];

    if (isEnrolled && activeLecture) {
      try {
        const { data } = await api.post(`/courses/${courseId}/progress`, {
          lectureId: activeLecture._id,
        });
        if (data.success) {
          updatedCompleted = data.completedLectures || [];
          setCompletedLectures(updatedCompleted);
        }
      } catch (err) {
        console.error("Failed to save progress", err);
      }
    }

    if (course && course.lectures && activeLecture) {
      const currentIndex = course.lectures.findIndex(
        (l: any) => l._id === activeLecture._id
      );

      if (currentIndex !== -1 && currentIndex < course.lectures.length - 1) {
        const nextLecture = course.lectures[currentIndex + 1];

        if (nextLecture.isFree || isEnrolled) {
          if (nextLecture.folderName !== activeLecture.folderName) {
            setExpandedUnits((prev) => ({
              ...prev,
              [nextLecture.folderName || "General"]: true,
            }));
          }

          setTimeout(() => {
            handleSelectLecture(nextLecture);
          }, 2000);
        }
      }
    }
  };

  const toggleUnit = (folder: string) => {
    setExpandedUnits((prev) => ({ ...prev, [folder]: !prev[folder] }));
  };

  const bgTheme = isCoding ? "bg-[#161616]" : "bg-neutral-50";
  const textMain = isCoding ? "text-white" : "text-neutral-950";
  const textSub = isCoding ? "text-gray-400" : "text-gray-600";
  const borderTheme = isCoding ? "border-white/10" : "border-gray-200";
  const cardBg = isCoding
    ? "bg-[#1C1C1C] border border-white/10 shadow-lg"
    : "bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100";
  const innerBg = isCoding ? "bg-white/5" : "bg-neutral-100";

  if (isLoading) {
    const pulseBg = isCoding ? "bg-white/5" : "bg-gray-200";
    return (
      <div
        className={`min-h-screen w-full pt-[100px] lg:pt-[130px] pb-14 flex justify-center ${bgTheme} font-['Helvena'] transition-colors duration-500`}
      >
        <div className="w-full max-w-[1440px] px-4 md:px-8 lg:px-12 xl:px-20 flex flex-col lg:flex-row items-start gap-8 animate-pulse">
          <div className="flex-1 w-full flex flex-col gap-6">
            <div className={`w-full aspect-video rounded-xl ${pulseBg}`} />
            <div className={`w-3/4 h-8 rounded-md ${pulseBg}`} />
            <div className={`w-1/2 h-4 rounded-md ${pulseBg}`} />
          </div>
          <div className="hidden lg:flex w-[400px] flex-col gap-4 shrink-0">
            <div className={`w-full h-12 rounded-lg ${pulseBg}`} />
            <div className={`w-full h-64 rounded-xl ${pulseBg}`} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div
        className={`min-h-screen w-full flex flex-col justify-center items-center gap-4 ${bgTheme}`}
      >
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className={`${textMain} text-2xl font-semibold`}>Access Denied</h2>
        <p className={textSub}>{error}</p>
        <button
          onClick={() => router.push("/classroom")}
          className="px-6 py-2 mt-4 bg-[#FE6100] text-white rounded-lg"
        >
          Back to Classroom
        </button>
      </div>
    );
  }

  const groupedLectures =
    course.lectures?.reduce((acc: any, lecture: any) => {
      const folder = lecture.folderName || "General";
      if (!acc[folder]) acc[folder] = [];
      acc[folder].push(lecture);
      return acc;
    }, {}) || {};

  const CourseContentBlock = () => (
    <div
      className={`w-full rounded-md overflow-hidden flex flex-col ${borderTheme} border outline outline-1 outline-offset-[-1px] ${
        isCoding ? "outline-white/10" : "outline-gray-200"
      }`}
    >
      {Object.keys(groupedLectures).map((folderName, index) => {
        const lectures = groupedLectures[folderName];
        return (
          <div
            key={folderName}
            className={`w-full flex flex-col ${
              index !== Object.keys(groupedLectures).length - 1
                ? `border-b ${borderTheme}`
                : ""
            }`}
          >
            <button
              onClick={() => toggleUnit(folderName)}
              className={`w-full p-4 flex justify-between items-center transition-colors ${innerBg} hover:opacity-80`}
            >
              <div className="flex items-center gap-3">
                {expandedUnits[folderName] ? (
                  <ChevronUp className={`w-4 h-4 ${textMain}`} />
                ) : (
                  <ChevronDown className={`w-4 h-4 ${textMain}`} />
                )}
                <span
                  className={`${textMain} text-sm sm:text-base font-medium text-left`}
                >
                  {folderName}
                </span>
              </div>
              <span className={`${textSub} text-xs font-medium shrink-0`}>
                {lectures.length} Lectures
              </span>
            </button>

            <AnimatePresence initial={false}>
              {expandedUnits[folderName] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={`w-full flex flex-col overflow-hidden ${
                    isCoding ? "bg-[#1C1C1C]" : "bg-white"
                  }`}
                >
                  {lectures.map((lecture: any) => {
                    const isActive = activeLecture?._id === lecture._id;
                    const isLocked = !lecture.isFree && !isEnrolled;
                    const isCompleted = completedLectures.includes(lecture._id);

                    return (
                      <div
                        key={lecture._id}
                        onClick={() => handleSelectLecture(lecture)}
                        className={`w-full pl-5 pr-4 py-3.5 flex justify-between items-center border-t ${borderTheme} ${
                          isActive
                            ? isCoding
                              ? "bg-[#FE6100]/10 border-l-2 border-l-[#FE6100]"
                              : "bg-orange-50 border-l-2 border-l-[#FE6100]"
                            : "border-l-2 border-l-transparent hover:bg-black/5 cursor-pointer"
                        }`}
                      >
                        <div className="flex-1 flex items-start gap-3">
                          <div className="mt-0.5 shrink-0">
                            {isActive ? (
                              <PlayCircle className="w-4 h-4 text-[#FE6100] fill-[#FE6100]/20" />
                            ) : isLocked ? (
                              <Lock className={`w-4 h-4 ${textSub}`} />
                            ) : isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <PlayCircle className={`w-4 h-4 ${textSub}`} />
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span
                              className={`${textMain} text-sm font-medium line-clamp-2 ${
                                isLocked ? "opacity-50" : ""
                              } ${
                                isCompleted && !isActive ? "opacity-70" : ""
                              }`}
                            >
                              {lecture.title}
                            </span>
                            {isActive && (
                              <span
                                className={`${textSub} text-xs font-normal`}
                              >
                                Now Playing • {lecture.duration || 0} mins
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      className={`min-h-screen w-full pt-[100px] lg:pt-[130px] pb-14 flex justify-center ${bgTheme} font-['Helvena'] transition-colors duration-500`}
    >
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-8 right-8 sm:bottom-12 sm:right-12 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
              toast.type === "error"
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-emerald-50 text-emerald-600 border-emerald-200"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle size={20} />
            ) : (
              <CheckCircle2 size={20} />
            )}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-[1440px] px-4 md:px-8 lg:px-12 xl:px-20 flex flex-col lg:flex-row items-start gap-8">
        {/* LEFT COLUMN: PLAYER */}
        <div className="flex-1 w-full flex flex-col gap-6 lg:gap-8">
          <div
            ref={playerContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              if (isPlaying && !showSettings) setShowControls(false);
            }}
            className="w-full relative bg-black rounded-xl overflow-hidden aspect-video shadow-lg group flex flex-col justify-center items-center"
          >
            {activeLecture ? (
              <>
                {/* --- SECURE BLACKOUT OVERLAY --- */}
                <AnimatePresence>
                  {isObscured && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute inset-0 z-[60] bg-black flex flex-col items-center justify-center text-white cursor-pointer"
                      onClick={() => setIsObscured(false)}
                    >
                      <Lock className="w-12 h-12 mb-4 text-[#FE6100]" />
                      <h2 className="text-lg md:text-xl font-bold tracking-widest font-['Helvena']">
                        SECURE PLAYBACK
                      </h2>
                      <p className="text-xs md:text-sm mt-2 opacity-70">
                        Video paused to protect content. Click to resume.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {activeLecture.cloudflareUid ? (
                  // --- NETFLIX-LEVEL NATIVE CLOUDFLARE PLAYER ---
                  <iframe
                    src={`https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${activeLecture.cloudflareUid}/iframe?controls=true&autoplay=true&primaryColor=%23FE6100`}
                    className="absolute inset-0 w-full h-full border-none z-0"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;"
                  />
                ) : (
                  // --- LEGACY CLOUDINARY PLAYER (With Custom Controls) ---
                  <>
                    <video
                      ref={videoRef}
                      src={obfuscatedVideoUrl || activeLecture.videoUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={handleVideoEnd}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      controlsList="nodownload nofullscreen noremoteplayback"
                      disablePictureInPicture
                      className="w-full h-full object-cover absolute inset-0 z-0"
                      autoPlay
                    />

                    <div
                      className="absolute inset-0 z-10 cursor-pointer"
                      onClick={() => {
                        if (showSettings) setShowSettings(false);
                        else togglePlay();
                      }}
                    />

                    <div
                      className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 z-20 ${
                        showControls || !isPlaying ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <div className="w-full flex items-center mb-4 relative z-30">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progress}
                          onChange={handleSeek}
                          className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#FE6100]"
                          style={{
                            background: `linear-gradient(to right, #FE6100 ${progress}%, rgba(255,255,255,0.3) ${progress}%)`,
                          }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-white relative z-30">
                        <div className="flex items-center gap-5">
                          <button
                            onClick={togglePlay}
                            className="hover:text-[#FE6100] transition-colors focus:outline-none"
                          >
                            {isPlaying ? (
                              <Pause className="w-6 h-6 fill-current" />
                            ) : (
                              <Play className="w-6 h-6 fill-current" />
                            )}
                          </button>

                          <button
                            onClick={toggleMute}
                            className="hover:text-[#FE6100] transition-colors focus:outline-none"
                          >
                            {isMuted ? (
                              <VolumeX className="w-5 h-5" />
                            ) : (
                              <Volume2 className="w-5 h-5" />
                            )}
                          </button>

                          <span className="text-xs sm:text-sm font-medium tracking-wider opacity-90 hidden sm:block">
                            {currentTime}{" "}
                            <span className="opacity-50 mx-1">/</span>{" "}
                            {duration}
                          </span>
                        </div>

                        <div className="flex items-center gap-5 relative">
                          <AnimatePresence>
                            {showSettings && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute bottom-full right-10 mb-4 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg p-2 min-w-[140px] flex flex-col gap-1 z-50"
                              >
                                <div className="px-3 py-2 text-xs text-white/50 uppercase tracking-wider font-semibold border-b border-white/10 mb-1 flex items-center gap-2">
                                  <Gauge className="w-3 h-3" /> Speed
                                </div>
                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                  <button
                                    key={rate}
                                    onClick={() =>
                                      handlePlaybackRateChange(rate)
                                    }
                                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                                      playbackRate === rate
                                        ? "bg-[#FE6100]/20 text-[#FE6100] font-medium"
                                        : "text-white hover:bg-white/10"
                                    }`}
                                  >
                                    {rate === 1 ? "Normal" : `${rate}x`}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`transition-colors focus:outline-none ${
                              showSettings
                                ? "text-[#FE6100]"
                                : "text-white opacity-80 hover:opacity-100"
                            }`}
                          >
                            <Settings className="w-5 h-5" />
                          </button>

                          <button
                            onClick={toggleFullscreen}
                            className="hover:text-[#FE6100] transition-colors focus:outline-none opacity-80 hover:opacity-100"
                          >
                            <Maximize className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Secure Watermark Overlay 1: ID */}
                <AnimatePresence>
                  {watermarkId.visible && watermarkId.trace && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: watermarkId.scale }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ ease: "easeInOut", duration: 2 }}
                      style={{ top: watermarkId.top, left: watermarkId.left }}
                      className="absolute z-30 pointer-events-none select-none flex flex-col justify-center items-center opacity-20 mix-blend-overlay drop-shadow-sm"
                    >
                      <span className="text-white text-xs md:text-sm font-mono tracking-widest px-2 py-1 rounded">
                        ID:{" "}
                        {watermarkId.trace.viewerId ||
                          user?._id ||
                          user?.id ||
                          "GUEST"}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Secure Watermark Overlay 2: IP & Loc */}
                <AnimatePresence>
                  {watermarkIp.visible && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: watermarkIp.scale }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ ease: "easeInOut", duration: 2 }}
                      style={{ top: watermarkIp.top, left: watermarkIp.left }}
                      className="absolute z-30 pointer-events-none select-none flex flex-col justify-center items-center opacity-20 mix-blend-overlay drop-shadow-sm"
                    >
                      <span className="text-white text-[10px] md:text-xs font-mono tracking-widest px-2 py-1 rounded flex flex-col items-center gap-0.5">
                        <span>IP: {silentIp}</span>
                        <span>LOC: {geoCoords}</span>
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 relative">
                <PlayCircle className="w-12 h-12 mb-2 opacity-50" />
                <p>Select a lecture from the syllabus to start</p>
                <Lock className="w-40 h-40 absolute opacity-5 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="w-full flex flex-col gap-4">
            <h1
              className={`${textMain} text-xl md:text-2xl font-bold leading-tight`}
            >
              {activeLecture ? activeLecture.title : course.title}
            </h1>
            <p className={`${textSub} text-sm`}>
              {activeLecture ? activeLecture.description : course.description}
            </p>
          </div>

          {/* TABS */}
          <div
            ref={tabsRef}
            className="w-full flex flex-col gap-6 mt-2 scroll-mt-24"
          >
            <div
              className={`w-full border-b ${borderTheme} flex items-center gap-6 sm:gap-8 no-scrollbar`}
            >
              <LayoutGroup>
                {[
                  { id: "content", label: "Course Content", mobileOnly: true },
                  { id: "notes", label: "Notes" },
                  { id: "pyqs", label: "PYQs" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-3 relative flex-col items-center outline-none whitespace-nowrap ${
                      tab.mobileOnly ? "flex lg:hidden" : "flex"
                    }`}
                  >
                    <span
                      className={`${
                        activeTab === tab.id
                          ? "text-[#FE6100]"
                          : `${textSub} hover:${textMain}`
                      } text-sm sm:text-base font-medium transition-colors z-10 relative`}
                    >
                      {tab.label}
                    </span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="courseTabIndicator"
                        className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#FE6100] z-20"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                ))}
              </LayoutGroup>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "content" && (
                <motion.div
                  key="content-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full flex lg:hidden flex-col gap-4"
                >
                  <CourseContentBlock />
                </motion.div>
              )}

              {activeTab === "notes" && (
                <motion.div
                  key="notes-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full flex flex-col gap-4"
                >
                  <div
                    className={`p-4 rounded-xl border ${borderTheme} ${
                      isCoding ? "bg-[#1C1C1C]" : "bg-white"
                    } shadow-sm`}
                  >
                    <h3 className={`${textMain} text-lg font-semibold mb-4`}>
                      Class Notes
                    </h3>
                    <div className="flex flex-col gap-3">
                      {course.notes?.map((note: any) => (
                        <div
                          key={note._id}
                          className={`w-full p-4 rounded-md outline outline-1 flex justify-between items-center ${
                            isCoding
                              ? "bg-white/5 outline-white/10"
                              : "bg-white outline-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="text-blue-500" size={20} />
                            <div>
                              <p className={`${textMain} text-sm font-medium`}>
                                {note.title}
                              </p>
                              <p className={`${textSub} text-xs mt-0.5`}>
                                {note.fileSize || "PDF Document"}
                              </p>
                            </div>
                          </div>
                          {isEnrolled ? (
                            <a
                              href={note.pdfUrl}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                            >
                              <Download size={18} />
                            </a>
                          ) : (
                            <Lock className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      ))}
                      {(!course.notes || course.notes.length === 0) && (
                        <p className={textSub}>No notes uploaded yet.</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "pyqs" && (
                <motion.div
                  key="pyqs-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full flex flex-col gap-4"
                >
                  <div
                    className={`p-4 rounded-xl border ${borderTheme} ${
                      isCoding ? "bg-[#1C1C1C]" : "bg-white"
                    } shadow-sm`}
                  >
                    <h3 className={`${textMain} text-lg font-semibold mb-4`}>
                      Previous Year Questions
                    </h3>
                    <div className="flex flex-col gap-3">
                      {course.pyqs?.map((pyq: any) => (
                        <div
                          key={pyq._id}
                          className={`w-full p-4 rounded-md outline outline-1 flex justify-between items-center ${
                            isCoding
                              ? "bg-white/5 outline-white/10"
                              : "bg-white outline-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="text-purple-500" size={20} />
                            <div>
                              <p className={`${textMain} text-sm font-medium`}>
                                {pyq.title}
                              </p>
                              <p className={`${textSub} text-xs mt-0.5`}>
                                {pyq.fileSize || "PDF Document"}
                              </p>
                            </div>
                          </div>
                          {isEnrolled ? (
                            <a
                              href={pyq.pdfUrl}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-purple-500/10 text-purple-500 rounded-lg hover:bg-purple-500/20 transition-colors"
                            >
                              <Download size={18} />
                            </a>
                          ) : (
                            <Lock className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      ))}
                      {(!course.pyqs || course.pyqs.length === 0) && (
                        <p className={textSub}>No PYQs uploaded yet.</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: Desktop Syllabus */}
        <div
          className={`hidden lg:flex w-full lg:w-[380px] xl:w-[420px] rounded-xl flex-col p-4 sm:p-5 gap-4 shrink-0 ${cardBg}`}
        >
          <h2 className={`${textMain} text-xl font-semibold`}>
            Course Content
          </h2>
          <CourseContentBlock />
        </div>
      </div>
    </div>
  );
}
