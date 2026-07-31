/** FAQPage — Route: /faq */
import React, { useEffect } from "react";
import FAQView from "../components/FAQView";

export default function FAQPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return <FAQView />;
}
