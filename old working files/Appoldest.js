import "./App.css";
import MuxPlayer from "@mux/mux-player-react";
import React, { useState, useEffect } from "react";

function App() {
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [playbackId, setPlaybackId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch list of episodes when component mounts
  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const username = process.env.REACT_APP_MUX_TOKEN_ID;
        const password = process.env.REACT_APP_MUX_TOKEN_SECRET;

        // Debug logging
        console.log("Raw Username:", JSON.stringify(username));
        console.log("Raw Password:", JSON.stringify(password));
        console.log("Username type:", typeof username);
        console.log("Password type:", typeof password);

        // Check for empty strings or whitespace
        if (
          !username ||
          !password ||
          username.trim() === "" ||
          password.trim() === ""
        ) {
          console.error("Credentials are empty or whitespace");
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

        // Transform the data to create episode list
        const episodeList = jsonData.data.map((asset, index) => ({
          id: asset.id,
          title: `Episode ${index + 1}`,
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
  // Fetch playback ID when an episode is selected
  useEffect(() => {
    if (!selectedEpisode) return;

    const fetchPlaybackId = async () => {
      try {
        const username = process.env.REACT_APP_MUX_TOKEN_ID;
        const password = process.env.REACT_APP_MUX_TOKEN_SECRET;

        if (!username || !password) {
          throw new Error("Mux credentials are not set");
        }

        const credentials = btoa(`${username}:${password}`);
        const response = await fetch(
          `https://api.mux.com/video/v1/assets/${selectedEpisode.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Basic ${credentials}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error Status: ${response.status}`);
        }

        const jsonData = await response.json();
        const extractedPlaybackId = jsonData?.data?.playback_ids?.[0]?.id;

        if (extractedPlaybackId) {
          setPlaybackId(extractedPlaybackId);
        } else {
          setError("Playback ID not found in response");
        }
      } catch (err) {
        setError(`Error fetching playback ID: ${err.message}`);
      }
    };

    fetchPlaybackId();
  }, [selectedEpisode]);

  const handleEpisodeSelect = (episode) => {
    setSelectedEpisode(episode);
    setPlaybackId(null); // Reset playback ID while fetching
    setError(null); // Reset any previous errors
  };

  if (loading) return <div>Loading episodes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="App">
      <h1>Family Guy Season 2 Complete</h1>

      <div className="episode-list">
        <h2>Episodes:</h2>
        <div className="episode-buttons">
          {episodes.map((episode) => (
            <button
              key={episode.id}
              onClick={() => handleEpisodeSelect(episode)}
              className={selectedEpisode?.id === episode.id ? "selected" : ""}
            >
              {episode.title}
            </button>
          ))}
        </div>
      </div>

      {selectedEpisode && (
        <div className="player-container">
          <h2>{selectedEpisode.title}</h2>
          {playbackId ? (
            <MuxPlayer
              playbackId={playbackId}
              style={{ width: "100%", height: "100%" }}
              metadata={{
                video_id: `family-guy-season-2-${selectedEpisode.id}`,
                video_title: `Family Guy Season 2 - ${selectedEpisode.title}`,
                viewer_user_id: "viewer123",
              }}
              controls={true}
              autoPlay={false}
              muted={false}
              loop={false}
            />
          ) : (
            <div>Loading player...</div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
