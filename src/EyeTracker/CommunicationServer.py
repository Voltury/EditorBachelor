import asyncio
import json
import os
import websockets
from dataclasses import dataclass

import EyeTracker
from remote.RemoteClient import RemoteClient

connection = None
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

    async def set_participant_id(self, participant_id):
        participant_id = int(participant_id) if participant_id.isdigit() else -1

        self.participant_id = participant_id
        await remote_client.send_data({"participant_id": participant_id})

    async def set_condition_id(self, condition_id):
        condition_id = int(condition_id) if condition_id.isdigit() else -1

        self.condition_id = condition_id
        await remote_client.send_data({"condition_id": condition_id})

    async def set_document(self, document):
        self.document = document
        await remote_client.send_data({"document": document})

    async def set_current_tasks(self, current_tasks):
        self.current_tasks = current_tasks
        await remote_client.send_data({"current_tasks": current_tasks})

    async def set_eye_tracker_connected(self, connected):
        self.eye_tracker_connected = bool(connected)
        await remote_client.send_data({"eye_tracker_connected": self.eye_tracker_connected})

    async def set_eye_tracker_recording(self, recording):
        self.eye_tracker_recording = bool(recording)
        await remote_client.send_data({"eye_tracker_recording": self.eye_tracker_recording})

    async def set_study_align_connected(self, connected):
        self.study_align_connected = bool(connected)
        await remote_client.send_data({"study_align_connected": self.study_align_connected})

    async def set_prototype_logging(self, logging):
        self.prototype_logging = bool(logging)
        await remote_client.send_data({"prototype_logging": self.prototype_logging})

    def to_dict(self):
        return {
            "participant_id": self.participant_id,
            "condition_id": self.condition_id,
            "document": self.document,
            "current_tasks": self.current_tasks,
            "eye_tracker_connected": self.eye_tracker_connected,
            "eye_tracker_recording": self.eye_tracker_recording,
            "study_align_connected": self.study_align_connected,
            "prototype_logging": self.prototype_logging
        }


data = Data(-1, -1, "", {}, EyeTracker.eye_tracker_connected(), False, False, False)


async def start_recording():
    if not data.participant_id or not data.condition_id:
        await connection.send("error Please register participant and condition id first")
        return

    print(f"Starting recording of {data.participant_id} for {data.condition_id}")
    EyeTracker.start_recording(data.participant_id, data.condition_id)


async def end_recording():
    if not data.participant_id or not data.condition_id:
        await connection.send("error Please register participant and condition id first")
        return

    print(f"Ending recording of {data.participant_id} for {data.condition_id}")
    EyeTracker.stop_recording()


async def get_tasks():
    if not data.participant_id or not data.condition_id:
        connection.send("error Please register participant and condition id first")
        return
    path = f"./data/{data.participant_id}/tasks.json"
    exists = os.path.exists(path)
    if not exists:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as file:
            temp = {
                "tasks": tasks
            }
            json.dump(temp, file)
            await data.set_current_tasks(temp)
            await connection.send("get_tasks " + json.dumps(temp))
    else:
        with open(path, "r") as file:
            temp = file.read()
            await data.set_current_tasks(json.loads(temp))
            await connection.send("get_tasks " + temp)

    print(f"Getting tasks for participant id: {data.participant_id}")


async def save_tasks(tasks_):
    if not data.participant_id or not data.condition_id:
        await connection.send("error Please register participant and condition id first")
        return

    with open(f"./data/{data.participant_id}/tasks.json", "w") as file:
        json.dump(json.loads(tasks_), file)
        await data.set_current_tasks(json.loads(tasks_))


async def get_document_data():
    if not data.participant_id or not data.condition_id:
        await connection.send("error Please register participant and condition id first")
        return

    path = f"./data/{data.participant_id}/{data.condition_id}/document.html"
    exists = os.path.exists(path)
    if not exists:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as file:
            await data.set_document("")
            await connection.send("get_document_data ")
    else:
        with open(path, "r") as file:
            temp = file.read()
            await data.set_document(temp)
            await connection.send("get_document_data " + temp)

    print(f"Getting document data for participant id: {data.participant_id}")


async def save_document_data(data_: str):
    if not data.participant_id or not data.condition_id:
        await connection.send("error Please register participant and condition id first")
        return

    with open(f"./data/{data.participant_id}/{data.condition_id}/document.html", "w") as file:
        await data.set_document(data_)
        file.write(data_)


async def handle_event(event):
    await remote_client.send_data({"event": json.loads(event)})


def get_latest_data():
    return data.to_dict()


async def set_prototype_logging(should_log: bool) -> None:
    """
    This function is called by the RemoteClient to toggle the prototype logging
    :param should_log: boolean
    :return: None
    """
    await send_message({"set_prototype_logging": should_log})


def clear_local_storage():
    global connection
    connection = None
    data.clear()


# Mapping identifiers to functions
functions = {
    "register_participant_id": data.set_participant_id,
    "register_condition_id": data.set_condition_id,
    "start_recording": start_recording,
    "end_recording": end_recording,
    "get_tasks": get_tasks,
    "save_tasks": save_tasks,
    "get_document_data": get_document_data,
    "save_document_data": save_document_data,
    "event": handle_event,
    "study_align_connected": data.set_study_align_connected,
    "set_prototype_logging": data.set_prototype_logging
}


async def send_message(message):
    await connection.send(message)


async def handle_connection(websocket):
    global connection

    # Only allow one connection at a time
    if connection:
        await websocket.close(code=1013, reason="Already someone connected")
        return

    connection = websocket
    try:
        print("Connected ckeditor and Communication/File-Server")
        await send_message("Hello Client")

        await remote_client.send_data({"PROTOTYPE": True})

        async for message in connection:
            identifier, *command = message.split(' ', 1)
            command = command[0] if command else None
            if identifier in functions:
                if command:
                    await functions[identifier](command)
                else:
                    await functions[identifier]()
            else:
                print(f"Unknown identifier {identifier}")
                await send_message(f"error Unknown identifier {identifier}")

    finally:
        await connection.close()
        await data.set_prototype_logging(False)
        await remote_client.send_data({"PROTOTYPE": False})

        clear_local_storage()
        EyeTracker.stop_recording()
        await data.set_eye_tracker_recording(False)

        print(f"Disconnected from server")
        print("-" * 40)


remote_client = RemoteClient(get_latest_data, set_prototype_logging)
start_server = websockets.serve(handle_connection, "localhost", 55556)

print("serving at port", 55556)
print("-" * 40)

try:
    asyncio.get_event_loop().run_until_complete(asyncio.gather(remote_client.connect(), start_server))
except KeyboardInterrupt:
    print("Keyboard interrupt")
    clear_local_storage()
    print("Exiting")
    exit(0)
