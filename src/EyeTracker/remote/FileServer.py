import asyncio
import json
import os
from dataclasses import dataclass

import websockets


@dataclass
class Data:
    # intentionally not storing events to reduce network traffic
    participant_id: int
    condition_id: int
    document: str
    current_tasks: dict
    eye_tracker_connected: bool
    eye_tracker_recording: bool
    study_align_connected: bool
    prototype_connected: bool
    prototype_logging: bool

    def clear(self):
        self.participant_id = -1
        self.condition_id = -1
        self.document = ""
        self.current_tasks = {}
        self.eye_tracker_connected = False
        self.eye_tracker_recording = False
        self.study_align_connected = False
        self.prototype_logging = False

    def to_dict(self):
        return {
            "participant_id": [self.participant_id],
            "condition_id": [self.condition_id],
            "document": [self.document],
            "current_tasks": [self.current_tasks],
            "eye_tracker_connected": [self.eye_tracker_connected],
            "eye_tracker_recording": [self.eye_tracker_recording],
            "study_align_connected": [self.study_align_connected],
            "PROTOTYPE": [self.prototype_connected],
            "prototype_logging": [self.prototype_logging]
        }


class FileServer:
    tasks = [
        {
            "title": 'Shapeshifter',
            "description": 'Write a story about a woman who has been dating guy after guy, but it never seems to work out. She’s unaware that she’s actually been dating the same guy over and over; a shapeshifter who’s fallen for her, and is certain he’s going to get it right this time.'
        },
        {
            "title": 'Reincarnation',
            "description": 'Create a narrative where, when you die, you appear in a cinema with a number of other people who look like you. You find out that they are your previous reincarnations, and soon you all begin watching your next life on the big screen.'
        },
        {
            "title": 'Mana',
            "description": 'Imagine a world where humans once wielded formidable magical power. But with over 7 billion of us on the planet now, Mana has spread far too thinly to have any effect. When hostile aliens reduce humanity to a mere fraction, the survivors discover an old power has begun to reawaken once again. Write a story exploring how the survivors cope with their newfound power and the challenges they face in their struggle against the aliens.'
        },
        {
            "title": 'Sideeffect',
            "description": 'Explore the aftermath. When you’re 28, science discovers a drug that stops all effects of aging, creating immortality. Your government decides to give the drug to all citizens under 26, but you and the rest of the “Lost Generations” are deemed too high-risk. When you’re 85, the side effects are finally discovered.'
        },
        {
            "title": 'Dad',
            "description": 'In this comedic tale, all of the “#1 Dad” mugs in the world change to show the actual ranking of Dads suddenly.'
        },
        {
            "title": 'Free Pads and Tampons in Schools',
            "description": 'Write an essay arguing for or against the provision of free pads and tampons alongside toilet paper and soap in schools. Consider the implications for student health and well-being.'
        },
        {
            "title": 'Important Lessons in School',
            "description": 'Discuss the most important lessons that should be taught in schools. Consider a range of subjects and skills, from academic knowledge to life skills.'
        },
        {
            "title": 'Paying College Athletes',
            "description": 'Argue for or against paying college athletes. Consider whether a college scholarship and other non-monetary perks are enough, and what potential difficulties or downsides might exist in providing monetary compensation to players.'
        },
        {
            "title": 'Extremesports',
            "description": 'Discuss the ethics of pursuing risky sports like extreme mountain climbing. Consider the potential dangers and the reasons why people might choose to participate in these sports.'
        },
        {
            "title": 'Keeping Up With the News',
            "description": 'Write an argumentative essay on the importance of keeping up with the news. Discuss the role of an informed citizenry in a democratic society.'
        }
    ]

    def __init__(self, comm_server_uri: str, file_server_port: int):
        self.comm_server_uri = comm_server_uri
        self.comm_server: websockets.WebSocketClientProtocol = None
        self.remote = False
        self.file_server_port = file_server_port
        self.web_app_connection: websockets.WebSocketServerProtocol = None

        self.data = Data(-1, -1, "", {}, False, False, False, False, False)
        self.command_lookup = {
            "register_participant_id": self.register_participant_id,
            "register_condition_id": self.register_condition_id,
            "start_recording": self.start_recording,
            "end_recording": self.end_recording,
            "get_tasks": self.get_tasks,
            "save_tasks": self.save_tasks,
            "get_document_data": self.get_document_data,
            "save_document_data": self.save_document_data,
            "event": self.handle_event,
            "study_align_connected": self.set_study_align_connected,
            "set_prototype_logging": self.set_prototype_logging,
            "get_latest_data": self.get_latest_data
        }

    async def connect_to_comm_server(self) -> None:
        print("Trying to connect to communication server...")
        while True:
            try:
                self.comm_server = await websockets.connect(self.comm_server_uri)
                print("Connected to communication server")
                # Identify itself as remote client
                await self.send({"code": "89cFkBJ8I3b9TGuvw1Bv"}, self.comm_server)

                while True:
                    try:
                        await self.receive(await self.comm_server.recv(), self.comm_server)
                    except (websockets.ConnectionClosed, OSError):
                        print(f"Connection to Communication Server at {self.comm_server_uri} closed, retrying...")
                        break
            except asyncio.TimeoutError:
                await asyncio.sleep(1)

    async def start_file_server(self) -> None:
        """Start the server and handle connections from the Web Application."""
        server = await websockets.serve(self.handle_web_app_connection, 'localhost', self.file_server_port)
        await server.wait_closed()

    async def handle_web_app_connection(self, websocket: websockets.WebSocketServerProtocol) -> None:
        if self.web_app_connection:
            await websocket.close(code=1013, reason="Already someone connected")
            return

        self.web_app_connection = websocket
        self.data.prototype_connected = True
        await self.send({"PROTOTYPE": [True]}, self.comm_server)

        try:
            print(f"Web Application connected at port {self.file_server_port}")
            while True:
                await self.receive(await websocket.recv(), self.web_app_connection)
        except (websockets.ConnectionClosed, OSError):
            print(f"Connection to Web Application at port {self.file_server_port} closed")
        finally:
            await self.web_app_connection.close()
            self.web_app_connection = None
            self.data.prototype_connected = False
            await self.send({"PROTOTYPE": [False],
                             "prototype_logging": [False],
                             "study_align_connected": [False],
                             "eye_tracker_recording": [False]},
                            self.comm_server)

    async def receive(self, message: str, sender: websockets.WebSocketClientProtocol) -> None:

        try:
            message_json = json.loads(message)
        except json.JSONDecodeError:
            print("Invalid JSON:", message)
            await FileServer.send({"ERROR": ["Invalid JSON" + message]}, sender)
            return

        try:
            for key, value in message_json.items():
                if key == "CONTROL":
                    print(f"Control connected: {value[0]}")
                    return

                if key in self.command_lookup:
                    await self.command_lookup[key](*value)
                else:
                    print("Unknown command:", key)
        except:
            print("Error while executing command:", message_json)
            await self.send({"ERROR": ["Error while executing command" + message]}, self.comm_server)

    @staticmethod
    async def send(message: dict, receiver: websockets.WebSocketClientProtocol) -> None:
        if receiver:
            await receiver.send(json.dumps(message))

    async def register_participant_id(self, participant_id: str) -> None:
        self.data.participant_id = int(participant_id)
        await self.send({"participant_id": [self.data.participant_id]}, self.comm_server)

    async def register_condition_id(self, condition_id: str) -> None:
        self.data.condition_id = int(condition_id)
        await self.send({"condition_id": [self.data.condition_id]}, self.comm_server)

    async def start_recording(self) -> None:
        self.data.eye_tracker_recording = True
        await self.send({"eye_tracker_recording": [True]}, self.comm_server)

    async def end_recording(self) -> None:
        self.data.eye_tracker_recording = False
        await self.send({"eye_tracker_recording": [False]}, self.comm_server)

    async def get_tasks(self) -> None:
        if not self.data.participant_id or not self.data.condition_id:
            await self.send({"ERROR": ["Please register participant and condition id first"]}, self.web_app_connection)
            return

        path = f"./../data/{self.data.participant_id}/tasks.json"
        exists = os.path.exists(path)
        if not exists:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w") as file:
                temp = {
                    "tasks": FileServer.tasks
                }
                json.dump(temp, file)
                self.data.current_tasks = temp
                await self.send({"get_tasks": [temp]}, self.web_app_connection)
        else:
            with open(path, "r") as file:
                temp = file.read()
                self.data.current_tasks = json.loads(temp)
                await self.send({"get_tasks": [self.data.current_tasks]}, self.web_app_connection)
        await self.send({"current_tasks": [self.data.current_tasks]}, self.comm_server)
        print(f"Getting tasks for participant id: {self.data.participant_id}")

    async def save_tasks(self, message: str) -> None:
        if not self.data.participant_id or not self.data.condition_id:
            await self.send({"ERROR": ["Please register participant and condition id first"]}, self.web_app_connection)
            return

        with open(f"./../data/{self.data.participant_id}/tasks.json", "w") as file:
            json.dump(json.loads(message), file)
            self.data.current_tasks = json.loads(message)
        await self.send({"current_tasks": [json.loads(message)]}, self.comm_server)

    async def get_document_data(self) -> None:
        if not self.data.participant_id or not self.data.condition_id:
            await self.send({"ERROR": ["Please register participant and condition id first"]}, self.web_app_connection)
            return

        path = f"./../data/{self.data.participant_id}/{self.data.condition_id}/document.html"
        exists = os.path.exists(path)
        if not exists:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w"):
                self.data.document = ""
                await self.send({"document": [""]}, self.web_app_connection)
        else:
            with open(path, "r") as file:
                temp = file.read()
                self.data.document = temp
                await self.send({"document": [temp]}, self.web_app_connection)

        print(f"Getting document data for participant id: {self.data.participant_id}")
        await self.send({"document": [self.data.document]}, self.comm_server)

    async def save_document_data(self, message: str) -> None:
        if not self.data.participant_id or not self.data.condition_id:
            await self.send({"ERROR": ["Please register participant and condition id first"]}, self.web_app_connection)
            return

        with open(f"./../data/{self.data.participant_id}/{self.data.condition_id}/document.html", "w") as file:
            file.write(message)
            self.data.document = message
        await self.send({"document": [message]}, self.comm_server)

    async def handle_event(self, event: dict) -> None:
        await self.send({"event": [event]}, self.comm_server)

    async def set_study_align_connected(self, connected: bool) -> None:
        self.data.study_align_connected = connected
        await self.send({"study_align_connected": [connected]}, self.comm_server)

    async def set_prototype_logging(self, logging: bool) -> None:
        self.data.prototype_logging = logging
        await self.send({"prototype_logging": [logging]}, self.comm_server)

    async def get_latest_data(self) -> None:
        await self.send(self.data.to_dict(), self.comm_server)


if __name__ == "__main__":
    server = FileServer('ws://195.201.205.251:55557', 55556)

    try:
        asyncio.get_event_loop().run_until_complete(asyncio.gather(server.connect_to_comm_server(),
                                                                   server.start_file_server()))
    except KeyboardInterrupt:
        pass

    print("Shutting down...")
