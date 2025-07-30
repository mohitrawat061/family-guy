// Create a new component: EpisodePoster.js
import React from "react";

const EpisodePoster = ({ episodeId }) => {
  // Try to import the image dynamically
  try {
    // This requires that your images are in the src folder
    const poster = require(`./posters/ep${episodeId}.jpg`);
    return <img src={poster} alt={`Episode ${episodeId}`} />;
  } catch (e) {
    // Fallback to a placeholder
    return (
      <div className="poster-placeholder">
        <span>Episode {episodeId}</span>
      </div>
    );
  }
};

export default EpisodePoster;
