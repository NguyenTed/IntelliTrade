"use client";
import { motion } from "framer-motion";
import Header from "../layouts/Header";
import { useEffect, useRef, useState } from "react";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import type { PageResponse } from "@/features/articles/model/IPage";
import type { IArticles } from "@/features/articles/model/IArticles";
import { getTradingViewIdeasPaged } from "@/features/articles/api/GetIdeasApi";
import Slider from "react-slick";
import { IdeaCard } from "@/features/articles/components/ideas/IdeaCard";
import { getNewsPaged } from "@/features/articles/api/GetNewsApi";
import NewsCard from "@/features/articles/components/news/NewsCard";
import Footer from "../layouts/Footer";

export default function LandingPage() {
  const whiteSectionRef = useRef<HTMLDivElement | null>(null);
  const [ideas, setIdeas] = useState<IArticles[]>([]);
  const [news, setNews] = useState<IArticles[]>([]);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 960, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  useEffect(() => {
    const getArticles = async () => {
      try {
        const resIdeas: PageResponse<IArticles> =
          await getTradingViewIdeasPaged({
            page: 1,
            size: 12,
          });
        setIdeas(resIdeas.content);
        const resNews: PageResponse<IArticles> = await getNewsPaged({
          page: 1,
          size: 12,
        });
        setNews(resNews.content);
      } catch (err: any) {
        console.error(err?.message ?? "Failed to fetch articles");
      }
    };
    getArticles();
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-black overflow-x-hidden">
      <Header whiteSectionRef={whiteSectionRef} />

      {/* Hero Section với video */}
      <div className="relative h-screen">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/media/trading.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Intro Text */}
        <div className="relative flex flex-col gap-10 items-center justify-start pt-[10%] h-screen text-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-bold mb-4"
          >
            Look first / Then leap.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-lg md:text-2xl"
          >
            The best trades require research, then commitment.
          </motion.p>

          <button
            className="px-[50px] py-4 font-semibold text-black text-[20px] bg-white
                       shadow-md transition hover:bg-gray-200 rounded-lg cursor-pointer"
            onClick={() => {
              window.location.href = "/chart";
            }}
          >
            Get started
          </button>
        </div>
      </div>

      {/* Scroll Content */}
      <div
        ref={whiteSectionRef}
        className="z-10 bg-white text-gray-800 rounded-t-[35px] pt-[80px] pb-[120px] px-[40px]"
      >
        <section className="mb-10">
          <div>
            <a href="/ideas">
              <h3 className="font-bold text-[27px] hover:text-[#2969FF] cursor-pointer transition-colors mb-4">
                Community ideas <ArrowForwardIosIcon sx={{ fontSize: 20 }} />
              </h3>
            </a>
            <Slider {...settings}>
              {ideas.map((idea, i) => (
                <div key={i}>
                  <IdeaCard item={idea} />
                </div>
              ))}
            </Slider>
          </div>
        </section>

        <section className="">
          <div>
            <a href="/news">
              <h3 className="font-bold text-[27px] hover:text-[#2969FF] cursor-pointer transition-colors mb-4">
                Top stories <ArrowForwardIosIcon sx={{ fontSize: 20 }} />
              </h3>
            </a>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {news.map((item, i) => (
                <NewsCard key={item.id ?? i} item={item} />
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

function NextArrow(props: any) {
  const { className, onClick } = props;
  return (
    <div
      className={`${className} !flex !items-center !justify-center !w-10 !h-10 
                  !bg-white !rounded-full !right-[-20px] border border-gray-300 !shadow-md
                group !z-20`}
      onClick={onClick}
    >
      <ArrowForwardIosIcon
        sx={{
          fontSize: 14,
          color: "black",
          transition: "color 0.2s",
        }}
        className="group-hover:!text-[#2969FF]"
      />
    </div>
  );
}

function PrevArrow(props: any) {
  const { className, onClick } = props;
  return (
    <div
      className={`${className} !flex !items-center !justify-center !w-10 !h-10 
                  !bg-white !rounded-full !left-[-20px] border border-gray-300 !shadow-md
                group !z-20`}
      onClick={onClick}
    >
      <ArrowBackIosNewIcon
        sx={{
          fontSize: 14,
          color: "black",
          transition: "color 0.2s",
        }}
        className="group-hover:!text-[#2969FF]"
      />
    </div>
  );
}
