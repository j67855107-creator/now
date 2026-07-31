/** BlogPage — Route: /blog */
import React, { useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";
import BlogView from "../components/BlogView";

export default function BlogPage() {
  const { readingBlog, setReadingBlog, setViewMode } = useAppContext();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <BlogView
      readingBlog={readingBlog}
      setReadingBlog={setReadingBlog}
      setViewMode={setViewMode}
    />
  );
}
