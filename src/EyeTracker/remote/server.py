import asyncio
import json

import websockets

Remote_Client = None
Remote_Control = None


async def register(websocket):
    global Remote_Client, Remote_Control
    print("Registering...")
    data = await asyncio.wait_for(websocket.recv(), timeout=10)
    data = json.loads(data)

    if data["code"] == '89cFkBJ8I3b9TGuvw1Bv':
        if Remote_Client:
            await websocket.close(code=1013, reason="Already a remote client connected")
            return
        Remote_Client = websocket
        print("Remote Client connected")

        await Remote_Client.send(json.dumps({"CONTROL": [bool(Remote_Control)]}))
        if Remote_Control:
            await Remote_Control.send(json.dumps({"CLIENT": [True]}))

    elif data["code"] == '4I8UaFQzo7zpp9vlIMQ5':
        if Remote_Control:
            await websocket.close(code=1013, reason="Already a remote control connected")
            return
        Remote_Control = websocket
        print("Remote Control connected")

        await Remote_Control.send(json.dumps({"CLIENT": [bool(Remote_Client)]}))
        if Remote_Client:
            await Remote_Client.send(json.dumps({"CONTROL": [True]}))


async def unregister(websocket):
    global Remote_Client, Remote_Control
    if websocket == Remote_Client:
        Remote_Client = None
        print("Remote Client disconnected")
        if Remote_Control:
            await Remote_Control.send(json.dumps({"CLIENT": [False]}))
    elif websocket == Remote_Control:
        Remote_Control = None
        print("Remote Control disconnected")
        if Remote_Client:
            await Remote_Client.send(json.dumps({"CONTROL": [False]}))
    await websocket.close()


async def send(data):
    if Remote_Control:
        await Remote_Control.send(data)


async def server(websocket):
    try:
        await register(websocket)
        async for message in websocket:
            await handle_message(websocket, message)

    except websockets.ConnectionClosed:
        print("Connection closed")
        await unregister(websocket)
    except asyncio.TimeoutError:
        print("Timeout")
        await unregister(websocket)
    except OSError as e:
        print(f"OSError: {e}")
        await unregister(websocket)
    except json.JSONDecodeError:
        print("Invalid JSON data")
        await unregister(websocket)

async def handle_message(sender, message):
    if message == 'close':
        await unregister(sender)
    if sender == Remote_Client:
        if Remote_Control:
            await Remote_Control.send(message)
    else:
        if Remote_Client:
            await Remote_Client.send(message)


loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

print("serving at port", 55557)
start_server = websockets.serve(server, "195.201.205.251", 55557)

loop.run_until_complete(start_server)
loop.run_forever()
