import React, { useState, useEffect } from "react";
import ReadsbClient from "./ReadsbClient";
import debugLibrary from "debug";

const debug = debugLibrary("airdash:ReadsbContext");

const ReadsbContext = React.createContext(null);

/**
 * ReadsbProvider is a React ContextProvider that acts as the
 * primary hub of data coming from a readsb backend.
 * 
 * An AirDash application instance will have a single provider,
 * and may have multiple consumers throughout the app.
 */
export const ReadsbProvider = function({ children }) {
  const [backendBaseUrl, setBackendBaseUrl] = useState('http://discopi.local:8080');
  const [client, setClient] = useState(null);
  const [aircraft, setAircraft] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [stats, setStats] = useState(null);
  const [pollInterval, setPollInterval] = useState(1000);

  // Update our API client any time `backendBaseUrl` changes.
  useEffect(() => {
    if (backendBaseUrl) {
      setAircraft([]);
      setClient(new ReadsbClient(backendBaseUrl));
    }
  }, [backendBaseUrl])

  const updateEvents = async () => {
    try {
      const update = await client.getAircraft();
      debug("Aircraft update:", update);
      setAircraft(update.aircraft);
    } catch (e) {
      console.error(e);
    }
  };

  // Once we have a client, poll it every `pollInterval`.
  useEffect(() => {
    if (!client) {
      return;
    }
    let poller;
    async function load() {
      const statsResult = await client.getStats();
      debug('Stats', statsResult);
      setStats(statsResult);

      const receiverResult = await client.getReceiver();
      debug('receiver', receiverResult);
      setReceiver(receiver);

      updateEvents();
      poller = setInterval(updateEvents, pollInterval);
    }
    load();
    return () => {
      clearInterval(poller);
    };
  }, [client, pollInterval]);

  return (
    <ReadsbContext.Provider
      value={{
        backendBaseUrl,
        setBackendBaseUrl,
        pollInterval,
        setPollInterval,
        client,
        aircraft,
        stats,
        receiver,
      }}
    >
      {children}
    </ReadsbContext.Provider>
  );
};

export const ReadsbConsumer = ReadsbContext.Consumer;
export default ReadsbContext;
