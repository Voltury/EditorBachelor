import os
import time
from obswebsocket import obsws, requests, events

import asyncio


# All requests:
# https://github.com/obsproject/obs-websocket/blob/master/src/requesthandler/RequestHandler.cpp

class OBSController:
    def __init__(self, host, port, password, fileserver):
        self.host = host
        self.port = port
        self.password = password
        self.fileserver = fileserver
        self.ws = obsws(self.host, self.port, self.password)
        self.connect()
        self.record_state = {
            "outputActive": False,
            "outputPath": None,
            "outputState": None
        }

        self.ws.register(self.handle_events)

    def connect(self):
        self.ws.connect()

    def disconnect(self):
        self.ws.disconnect()

    def handle_events(self, event):

        match type(event):
            case events.RecordStateChanged:
                if self.record_state['outputActive'] != event.datain['outputActive']:
                    if event.datain['outputActive']:
                        self.record_state['outputActive'] = True
                        self.log("Started recording")
                        asyncio.run(self.fileserver.set_obs_recording(True))
                    else:
                        self.record_state['outputActive'] = False
                        self.log("Stopped recording")
                        asyncio.run(self.fileserver.set_obs_recording(False))

                if self.record_state['outputPath'] != event.datain['outputPath']:
                    self.log(f"Recording path changed {self.record_state['outputPath']} -> {event.datain['outputPath']}")
                    self.record_state['outputPath'] = event.datain['outputPath']

                if self.record_state['outputState'] != event.datain['outputState']:
                    self.log(f"Log output changed {self.record_state['outputState']} -> {event.datain['outputState']}")
                    self.record_state['outputState'] = event.datain['outputState']
            case default:
                self.log(f"Unhandled event: {event}")

    def start_recording(self):
        self.ws.call(requests.StartRecord())

    def stop_recording(self):
        # Check if OBS is currently recording
        if self.record_state['outputActive']:
            self.ws.call(requests.StopRecord())

    def set_output_path(self, path):
        os.makedirs(path, exist_ok=True)
        self.ws.call(requests.SetRecordDirectory(recordDirectory=path))

    @staticmethod
    def log(message):
        print(f"OBS: {message}")


# Usage
if __name__ == "__main__":
    obs = OBSController("localhost", 55558, "CFd0w3bUdQHI3Ctf")
    obs.set_output_path(os.path.join(os.getcwd(), "data", str(-1), str(-1)))

    obs.start_recording()
    time.sleep(5)
    obs.stop_recording()
    obs.disconnect()
