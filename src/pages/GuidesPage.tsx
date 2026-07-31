/** GuidesPage — Route: /guides */
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import GuideView from "../components/GuideView";

export default function GuidesPage() {
  const location = useLocation();

  useEffect(() => {
    // Basic hash handling if present
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  return <GuideView />;
}
