/** ToolsPage — Route: /ai-tools */
import React, { useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";
import ToolsView from "../components/ToolsView";

export default function ToolsPage() {
  const { setViewMode, handleToolClick } = useAppContext();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <ToolsView
      setViewMode={setViewMode}
      onSelectTool={(plugin) => handleToolClick(plugin.id)}
    />
  );
}
