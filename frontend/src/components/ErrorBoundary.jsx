import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Error Boundary Component
 * Menangkap error React dan mencegah white screen of death
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state agar next render akan show fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error ke console untuk debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state dengan error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Optional: Kirim error ke error tracking service (Sentry, LogRocket, dll)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Optional: Log ke backend
    this.logErrorToBackend(error, errorInfo);
  }

  logErrorToBackend = async (error, errorInfo) => {
    try {
      // Uncomment jika sudah ada endpoint untuk error logging
      // await axios.post('/api/logs/frontend-error', {
      //   error: error.toString(),
      //   errorInfo: errorInfo.componentStack,
      //   userAgent: navigator.userAgent,
      //   timestamp: new Date().toISOString()
      // });
    } catch (err) {
      console.error('Failed to log error to backend:', err);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Optional: Callback saat reset
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI saat terjadi error
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
              Oops! Terjadi Kesalahan
            </h1>

            {/* Error Description */}
            <p className="text-gray-600 text-center mb-8">
              Maaf, terjadi kesalahan pada aplikasi. Tim kami telah diberitahu dan sedang memperbaikinya.
            </p>

            {/* Error Details (hanya tampil di development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">Error Details (Development Only):</h3>
                <p className="text-sm text-red-800 font-mono mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="text-xs text-red-700">
                    <summary className="cursor-pointer font-semibold mb-1">Stack Trace</summary>
                    <pre className="whitespace-pre-wrap overflow-auto max-h-64 p-2 bg-white rounded">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                Coba Lagi
              </button>

              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                Reload Halaman
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Home className="w-5 h-5" />
                Kembali ke Beranda
              </button>
            </div>

            {/* Error Count Warning */}
            {this.state.errorCount > 3 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm text-center">
                  Error terus terjadi? Silakan hubungi administrator atau coba lagi nanti.
                </p>
              </div>
            )}

            {/* Contact Support */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Butuh bantuan? Hubungi administrator sistem</p>
            </div>
          </div>
        </div>
      );
    }

    // Jika tidak ada error, render children seperti biasa
    return this.props.children;
  }
}

/**
 * Higher Order Component untuk wrap component dengan ErrorBoundary
 *
 * Usage:
 * export default withErrorBoundary(YourComponent);
 */
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
