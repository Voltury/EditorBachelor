import asyncio
from dataclasses import dataclass

import websockets
import json
import time


@dataclass
class Data:
    participant_id: str | None
    condition_id: str | None
    document: str | None
    events: list
    current_tasks: dict
    code = "4I8UaFQzo7zpp9vlIMQ5"


class RemoteClient:
    def __init__(self):
        self.websocket = None
        self.data = Data(None, None, None, [], {})

    async def connect(self):
        print("Trying to connect to Remote server...")
        while True:
            try:
                self.websocket = await websockets.connect("ws://195.201.205.251:55557")
                print("Connected to Remote server")
                # Identify itself as Remote Control
                await self.websocket.send(json.dumps({"code": self.data.code}))

                while True:
                    try:
                        message = await self.websocket.recv()
                        try:
                            self.update_data(json.loads(message))
                        except json.JSONDecodeError:
                            await self.websocket.send("Invalid JSON data")
                    except websockets.ConnectionClosed:
                        print("Connection to Remote closed")
                        break
            except asyncio.TimeoutError:
                time.sleep(1)

    async def send_data(self, data):
        if self.websocket is not None:
            await self.websocket.send(json.dumps(data))

    def update_data(self, data_):
        keys = data_.keys()
        for key in keys:
            if hasattr(self.data, key):
                print(f"Updated {key} from {getattr(self.data, key)} to {data_[key]}")
                setattr(self.data, key, data_[key])
            else:
                print(f"Key {key} not found in data")


if __name__ == "__main__":
    client = RemoteClient()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(client.connect())
