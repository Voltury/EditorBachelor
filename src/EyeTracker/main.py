import asyncio
import json
import os
import websockets

import EyeTracker

connection = None
participant_id = None
condition_id = None
participant_tasks = None
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


def register_participant_id(participant):
    global participant_id
    participant_id = participant
    print(f"Registered participant id: {participant_id}")


def register_condition_id(condition):
    global condition_id
    condition_id = condition
    print(f"Registered condition id: {condition_id}")


async def start_recording():
    if not participant_id or not condition_id:
        await connection.send("error Please register participant and condition id first")
        return

    print(f"Starting recording of {participant_id} for {condition_id}")
    EyeTracker.start_recording(participant_id, condition_id)


async def end_recording():
    if not participant_id or not condition_id:
        await connection.send("error Please register participant and condition id first")
        return

    print(f"Ending recording of {participant_id} for {condition_id}")
    EyeTracker.stop_recording()


async def get_tasks():
    global tasks

    if not participant_id or not condition_id:
        connection.send("error Please register participant and condition id first")
        return
    path = f"./data/{participant_id}/tasks.json"
    exists = os.path.exists(path)
    if not exists:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as file:
            temp = {
                "tasks": tasks
            }
            json.dump(temp, file)
            await connection.send("get_tasks " + json.dumps(temp))
    else:
        with open(path, "r") as file:
            await connection.send("get_tasks " + file.read())

    print(f"Getting tasks for participant id: {participant_id}")


async def save_tasks(tasks):
    if not participant_id or not condition_id:
        await connection.send("error Please register participant and condition id first")
        return

    with open(f"./data/{participant_id}/tasks.json", "w") as file:
        json.dump(json.loads(tasks), file)


async def get_document_data():
    if not participant_id or not condition_id:
        await connection.send("error Please register participant and condition id first")
        return

    path = f"./data/{participant_id}/{condition_id}/document.html"
    exists = os.path.exists(path)
    if not exists:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as file:
            await connection.send("get_document_data ")
    else:
        with open(path, "r") as file:
            await connection.send("get_document_data " + file.read())

    print(f"Getting document data for participant id: {participant_id}")


async def save_document_data(data):
    if not participant_id or not condition_id:
        await connection.send("error Please register participant and condition id first")
        return

    with open(f"./data/{participant_id}/{condition_id}/document.html", "w") as file:
        file.write(data)


def clear_local_storage():
    global participant_id, condition_id, connection, participant_tasks

    participant_id = None
    condition_id = None
    connection = None
    participant_tasks = None


# Mapping identifiers to functions
functions = {
    "register_participant_id": register_participant_id,
    "register_condition_id": register_condition_id
}

async_functions = {
    "start_recording": start_recording,
    "end_recording": end_recording,
    "get_tasks": get_tasks,
    "save_tasks": save_tasks,
    "get_document_data": get_document_data,
    "save_document_data": save_document_data
}


async def handle_connection(websocket, path):
    global connection

    # Only allow one connection at a time
    if connection:
        await websocket.close(code=1013, reason="Already someone connected")
        return

    connection = websocket
    try:
        print("Connected to server")
        await connection.send("Hello Client")

        async for message in connection:
            identifier, *command = message.split(' ', 1)
            command = command[0] if command else None
            if identifier in functions:
                if command:
                    functions[identifier](command)
                else:
                    functions[identifier]()
            elif identifier in async_functions:
                if command:
                    await async_functions[identifier](command)
                else:
                    await async_functions[identifier]()
            else:
                print(f"Unknown identifier {identifier}")
                await connection.send(f"error Unknown identifier {identifier}")

    finally:
        await connection.close()
        clear_local_storage()
        EyeTracker.stop_recording()
        print(f"Disconnected from server")
        print("-" * 40)


start_server = websockets.serve(handle_connection, "localhost", 55556)

print("serving at port", 55556)
asyncio.get_event_loop().run_until_complete(start_server)
print("-"*40)

try:
    asyncio.get_event_loop().run_forever()
except KeyboardInterrupt:
    print("Keyboard interrupt")
    clear_local_storage()
    print("Exiting")
    exit(0)
