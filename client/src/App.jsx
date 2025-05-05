import { useEffect, useRef, useState } from "react";

function App() {
  const panoramaRef = useRef(null);
  const [panoramas, setPanoramas] = useState([
    {
      id: "default",
      url: "https://pannellum.org/images/alma.jpg",
      thumbnail: "https://pannellum.org/images/alma.jpg",
      pitch: 10,
      yaw: 180,
      hfov: 110,
      hotspots: [],
    },
  ]);
  const [currentPanoramaId, setCurrentPanoramaId] = useState("default");
  const [addingHotspot, setAddingHotspot] = useState(false);
  const [hotspotCoords, setHotspotCoords] = useState(null);

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
            thumbnail: reader.result,
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

  const handleResetAlignment = () => {
    setPanoramas(
      panoramas.map((p) =>
        p.id === currentPanoramaId ? { ...p, pitch: 0, yaw: 0, hfov: 100 } : p
      )
    );
  };

  const startAddingHotspot = () => {
    setAddingHotspot(true);
  };

  const handlePanoramaClick = (pitch, yaw) => {
    if (addingHotspot) {
      setHotspotCoords({ pitch, yaw });
    }
  };

  const handleHotspotSelect = (targetId) => {
    if (hotspotCoords) {
      setPanoramas(
        panoramas.map((p) =>
          p.id === currentPanoramaId
            ? {
                ...p,
                hotspots: [
                  ...p.hotspots,
                  {
                    pitch: hotspotCoords.pitch,
                    yaw: hotspotCoords.yaw,
                    targetId,
                    text: `To ${panoramas.find((p) => p.id === targetId).id}`,
                  },
                ],
              }
            : p
        )
      );
      setAddingHotspot(false);
      setHotspotCoords(null);
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
          autoRotate: 0,
          mouseZoom: true,
          draggable: true,
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
          autoLoad: true,
        },
        scenes: scenes,
      });

      viewer.on("mousedown", (event) => {
        if (addingHotspot) {
          const coords = viewer.mouseEventToCoords(event);
          handlePanoramaClick(coords[0], coords[1]);
        }
      });

      return () => {
        viewer.destroy();
      };
    }
  }, [panoramas, currentPanoramaId, addingHotspot]);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Tour Editor</h2>

        {/* Upload Section */}
        <div className="upload-section">
          <label>
            <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            Upload Panorama
          </label>
          <input
            type="file"
            id="panorama-upload"
            accept="image/jpeg,image/png"
            onChange={handleFileUpload}
          />
        </div>

        {/* Panoramas List */}
        <div className="panoramas-list">
          <h3>Panoramas</h3>
          {panoramas.map((p) => (
            <div
              key={p.id}
              onClick={() => setCurrentPanoramaId(p.id)}
              className={`panorama-item ${p.id === currentPanoramaId ? "active" : ""}`}
            >
              <img src={p.thumbnail} alt={p.id} />
              <span>{p.id}</span>
            </div>
          ))}
        </div>

        {/* Alignment Controls */}
        <div className="alignment-controls">
          <h3>
            <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
            Alignment
          </h3>
          <div>
            <label>Pitch: {currentPanorama?.pitch}°</label>
            <input
              type="range"
              min="-90"
              max="90"
              value={currentPanorama?.pitch || 0}
              onChange={(e) => handleAlignmentChange("pitch", e.target.value)}
            />
          </div>
          <div>
            <label>Yaw: {currentPanorama?.yaw}°</label>
            <input
              type="range"
              min="-180"
              max="180"
              value={currentPanorama?.yaw || 0}
              onChange={(e) => handleAlignmentChange("yaw", e.target.value)}
            />
          </div>
          <div>
            <label>Field of View: {currentPanorama?.hfov}°</label>
            <input
              type="range"
              min="50"
              max="120"
              value={currentPanorama?.hfov || 100}
              onChange={(e) => handleAlignmentChange("hfov", e.target.value)}
            />
          </div>
          <button onClick={handleResetAlignment}>Reset Alignment</button>
        </div>

        {/* Hotspot Controls */}
        <div className="hotspot-controls">
          <button disabled={panoramas.length < 2} onClick={startAddingHotspot}>
            <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Hotspot
          </button>
          {addingHotspot && (
            <div className="hotspot-panel">
              <p>Click on the panorama to place the hotspot.</p>
              {hotspotCoords && (
                <>
                  <h4>Select Target Panorama</h4>
                  <div className="buttons">
                    {panoramas
                      .filter((p) => p.id !== currentPanoramaId)
                      .map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleHotspotSelect(p.id)}
                        >
                          {p.id}
                        </button>
                      ))}
                    <button
                      className="cancel"
                      onClick={() => {
                        setAddingHotspot(false);
                        setHotspotCoords(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Viewer */}
      <div className="viewer-container">
        <div className="viewer">
          <div ref={panoramaRef}></div>
        </div>
      </div>
    </div>
  );
}

export default App;