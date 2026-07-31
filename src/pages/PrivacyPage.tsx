/** PrivacyPage — Route: /privacy */
import React, { useEffect } from "react";
import PrivacyView from "../components/PrivacyView";

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return <PrivacyView />;
}
