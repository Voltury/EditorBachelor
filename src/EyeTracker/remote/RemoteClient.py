import asyncio
import json
import time

import websockets


class RemoteClient:
    def __init__(self, get_latest_data):
        self.websocket = None
        self.remote = False
        self.get_latest_data = get_latest_data

    async def connect(self):
        print("Trying to connect to Remote server...")
        while True:
            try:
                self.websocket = await websockets.connect("ws://195.201.205.251:55557")
                print("Connected to Remote server")
                # Identify itself as remote client
                await self.websocket.send(json.dumps({"code": "89cFkBJ8I3b9TGuvw1Bv"}))

                while True:
                    try:
                        message = await self.websocket.recv()
                        await self.handle_message(message)
                    except websockets.ConnectionClosed:
                        print("Connection to Remote closed")
                        break
            except asyncio.TimeoutError:
                time.sleep(1)

    async def send_data(self, data: dict):
        if self.websocket is not None and self.remote:
            await self.websocket.send(json.dumps(data))

    async def handle_message(self, message: str):
        try:
            message = json.loads(message)
        except json.JSONDecodeError:
            await self.websocket.send(json.dumps({"ERROR": f"Invalid JSON data {message}"}))
            return

        for key in message.keys():
            match key:
                case "CONTROL":
                    if message[key][0]:
                        print("Remote Control connected")
                        self.remote = True
                    else:
                        print("Remote Control disconnected")
                        self.remote = False
                case "get_latest_data":
                    await self.send_data(self.get_latest_data())  # ever key will be interpreted as its own command
                case default:
                    print(f"{key}: {message[key]}")
