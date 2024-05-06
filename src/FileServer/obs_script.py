import asyncio
import os
import time
from obswebsocket import obsws, requests


# All requests:
# https://github.com/obsproject/obs-websocket/blob/master/src/requesthandler/RequestHandler.cpp

class OBSController:
    def __init__(self, host, port, password):
        self.host = host
        self.port = port
        self.password = password
        self.ws = obsws(self.host, self.port, self.password)
        self.is_recording = False
        self.connect()

    def connect(self):
        self.ws.connect()
        print("Connected to OBS websocket server")

    def disconnect(self):
        self.ws.disconnect()
        print("Disconnected from OBS websocket server")

    async def start_recording(self):
        self.ws.call(requests.StartRecord())
        await asyncio.sleep(0.2)
        self.is_recording = self.ws.call(requests.GetRecordStatus()).datain['outputActive']
        print(f"Started obs websocket recording. Is recording: {self.is_recording}")

    def stop_recording(self, participant_id, condition_id):
        # Check if OBS is currently recording
        if self.ws.call(requests.GetRecordStatus()).datain['outputActive']:
            self.ws.call(requests.StopRecord())

            # Wait for OBS to finish writing the file
            time.sleep(3)

            # Get the current recording path
            current_path = self.ws.call(requests.GetRecordDirectory()).datain['recordDirectory']

            # Get the latest file in the directory
            latest_file = max([os.path.join(current_path, f) for f in os.listdir(current_path)], key=os.path.getctime)

            # Define new directory and filename
            new_dir = f"./data/{participant_id}/{condition_id}/"
            file_id = 0
            new_filename = f"screencapture_{file_id}.mkv"
            new_path = os.path.join(new_dir, new_filename)

            # Create the new directory if it doesn't exist
            os.makedirs(new_dir, exist_ok=True)

            # Check if file already exists, if so, increment id until filename is available
            while os.path.exists(new_path):
                file_id += 1
                new_filename = f"screencapture_{file_id}.mkv"
                new_path = os.path.join(new_dir, new_filename)

            # Move and rename the file in one call
            os.rename(latest_file, new_path)
        self.is_recording = False
        print("Stopped obs websocket recording")


# Usage
if __name__ == "__main__":
    obs = OBSController("localhost", 55558, "CFd0w3bUdQHI3Ctf")
    obs.connect()
    obs.start_recording()
    time.sleep(5)
    obs.stop_recording(42, 61)
    obs.disconnect()
