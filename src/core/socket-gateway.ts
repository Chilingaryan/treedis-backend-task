import { Server as SocketIOServer, Socket } from "socket.io";

export class SocketGateway {
  private static instance: SocketGateway;
  public io: SocketIOServer | null = null;

  private constructor() {}

  public static getInstance(): SocketGateway {
    if (!SocketGateway.instance) {
      SocketGateway.instance = new SocketGateway();
    }
    return SocketGateway.instance;
  }

  public attachServer(io: SocketIOServer) {
    this.io = io;
  }

  public onConnection(handler: (socket: Socket) => void) {
    this.io?.on("connection", handler);
  }

  public onDisconnect(handler: (socket: Socket) => void) {
    this.io?.on("disconnect", handler);
  }

  public emitToRoom(room: string, event: string, payload: any) {
    if (!this.io) throw new Error("Socket.IO not initialized");
    this.io.to(room).emit(event, payload);
  }

  public broadcast(event: string, payload: any) {
    if (!this.io) throw new Error("Socket.IO not initialized");
    this.io.emit(event, payload);
  }
}
