import React, { useState, useEffect } from "react";
import axios from "axios";

interface Metadata {
  title?: string;
  description?: string;
  image?: {
    url: string;
  };
}

interface MetadataFetcherProps {
  url: string;
}

const MetadataFetcher: React.FC<MetadataFetcherProps> = ({ url }) => {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axios.get<{ data: Metadata }>(
          `https://api.microlink.io?url=${encodeURIComponent(url)}`
        );
        setMetadata(response.data.data);
      } catch (err) {
        setError("Failed to fetch metadata");
        console.error("Error fetching metadata:", err);
      }
    };

    if (url) {
      fetchMetadata();
    }
  }, [url]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!metadata) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{metadata.title}</h2>
      <p>{metadata.description}</p>
      {metadata.image && <img src={metadata.image.url} alt={metadata.title} />}
    </div>
  );
};

export default MetadataFetcher;
