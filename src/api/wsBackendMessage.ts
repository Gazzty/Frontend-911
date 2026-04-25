import * as signalR from "@microsoft/signalr";
import { useEffect, useState } from "react";

const WS_URL = "https://fired.runasp.net/ws";

const connection = new signalR.HubConnectionBuilder()
  .withUrl(WS_URL)
  .withAutomaticReconnect()
  .build();

export const useBackendMessage = () => {
  const [message, setMessage] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    connection.on("BackendMessage", (msg: number) => {
      setMessage(msg);
    });

    connection
      .start()
      .then(() => setConnected(true))
      .catch(console.error);

    return () => {
      connection.off("BackendMessage");
    };
  }, []);

  return { message, connected };
};