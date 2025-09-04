import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import type { IArticles } from "../model/IArticles";
import { getIdeaBySlug } from "../api/GetIdeasApi";
import { ArticleContext } from "../contexts/ArticleContext";
import IdeaHeader from "../components/ideas/IdeaHeader";
import MetaRows from "../components/ideas/MetaRows";
import IdeaContent from "../components/ideas/IdeaContent";
import { Comments } from "../components/ideas/Comments";
import IdeaRightInfo from "../components/ideas/IdeaRightInfo";
import Header from "@/shared/layouts/Header";

export default function IdeasDetailPage() {
  const whiteSectionRef = useRef<HTMLDivElement | null>(null);
  const { slug = "" } = useParams();
  const [data, setData] = useState<IArticles | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await getIdeaBySlug(slug);
        setData(res);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="h-10 w-40 rounded bg-gray-200 animate-pulse mb-4" />
        <div className="w-full aspect-video rounded-lg bg-gray-200 animate-pulse" />
        <div className="mt-6 space-y-3">
          <div className="h-7 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-red-600 font-medium">Không tải được bài viết.</p>
        {err && <p className="text-gray-600 mt-2 text-sm">{err}</p>}
        <Link
          to="/ideas"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline mt-4"
        >
          <ArrowBackIosNewRoundedIcon sx={{ fontSize: 16 }} /> Quay lại danh
          sách
        </Link>
      </div>
    );
  }

  return (
    <ArticleContext.Provider value={data.id}>
      <div>
        <Header whiteSectionRef={whiteSectionRef} />
        <div
          ref={whiteSectionRef}
          className="w-full h-auto mx-auto px-[32px] md:px-[42px] xl:px-[100px] py-6 mt-10"
        >
          <IdeaHeader data={data} />

          <div className="mt-6 xl:px-[10%]">
            <MetaRows data={data} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 ">
              {/* content */}
              <div className="lg:col-span-8 xl:col-span-9">
                <IdeaContent contentHtml={data.contentHtml} />
                <Comments comments={data.comments} />
              </div>

              {/* right info */}
              <IdeaRightInfo tags={data.tags} />
            </div>
          </div>
        </div>
      </div>
    </ArticleContext.Provider>
  );
}
