import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
  .withUrl("https://fired.runasp.net/ws")
  .build();

connection.on("BackendMessage", (msg) => {
  console.log("📩 WS:", msg);
});

connection.start()
  .then(() => console.log("Conectado"))
  .catch(console.error);