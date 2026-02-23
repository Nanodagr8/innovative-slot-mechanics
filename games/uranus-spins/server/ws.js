import { Server } from "socket.io";

let io;

export function initWebsocket(httpServer) {
    io = new Server(httpServer, {
        cors: { origin: "*" }
    });

    io.on("connection", (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);
        socket.on("disconnect", () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });

    return io;
}

export function broadcast(event, data) {
    if (!io) return;
    io.emit(event, data);
}
