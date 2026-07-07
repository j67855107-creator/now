import React, { ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center font-sans">
          <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm max-w-md w-full">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
              An unexpected error occurred
            </h1>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Something went wrong while rendering this page. Our team has been notified, and we are working to resolve the issue.
            </p>
            {this.state.error && (
              <pre className="text-left text-[11px] font-mono bg-slate-50 border border-slate-150 p-3 rounded-lg overflow-x-auto text-slate-650 max-h-[140px] mb-6 select-all scrollbar-thin">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-all text-sm cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>Reset and Return Home</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
