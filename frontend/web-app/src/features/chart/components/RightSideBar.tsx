"use client";

import { useEffect, useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { getTradingViewIdeasPaged } from "@/features/articles/api/GetIdeasApi";
import { getNewsPaged } from "@/features/articles/api/GetNewsApi";
import type { IArticles } from "@/features/articles/model/IArticles";
import type { PageResponse } from "@/features/articles/model/IPage";
import { IdeaCard } from "@/features/articles/components/ideas/IdeaCard";
import NewsCard from "@/features/articles/components/news/NewsCard";
import { IdeaCard2 } from "@/features/articles/components/ideas/IdeaCard2";

export default function RightSidebar() {
  const [value, setValue] = useState(0);
  const [ideas, setIdeas] = useState<IArticles[]>([]);
  const [news, setNews] = useState<IArticles[]>([]);

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

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur sticky top-0 h-full flex flex-col ">
      {/* Tabs Header */}
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="Ideas and News tabs"
        variant="fullWidth"
      >
        <Tab label="Ideas" />
        <Tab label="News" />
      </Tabs>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto px-[10%]">
        {value === 0 && (
          <div className="space-y-4">
            {ideas.map((idea) => (
              <IdeaCard2 key={idea.id} item={idea} />
            ))}
          </div>
        )}

        {value === 1 && (
          <div className="space-y-4">
            {news.map((n) => (
              <NewsCard key={n.id} item={n} />
            ))}
          </div>
        )}
        <a
          href="/ideas"
          className="block w-full mb-2 py-2 text-center hover:bg-[#F2F2F2] transition-colors rounded-lg cursor-auto border-1 border-gray-200"
        >
          Show more
        </a>
      </div>
    </div>
  );
}
