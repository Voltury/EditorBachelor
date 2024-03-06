export default class TrackerCommunicator {
    constructor() {
        this.tasks_callback = null;

        if (TrackerCommunicator.instance) {
            return TrackerCommunicator.instance;
        }

        TrackerCommunicator.instance = this;
        this.socket = new WebSocket('ws://localhost:55556');

        this.connectionEstablished = new Promise((resolve, reject) => {
            this.socket.onopen = () => resolve();
            this.socket.onerror = error => reject(error);
        });

        this.socket.addEventListener('message', (event) => {
            const message = event.data;
            if(message.startsWith('error')) {
                console.error(message.substring(6));
            }
            else if(message.startsWith('get_tasks')) {
                this.tasks_callback(message.substring(10));
            }
            else{
                console.log('Message from server ', message);
            }
        });

        return TrackerCommunicator.instance;
    }

    async send(data) {
        await this.connectionEstablished;
        this.socket.send(data);
    }

    register_participant_id(participant_id) {
        this.send("register_participant_id " + participant_id);
    }

    register_condition_id(condition_id) {
        this.send("register_condition_id " + condition_id);
    }

    start_recording() {
        this.send('start_recording');
    }

    end_recording() {
        this.send('end_recording');
    }

    get_tasks(callback) {
        this.tasks_callback = callback;
        this.send('get_tasks');
    }

    save_tasks(tasks){
        this.socket.send("save_tasks "+ tasks);
    }
}
