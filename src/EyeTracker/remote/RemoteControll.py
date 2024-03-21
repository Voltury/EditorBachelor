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


class RemoteControl:
    def __init__(self):
        self.websocket = None
        self.data = Data(None, None, None, [], {})
        self.client = False

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
                        await self.handle_message(message)
                    except websockets.ConnectionClosed:
                        print("Connection to Remote closed")
                        break
            except asyncio.TimeoutError:
                time.sleep(1)

    async def send_data(self, data: dict):
        if self.websocket is not None:
            await self.websocket.send(json.dumps(data))

    async def handle_message(self, message: str):
        try:
            message = json.loads(message)
        except json.JSONDecodeError:
            await self.websocket.send(json.dumps({"ERROR": f"Invalid JSON data {message}"}))
            return

        for key in message.keys():
            # Update data object if key is in data object
            if hasattr(self.data, key):
                print(f"Updated {key} from {getattr(self.data, key)} to {message[key]}")
                setattr(self.data, key, message[key])
                continue

            # Handle other keys
            match key:
                case "CLIENT":
                    if message[key][0]:
                        print("Remote Client connected")
                        self.client = True
                        await self.send_data({"get_latest_data": []})
                    else:
                        print("Remote Client disconnected")
                        self.client = False
                case "EVENT":
                    print(f"Event received\n{message[key]}")
                case default:
                    print(f"{key}: {message[key]}")


if __name__ == "__main__":
    client = RemoteControl()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(client.connect())
