import asyncio
import json

import websockets

Remote_Client = None
Remote_Control = None


async def register(websocket):
    global Remote_Client, Remote_Control
    print("Registering...")
    try:
        data = await asyncio.wait_for(websocket.recv(), timeout=10)
    except asyncio.TimeoutError:
        await websocket.close()
        return

    print(data)
    try:
        data = json.loads(data)
    except json.JSONDecodeError:
        await websocket.close("Invalid JSON data")
        return

    if data["code"] == '89cFkBJ8I3b9TGuvw1Bv':
        if Remote_Client:
            await websocket.close(code=1013, reason="Already a remote client connected")
            return
        Remote_Client = websocket
        print("Remote Client connected")
    elif data["code"] == '4I8UaFQzo7zpp9vlIMQ5':
        if Remote_Control:
            await websocket.close(code=1013, reason="Already a remote control connected")
            return
        print("Remote Control connected")
        Remote_Control = websocket


async def unregister(websocket):
    global Remote_Client, Remote_Control
    if websocket == Remote_Client:
        Remote_Client = None
        print("Remote Client disconnected")
    elif websocket == Remote_Control:
        Remote_Control = None
        print("Remote Control disconnected")
    await websocket.close()


async def send(data):
    if Remote_Control:
        await Remote_Control.send(data)


async def server(websocket):
    try:
        await register(websocket)
        async for message in websocket:
            if websocket == Remote_Client:
                if Remote_Control:
                    await Remote_Control.send(message)
            else:
                if Remote_Client:
                    await Remote_Client.send(message)

    except websockets.ConnectionClosed:
        print("Connection closed")
        await unregister(websocket)
    except OSError as e:
        print(f"OSError: {e}")
        await unregister(websocket)


loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

print("serving at port", 55557)
start_server = websockets.serve(server, "195.201.205.251", 55557)

loop.run_until_complete(start_server)
loop.run_forever()
