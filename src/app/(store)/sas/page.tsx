import React from "react";

const TestLogoIconPage = () => {
  // Current TupperStock logo icon SVG
  const logoSvg = (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          TupperStock Logo Icon Test
        </h1>

        {/* Large Logo Icon for Screenshot */}
        <div className="text-center mb-16">
          <h2 className="text-xl font-medium text-gray-700 mb-6">
            Large Logo Icon (Recommended for Screenshot)
          </h2>
          <div className="inline-block">
            <div className="w-64 h-64 bg-black rounded-2xl flex items-center justify-center">
              <div className="w-40 h-40 text-white">{logoSvg}</div>
            </div>
          </div>
        </div>

        {/* Different Sizes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-3">16x16px</h3>
            <div className="w-4 h-4 bg-black rounded flex items-center justify-center mx-auto">
              <div className="w-2.5 h-2.5 text-white">{logoSvg}</div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-3">32x32px</h3>
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center mx-auto">
              <div className="w-5 h-5 text-white">{logoSvg}</div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-3">64x64px</h3>
            <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto">
              <div className="w-10 h-10 text-white">{logoSvg}</div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              128x128px
            </h3>
            <div className="w-32 h-32 bg-black rounded-xl flex items-center justify-center mx-auto">
              <div className="w-20 h-20 text-white">{logoSvg}</div>
            </div>
          </div>
        </div>

        {/* Different Background Colors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              Black Background
            </h3>
            <div className="w-24 h-24 bg-black rounded-lg flex items-center justify-center mx-auto">
              <div className="w-16 h-16 text-white">{logoSvg}</div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              White Background
            </h3>
            <div className="w-24 h-24 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mx-auto">
              <div className="w-16 h-16 text-black">{logoSvg}</div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              Gray Background
            </h3>
            <div className="w-24 h-24 bg-gray-600 rounded-lg flex items-center justify-center mx-auto">
              <div className="w-16 h-16 text-white">{logoSvg}</div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              Transparent
            </h3>
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mx-auto">
              <div className="w-16 h-16 text-black">{logoSvg}</div>
            </div>
          </div>
        </div>

        {/* Logo with Text Combinations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              Icon + Text (Horizontal)
            </h3>
            <div className="inline-flex items-center bg-black rounded-lg px-4 py-3">
              <div className="w-8 h-8 text-white mr-3">{logoSvg}</div>
              <span className="text-white font-medium text-lg">
                TupperStock
              </span>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              Icon + Text (Vertical)
            </h3>
            <div className="inline-flex flex-col items-center bg-black rounded-lg px-4 py-3">
              <div className="w-8 h-8 text-white mb-2">{logoSvg}</div>
              <span className="text-white font-medium text-sm">
                TupperStock
              </span>
            </div>
          </div>
        </div>

        {/* SVG Code */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">SVG Code</h3>
          <pre className="text-sm text-gray-700 bg-white p-4 rounded border overflow-x-auto">
            {`<svg fill="currentColor" viewBox="0 0 20 20">
  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
</svg>`}
          </pre>
        </div>

        {/* Specifications */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            Logo Icon Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p>
                <strong>ViewBox:</strong> 0 0 20 20
              </p>
              <p>
                <strong>Format:</strong> SVG (scalable)
              </p>
              <p>
                <strong>Style:</strong> Outlined/Stroke
              </p>
              <p>
                <strong>Theme:</strong> Storage/Container
              </p>
            </div>
            <div>
              <p>
                <strong>Recommended Sizes:</strong>
              </p>
              <p>• Favicon: 16x16px, 32x32px</p>
              <p>• App Icon: 64x64px, 128x128px</p>
              <p>• Web Logo: 256x256px+</p>
              <p>• Print: 512x512px+</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            <strong>Instructions:</strong>
          </p>
          <p>
            1. Take a screenshot of the large logo icon (256x256px) at the top
          </p>
          <p>2. Use browser zoom (Ctrl/Cmd + Plus) for higher resolution</p>
          <p>3. Import to Photoshop as a smart object</p>
          <p>4. Use the SVG code for vector editing</p>
        </div>
      </div>
    </div>
  );
};

export default TestLogoIconPage;
