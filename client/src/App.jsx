import { useEffect, useRef, useState } from "react";

function App() {
  const panoramaRef = useRef(null);
  const [panoramaUrl, setPanoramaUrl] = useState(
    "https://pannellum.org/images/alma.jpg"
  );

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader();
      reader.onload = () => {
        setPanoramaUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a JPG or PNG image.");
    }
  };

  useEffect(() => {
    if (window.pannellum && panoramaRef.current) {
      const viewer = window.pannellum.viewer(panoramaRef.current, {
        type: "equirectangular",
        panorama: panoramaUrl,
        autoLoad: true,
        pitch: 10,
        yaw: 180,
        hfov: 110,
      });

      // Cleanup to destroy viewer on component unmount or panorama change
      return () => {
        viewer.destroy();
      };
    }
  }, [panoramaUrl]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">360 Tour Platform</h1>
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label
            htmlFor="panorama-upload"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Upload 360 Panorama
          </label>
          <input
            type="file"
            id="panorama-upload"
            accept="image/jpeg,image/png"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <div
          ref={panoramaRef}
          className="w-full"
          style={{ height: "500px" }}
        ></div>
      </div>
      <p className="mt-4 text-gray-600">
        {panoramaUrl ? "Panorama loaded. Try uploading your own!" : "No panorama loaded."}
      </p>
    </div>
  );
}

export default App;