/** ContactPage — Route: /contact */
import React, { useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";
import ContactView from "../components/ContactView";

export default function ContactPage() {
  const { triggerAlert } = useAppContext();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return <ContactView triggerAlert={triggerAlert} />;
}
