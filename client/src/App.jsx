import { useEffect, useRef, useState } from "react";

function App() {
  const panoramaRef = useRef(null);
  const [panoramas, setPanoramas] = useState([
    {
      id: "default",
      url: "https://pannellum.org/images/alma.jpg",
      pitch: 10,
      yaw: 180,
      hfov: 110,
      hotspots: [],
    },
  ]);
  const [currentPanoramaId, setCurrentPanoramaId] = useState("default");
  const [addingHotspot, setAddingHotspot] = useState(false);

  const currentPanorama = panoramas.find((p) => p.id === currentPanoramaId);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader();
      reader.onload = () => {
        const newId = `pano-${Date.now()}`;
        setPanoramas([
          ...panoramas,
          {
            id: newId,
            url: reader.result,
            pitch: 0,
            yaw: 0,
            hfov: 100,
            hotspots: [],
          },
        ]);
        setCurrentPanoramaId(newId);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a JPG or PNG image.");
    }
  };

  const handleAlignmentChange = (field, value) => {
    setPanoramas(
      panoramas.map((p) =>
        p.id === currentPanoramaId ? { ...p, [field]: Number(value) } : p
      )
    );
  };

  const handleAddHotspot = (pitch, yaw) => {
    setAddingHotspot({ pitch, yaw });
  };

  const handleHotspotSelect = (targetId) => {
    if (addingHotspot) {
      setPanoramas(
        panoramas.map((p) =>
          p.id === currentPanoramaId
            ? {
                ...p,
                hotspots: [
                  ...p.hotspots,
                  {
                    pitch: addingHotspot.pitch,
                    yaw: addingHotspot.yaw,
                    targetId,
                    text: `To ${panoramas.find((p) => p.id === targetId).id}`,
                  },
                ],
              }
            : p
        )
      );
      setAddingHotspot(false);
    }
  };

  useEffect(() => {
    if (window.pannellum && panoramaRef.current && currentPanorama) {
      const scenes = panoramas.reduce((acc, p) => {
        acc[p.id] = {
          type: "equirectangular",
          panorama: p.url,
          pitch: p.pitch,
          yaw: p.yaw,
          hfov: p.hfov,
          hotSpots: p.hotspots.map((hs) => ({
            pitch: hs.pitch,
            yaw: hs.yaw,
            type: "scene",
            text: hs.text,
            sceneId: hs.targetId,
          })),
        };
        return acc;
      }, {});

      const viewer = window.pannellum.viewer(panoramaRef.current, {
        default: {
          firstScene: currentPanoramaId,
          sceneFadeDuration: 1000,
        },
        scenes: scenes,
      });

      viewer.on("mousedown", (event) => {
        if (addingHotspot) return;
        const coords = viewer.mouseEventToCoords(event);
        handleAddHotspot(coords[0], coords[1]);
      });

      return () => {
        viewer.destroy();
      };
    }
  }, [panoramas, currentPanoramaId, addingHotspot]);

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
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Panoramas</h3>
          <div className="flex flex-wrap gap-2">
            {panoramas.map((p) => (
              <button
                key={p.id}
                onClick={() => setCurrentPanoramaId(p.id)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  p.id === currentPanoramaId
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {p.id}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pitch: {currentPanorama?.pitch}°
            </label>
            <input
              type="range"
              min="-90"
              max="90"
              value={currentPanorama?.pitch || 0}
              onChange={(e) => handleAlignmentChange("pitch", e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yaw: {currentPanorama?.yaw}°
            </label>
            <input
              type="range"
              min="-180"
              max="180"
              value={currentPanorama?.yaw || 0}
              onChange={(e) => handleAlignmentChange("yaw", e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field of View: {currentPanorama?.hfov}°
            </label>
            <input
              type="range"
              min="50"
              max="120"
              value={currentPanorama?.hfov || 100}
              onChange={(e) => handleAlignmentChange("hfov", e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        {addingHotspot && (
          <div className="mb-4 p-4 bg-blue-50 rounded-md">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Select Target Panorama for Hotspot
            </h3>
            <div className="flex flex-wrap gap-2">
              {panoramas
                .filter((p) => p.id !== currentPanoramaId)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleHotspotSelect(p.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600"
                  >
                    {p.id}
                  </button>
                ))}
              <button
                onClick={() => setAddingHotspot(false)}
                className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div
          ref={panoramaRef}
          className="w-full"
          style={{ height: "500px" }}
        ></div>
      </div>
      <p className="mt-4 text-gray-600">
        {currentPanorama ? "Panorama loaded. Add hotspots to create a tour." : "No panorama loaded."}
      </p>
    </div>
  );
}

export default App;