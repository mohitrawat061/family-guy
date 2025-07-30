import React, { useState, useEffect } from "react";
import MuxPlayer from "@mux/mux-player-react";
import "./App.css";

// Episode data with poster images
const episodeData = [
  { id: 1, title: "Peter, Peter, Caviar Eater", poster: "/posters/ep1.jpg" },
  { id: 2, title: "Holy Crap", poster: "/posters/ep2.jpg" },
  { id: 3, title: "Da Boom", poster: "/posters/ep3.jpg" },
  { id: 4, title: "Mind Over Murder", poster: "/posters/ep4.jpg" },
  { id: 5, title: "A Hero Sits Next Door", poster: "/posters/ep5.jpg" },
  { id: 6, title: "The Son Also Draws", poster: "/posters/ep6.jpg" },
  { id: 7, title: "Brian: Portrait of a Dog", poster: "/posters/ep7.jpg" },
  { id: 8, title: "Peter, Peter, Caviar Eater", poster: "/posters/ep8.jpg" },
  { id: 9, title: "Running Mates", poster: "/posters/ep9.jpg" },
  {
    id: 10,
    title: "A Picture Is Worth 1,000 Bucks",
    poster: "/posters/ep10.jpg",
  },
];

function App() {
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // Fetch list of episodes when component mounts
  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const username = process.env.REACT_APP_MUX_TOKEN_ID;
        const password = process.env.REACT_APP_MUX_TOKEN_SECRET;

        if (!username || !password) {
          throw new Error("Mux credentials are not set");
        }

        const credentials = btoa(`${username}:${password}`);
        const response = await fetch("https://api.mux.com/video/v1/assets/", {
          method: "GET",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error Status: ${response.status}`);
        }

        const jsonData = await response.json();

        // Transform the data to create episode list with proper numbering
        const episodeList = jsonData.data.map((asset, index) => ({
          id: asset.id,
          episodeNumber: index + 1, // Sequential episode number
          title: episodeData[index]?.title || `Episode ${index + 1}`,
          poster: episodeData[index]?.poster || "/posters/default.jpg",
          playbackId: asset.playback_ids?.[0]?.id || null,
        }));

        setEpisodes(episodeList);
      } catch (err) {
        setError(`Error fetching episodes: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, []);

  const handleEpisodeSelect = (episode) => {
    setSelectedEpisode(episode);
    setPlayerLoading(true);
    setError(null);
    setIsPlayerReady(false);

    // Small delay to show loading state
    setTimeout(() => {
      if (episode.playbackId) {
        setPlayerLoading(false);
      }
    }, 800);
  };

  const handlePlayerReady = () => {
    console.log("Player is ready");
    setPlayerLoading(false);
    setIsPlayerReady(true);
  };

  const handlePlayerError = (error) => {
    console.error("Player error:", error);
    setError("Error loading video player");
    setPlayerLoading(false);
    setIsPlayerReady(false);
  };

  if (loading)
    return (
      <div className="loading-screen">
        <div className="griffin-loader">
          <div className="peter-loader"></div>
          <div className="stewie-loader"></div>
          <div className="brian-loader"></div>
        </div>
        <h2>Loading Family Guy...</h2>
      </div>
    );

  if (error && !selectedEpisode)
    return (
      <div className="error-screen">
        <div className="error-container">
          <div className="stewie-error"></div>
          <h2>Oh my! What's wrong now?</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );

  return (
    <div className="family-guy-app">
      {/* Background elements */}
      <div className="floating-peter"></div>
      <div className="floating-stewie"></div>
      <div className="floating-brian"></div>

      {/* Header */}
      <header className="family-guy-header">
        <div className="logo-container">
          <div className="family-guy-logo"></div>
          <h1>Family Guy Season 2</h1>
        </div>
        <div className="header-decoration">
          <div className="tv-static"></div>
        </div>
      </header>

      <main className="family-guy-main">
        {/* Episode Grid */}
        <section className="episode-section">
          <div className="section-title">
            <h2>Episodes</h2>
            <div className="title-decoration"></div>
          </div>

          <div className="episode-grid">
            {episodes.map((episode) => (
              <div
                key={episode.id}
                className={`episode-card ${
                  selectedEpisode?.id === episode.id ? "selected" : ""
                }`}
                onClick={() => handleEpisodeSelect(episode)}
              >
                <div className="episode-poster">
                  <img
                    src={episode.poster}
                    alt={episode.title}
                    onError={(e) => {
                      e.target.src = "/posters/default.jpg";
                    }}
                  />
                  <div className="episode-number">{episode.episodeNumber}</div>
                  <div className="play-overlay">
                    <div className="play-button"></div>
                  </div>
                </div>
                <div className="episode-info">
                  <h3>{episode.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Player Section */}
        {selectedEpisode && (
          <section
            className={`player-section ${isPlayerReady ? "ready" : "active"}`}
          >
            <div className="player-container">
              <div className="player-header">
                <h2>{selectedEpisode.title}</h2>
                <div className="player-decoration">
                  <div className="tv-frame"></div>
                </div>
              </div>

              <div className="player-wrapper">
                {selectedEpisode.playbackId && !playerLoading ? (
                  <MuxPlayer
                    playbackId={selectedEpisode.playbackId}
                    streamType="on-demand"
                    controls
                    style={{
                      width: "100%",
                      height: "100%",
                      aspectRatio: "16/9",
                    }}
                    metadata={{
                      video_id: `family-guy-season-2-${selectedEpisode.episodeNumber}`,
                      video_title: `Family Guy Season 2 - ${selectedEpisode.title}`,
                      viewer_user_id: "viewer123",
                    }}
                    onCanPlay={handlePlayerReady}
                    onError={handlePlayerError}
                    autoPlay={false}
                    muted={false}
                    loop={false}
                  />
                ) : (
                  <div className="player-loading">
                    {error ? (
                      <div className="player-error">
                        <div className="stewie-error-small"></div>
                        <p>Error loading video: {error}</p>
                        <button
                          onClick={() => {
                            setError(null);
                            handleEpisodeSelect(selectedEpisode);
                          }}
                        >
                          Retry
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="griffin-loader-small">
                          <div className="peter-loader-small"></div>
                          <div className="stewie-loader-small"></div>
                          <div className="brian-loader-small"></div>
                        </div>
                        <p>Loading player...</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="player-footer">
                <div className="character-quote">
                  <div className="quote-bubble">"Giggity giggity goo!"</div>
                  <div className="quagmire"></div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="family-guy-footer">
        <div className="footer-decoration">
          <div className="couch"></div>
          <div className="tv"></div>
        </div>
        <p>© 2024 Family Guy Fan Site</p>
      </footer>
    </div>
  );
}

export default App;
