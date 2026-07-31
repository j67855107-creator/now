/** AboutPage — Route: /about */
import React, { useEffect } from "react";
import AboutView from "../components/AboutView";

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return <AboutView />;
}
