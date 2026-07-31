/** TermsPage — Route: /terms */
import React, { useEffect } from "react";
import TermsView from "../components/TermsView";

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return <TermsView />;
}
