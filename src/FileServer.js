import Utils from "./utils";

export default class FileServer {
    constructor(editor){
        this.tasks_callback = null;
        this.document_data_callback = null;
        this.editor = editor;
        this.autosave_timer = null;
        this.content_changed = false;

        if (FileServer.instance) {
            return FileServer.instance;
        }

        FileServer.instance = this;
        this.socket = new WebSocket('ws://localhost:55556');

        this.connectionEstablished = new Promise((resolve, reject) => {
            this.socket.onopen = () => resolve();
            this.socket.onerror = error => reject(error);
        });

        this.socket.addEventListener('message', (event) => {
            let message = null;
            try{
                message = JSON.parse(event.data);
            } catch (e) {
                console.error('Failed to parse message from server ', event.data);
                return;
            }

            for(const key in message) {
                const value = message[key];
                switch(key){
                    case 'ERROR':
                        console.error(value);
                        break;
                    case 'get_tasks':
                        this.tasks_callback(value[0]);
                        break;
                    case 'document':
                        this.document_data_callback(value[0]);
                        break;
                    default:
                        console.log('Message from server ', message);
                }
            }
        });

        this.editor.model.document.on('change:data', () => {
            if(this.autosave_timer !== null) this.content_changed = true;
        });

        return FileServer.instance;
    }

    async send(data) {
        await this.connectionEstablished;
        this.socket.send(JSON.stringify(data));
    }

    register_participant_id(participant_id) {
        this.send({"register_participant_id": [participant_id]});
    }

    register_condition_id(condition_id) {
        this.send({"register_condition_id": [condition_id]});
    }

    register_study_id(study_id) {
        this.send({"register_study_id": [study_id]});
    }

    start_recording() {
        this.send({"start_recording": []});
    }

    end_recording() {
        this.send({"end_recording": []});
    }

    get_tasks(callback) {
        this.tasks_callback = callback;
        this.send({"get_tasks": []});
    }

    save_tasks(tasks){
        this.send({"save_tasks": [tasks]});
    }

    get_document_data(callback) {
        this.document_data_callback = callback;
        this.send({"get_document_data": []});
    }

    save_document_data() {
        if(this.editor.getData() === "") return;
        // Get the editor data
        let data = editor.getData();

        // Create a temporary DOM div element
        let tempDiv = document.createElement('div');

        // Set its innerHTML to the editor data
        tempDiv.innerHTML = data;

        // Select all elements with the class 'NonEditableElement' and remove them
        let elements = tempDiv.getElementsByClassName("NonEditableElement");
        while(elements[0]) {
            elements[0].parentNode.removeChild(elements[0]);
        }

        // The cleaned data is now the innerHTML of the temporary div
        let cleanedData = tempDiv.innerHTML;

        this.send({"save_document_data": [cleanedData]});
    }

    event(event_type, event, timestamp = {}) {
        let temp = {};
        if (event_type === "keydown") {
            temp = {
                "event_type": event_type,
                "event": {
                    "key": event.key,
                    "alt": event.altKey,
                    "shift": event.shiftKey,
                    "ctrl": event.ctrlKey
                },
                "timestamp": timestamp
            };
        } else if (event_type === Utils.SuggestionsRemoved || event_type === Utils.SuggestionsDisplayed || event_type === Utils.SuggestionInserted || event_type === Utils.TaskSelected) {
            temp = {
                "event_type": event_type,
                "event": event,
                "timestamp": timestamp
            };
        }
        this.send({"event": [temp]});
    }

    set_study_align_connection(is_connected) {
        this.send({"study_align_connected": [is_connected]});
    }

    set_prototype_logging(is_logging) {
        this.send({"set_prototype_logging": [is_logging]});
    }

    enable_autosave() {
        this.autosave_timer = setInterval(() => {
            if(this.content_changed) {
                this.save_document_data();
                this.content_changed = false;
            }
        }, 1000);
    }

    disable_autosave() {
        clearInterval(this.autosave_timer);
        this.autosave_timer = null;
    }
}
