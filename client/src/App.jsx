import { useEffect, useRef } from "react";

function App() {
  const panoramaRef = useRef(null);

  useEffect(() => {
    if (window.pannellum && panoramaRef.current) {
      window.pannellum.viewer(panoramaRef.current, {
        type: "equirectangular",
        panorama: "https://pannellum.org/images/alma.jpg",
        autoLoad: true,
        pitch: 10,
        yaw: 180,
        hfov: 110,
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">360 Tour Platform</h1>
      <div
        ref={panoramaRef}
        className="w-full max-w-4xl"
        style={{ height: "500px" }}
      ></div>
      <p className="mt-4 text-gray-600">
        Test panorama loaded. Next: upload functionality.
      </p>
    </div>
  );
}

export default App;