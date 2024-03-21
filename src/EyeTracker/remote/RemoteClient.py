import asyncio
import websockets
import json
import time


class RemoteClient:
    def __init__(self, get_latest_data):
        self.websocket = None
        self.get_latest_data = get_latest_data

    async def connect(self):
        print("Trying to connect to Remote server...")
        while True:
            try:
                self.websocket = await websockets.connect("ws://195.201.205.251:55557")
                print("Connected to Remote server")
                # Identify itself as sender
                data = self.get_latest_data()
                data["code"] = "89cFkBJ8I3b9TGuvw1Bv"
                await self.websocket.send(json.dumps(data))

                while True:
                    try:
                        message = await self.websocket.recv()
                        print(message)
                    except websockets.ConnectionClosed:
                        print("Connection to Remote closed")
                        break
            except asyncio.TimeoutError:
                time.sleep(1)

    async def send_data(self, data: str):
        if self.websocket is not None:
            await self.websocket.send(data)
