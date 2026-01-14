import { useState } from 'react';

/**
 * Test Component untuk testing ErrorBoundary
 *
 * CARA MENGGUNAKAN:
 * 1. Import component ini ke halaman yang ingin di test
 * 2. Wrap dengan ErrorBoundary
 * 3. Klik button untuk trigger error
 *
 * Contoh:
 * <ErrorBoundary>
 *   <TestErrorComponent />
 * </ErrorBoundary>
 */
const TestErrorComponent = () => {
  const [shouldThrowError, setShouldThrowError] = useState(false);

  // Trigger error saat render
  if (shouldThrowError) {
    throw new Error('Test Error: ErrorBoundary test berhasil!');
  }

  const throwErrorOnClick = () => {
    // Error di event handler TIDAK ditangkap ErrorBoundary
    // Ini harus di-handle dengan try-catch manual
    throw new Error('Event handler error - TIDAK ditangkap ErrorBoundary');
  };

  const throwErrorOnRender = () => {
    // Trigger error saat render (DITANGKAP ErrorBoundary)
    setShouldThrowError(true);
  };

  const throwAsyncError = async () => {
    // Async error TIDAK ditangkap ErrorBoundary
    // Harus di-handle dengan try-catch
    throw new Error('Async error - TIDAK ditangkap ErrorBoundary');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-yellow-900 mb-4">
          🧪 ErrorBoundary Test Component
        </h2>

        <p className="text-yellow-800 mb-6">
          Component ini untuk testing ErrorBoundary. Klik salah satu button untuk trigger error.
        </p>

        <div className="space-y-4">
          {/* Test 1: Render Error (DITANGKAP) */}
          <div className="bg-white p-4 rounded border border-yellow-300">
            <h3 className="font-semibold text-gray-900 mb-2">
              ✅ Test 1: Render Error (DITANGKAP ErrorBoundary)
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Error yang terjadi saat rendering AKAN ditangkap oleh ErrorBoundary.
            </p>
            <button
              onClick={throwErrorOnRender}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Throw Render Error
            </button>
          </div>

          {/* Test 2: Event Handler Error (TIDAK DITANGKAP) */}
          <div className="bg-white p-4 rounded border border-yellow-300">
            <h3 className="font-semibold text-gray-900 mb-2">
              ❌ Test 2: Event Handler Error (TIDAK DITANGKAP)
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Error di event handler TIDAK ditangkap ErrorBoundary.
              Akan muncul error di console, tapi app tidak crash.
            </p>
            <button
              onClick={throwErrorOnClick}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              Throw Event Error (Check Console)
            </button>
          </div>

          {/* Test 3: Async Error (TIDAK DITANGKAP) */}
          <div className="bg-white p-4 rounded border border-yellow-300">
            <h3 className="font-semibold text-gray-900 mb-2">
              ❌ Test 3: Async Error (TIDAK DITANGKAP)
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Error async TIDAK ditangkap ErrorBoundary.
              Butuh try-catch manual.
            </p>
            <button
              onClick={throwAsyncError}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Throw Async Error (Check Console)
            </button>
          </div>

          {/* Test 4: Safe Operation */}
          <div className="bg-white p-4 rounded border border-green-300">
            <h3 className="font-semibold text-gray-900 mb-2">
              ✅ Test 4: Normal Operation (No Error)
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Button normal yang tidak throw error.
            </p>
            <button
              onClick={() => alert('No error! Everything works fine.')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              No Error Button
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-300 rounded">
          <h4 className="font-semibold text-blue-900 mb-2">📝 Catatan:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Render errors → DITANGKAP ErrorBoundary</li>
            <li>• Event handler errors → Perlu try-catch manual</li>
            <li>• Async errors → Perlu try-catch manual</li>
            <li>• Setelah test, reload page untuk reset</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestErrorComponent;

/**
 * CARA MENGGUNAKAN DI APP:
 *
 * 1. Import di App.jsx atau halaman lain:
 *    import TestErrorComponent from './components/TestErrorComponent';
 *
 * 2. Tambah route (temporary):
 *    <Route path="/test-error" element={<TestErrorComponent />} />
 *
 * 3. Akses di browser:
 *    http://localhost:3000/test-error
 *
 * 4. Klik "Throw Render Error" untuk trigger ErrorBoundary
 *
 * 5. Hapus route setelah testing selesai
 */
