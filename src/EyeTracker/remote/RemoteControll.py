import asyncio
import json
import threading
import time
import tkinter as tk
from dataclasses import dataclass
from tkinter import scrolledtext
from tkinter import ttk

import websockets


@dataclass
class Data:
    participant_id: str | None
    condition_id: str | None
    document: str | None
    events: list
    current_tasks: dict
    code = "4I8UaFQzo7zpp9vlIMQ5"


class Application(tk.Tk):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.title("Remote Control GUI")

        # Create labels for participant_id, condition_id and current task
        self.participant_id_label = ttk.Label(self, text="Participant ID: ")
        self.participant_id_label.grid(sticky='w')

        self.condition_id_label = ttk.Label(self, text="Condition ID: ")
        self.condition_id_label.grid(sticky='w')

        self.current_task_label = ttk.Label(self, text="Current Task: ")
        self.current_task_label.grid(sticky='w')

        # Create a frame that displays the document
        self.document_frame = scrolledtext.ScrolledText(self, wrap=tk.WORD)
        self.document_frame.grid(sticky='ew')

        # Create a list that displays the events
        self.events_listbox = tk.Listbox(self)
        self.events_listbox.grid(sticky='ew')

        # Create labels for server and client connection status
        self.server_status_label = ttk.Label(self, text="Server Status: Disconnected")
        self.server_status_label.grid(sticky='w')

        self.client_status_label = ttk.Label(self, text="Client Status: Disconnected")
        self.client_status_label.grid(sticky='w')

        # Configure the grid to expand properly when the window is resized
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(6, weight=1)  # adjust this to the row of the widget that should expand vertically

    def update_labels(self, participant_id, condition_id, current_task):
        self.participant_id_label.config(text=f"Participant ID: {participant_id}")
        self.condition_id_label.config(text=f"Condition ID: {condition_id}")
        self.current_task_label.config(text=f"Current Task: {current_task}")

    def update_document(self, document):
        self.document_frame.config(state='normal')
        self.document_frame.delete(1.0, tk.END)
        self.document_frame.insert(tk.INSERT, document if document else "")
        self.document_frame.config(state='disabled')

    def update_events(self, events):
        self.events_listbox.delete(0, tk.END)
        for event in events:
            self.events_listbox.insert(tk.END, event)

    def update_server_status(self, status):
        self.server_status_label.config(text=f"Server Status: {status}")

    def update_client_status(self, status):
        self.client_status_label.config(text=f"Client Status: {status}")


class RemoteControl:
    def __init__(self):
        self.websocket = None
        self.data = Data(None, None, None, [], {})
        self.client = False
        self.gui = Application()

    async def connect(self):
        print("Trying to connect to Remote server...")
        while True:
            try:
                self.websocket = await websockets.connect("ws://195.201.205.251:55557")
                print("Connected to Remote server")
                self.gui.update_server_status("Connected")
                # Identify itself as Remote Control
                await self.websocket.send(json.dumps({"code": self.data.code}))

                while True:
                    try:
                        message = await self.websocket.recv()
                        await self.handle_message(message)
                    except websockets.ConnectionClosed:
                        print("Connection to Remote closed")
                        self.gui.update_server_status("Disconnected")
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
                setattr(self.data, key, message[key])
                if key in ["participant_id", "condition_id", "current_tasks"]:
                    self.gui.update_labels(self.data.participant_id,
                                           self.data.condition_id,
                                           "" if self.data.condition_id not in self.data.current_tasks else
                                           self.data.current_tasks[self.data.condition_id])
                    continue
                if key == "document":
                    self.gui.update_document(self.data.document)
                    continue
                if key == "events":
                    self.gui.update_events(self.data.events)
                    continue
                continue
            # Handle other keys
            match key:
                case "CLIENT":
                    if message[key][0]:
                        print("Remote Client connected")
                        self.client = True
                        self.gui.update_client_status("Connected")
                        await self.send_data({"get_latest_data": []})
                    else:
                        print("Remote Client disconnected")
                        self.client = False
                        self.gui.update_client_status("Disconnected")
                case "EVENT":
                    self.data.events.append(message[key])
                    self.gui.update_events(self.data.events)
                case default:
                    print(f"{key}: {message[key]}")


def start_asyncio_loop(loop, client):
    asyncio.set_event_loop(loop)
    loop.run_until_complete(client.connect())


if __name__ == "__main__":
    client = RemoteControl()

    try:
        # Start the asyncio event loop in a separate thread
        new_loop = asyncio.new_event_loop()
        threading.Thread(target=start_asyncio_loop, args=(new_loop, client), daemon=True).start()
    except RuntimeError:
        pass

    # Start the Tkinter event loop in the main thread
    client.gui.mainloop()
