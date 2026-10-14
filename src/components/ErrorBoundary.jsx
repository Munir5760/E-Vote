import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleClearData = () => {
    try {
      localStorage.removeItem("gh_shs_evote_app_state_v7");
    } catch (e) {
      // ignore
    }
    window.location.href = "/";
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-8 text-center border-red-500/40 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">Display Recovery Alert</h2>
            <p className="text-xs text-slate-400 mb-6">
              An unexpected display glitch occurred while rendering this view. Your election database remains safe and preserved.
            </p>

            {this.state.error && (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-left text-xs font-mono text-red-300 mb-6 max-h-32 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="btn-primary w-full sm:w-auto text-xs flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleClearData}
                className="btn-secondary w-full sm:w-auto text-xs flex items-center justify-center gap-2 text-amber-400"
              >
                <Home className="w-4 h-4" />
                <span>Reset to Fresh Session</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
