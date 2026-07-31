/** ConvertPDFPage — Route: /converters/pdf-to-markdown */
import React, { useEffect } from "react";
import { useAppContext } from "../../contexts/AppContext";
import ConversionUI from "../../components/ConversionUI";

export default function ConvertPDFPage() {
  const ctx = useAppContext();

  useEffect(() => {
    // Clear state on load to avoid cross-contamination
    ctx.setFile(null);
    ctx.setConversionResult("");
    ctx.setEditedMarkdown("");
    ctx.setResultDetails(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <ConversionUI
      viewMode="convert-pdf"
      setViewMode={ctx.setViewMode}
      file={ctx.file}
      setFile={ctx.setFile}
      converting={ctx.converting}
      setConverting={ctx.setConverting}
      conversionResult={ctx.conversionResult}
      setConversionResult={ctx.setConversionResult}
      editedMarkdown={ctx.editedMarkdown}
      setEditedMarkdown={ctx.setEditedMarkdown}
      resultDetails={ctx.resultDetails}
      setResultDetails={ctx.setResultDetails}
      runConversion={ctx.runConversion}
      triggerAlert={ctx.triggerAlert}
      selectPreconfigMode={ctx.selectPreconfigMode}
      handleFileChange={ctx.handleFileChange}
      handleDrag={ctx.handleDrag}
      handleDrop={ctx.handleDrop}
      fileInputRef={ctx.fileInputRef}
      loadingStep={ctx.loadingStep}
    />
  );
}
