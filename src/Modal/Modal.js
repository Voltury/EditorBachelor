import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import './theme/modal.css';
import FileServer from "../FileServer";
import Manager from "../Manager";
import Utils from "../utils";

let selectedTask = null;
const intro = {
    language: 'English',
    textLength: 'The blog post should have a at least 150 words.',
    quality: 'The quality of the text should be moderate / reasonable. It must not be perfect yet you should avoid making lot of mistakes. Try to be efficient and effective at the same time! The task does not assess your writing skills.',
    time: 'You should try to finish the task within 8-12 minutes.'
};

export default class ModalPlugin extends Plugin {
    static get requires() {
        return [Manager]
    }

    static get pluginName() {
        return 'ModalPlugin';
    }

    init() {
        const url = new URL(window.location.href);
        this.conditionId = url.searchParams.get("condition_id");
        this.paricipantId = url.searchParams.get("participant_id");
        this.participantToken = url.searchParams.get("participant_token");
        this.waiting_for_data = {"tasks": true, "document_data": true};

        this.fileServer = new FileServer(this.editor);

        this.tasks = {};
        this.view = null;
        const editor = this.editor;

        editor.ui.componentFactory.add( 'modalButton', locale => {
            this.view = new ButtonView(locale);

            this.view.set({
                label: 'Open modal',
                tooltip: true,
                withText: true
            });

            // Callback executed once the image is clicked.
            this.view.on('execute', () => {
                this.showSelectedTask();
            });
            return this.view;
        });

        this.openLoadingModal();

        this.fileServer.get_tasks((response) => {
            this.tasks = JSON.parse(response);
            this.waiting_for_data.tasks = false;

            console.log(this.tasks);
            if(this.waiting_for_data.document_data === false) this.closeLoadingModal();
        });

        this.fileServer.get_document_data((response) => {
            this.editor.setData(response);
            this.waiting_for_data.document_data = false;

            if(this.waiting_for_data.tasks === false) this.closeLoadingModal();
        });
    }

    openLoadingModal() {
        const modal = document.createElement('div');
        modal.classList.add('modal', 'loading-modal');

        let modalContent = '<div class="modal-content">';
        modalContent += '<h2>Loading...</h2>';
        modalContent += '<p>Please wait while we fetch the tasks from the server.</p>';
        modalContent += '</div>';

        modal.innerHTML = modalContent;
        document.body.appendChild(modal);
    }

    closeLoadingModal() {
        const modal = document.querySelector('.loading-modal');
        document.body.removeChild(modal);

        if (!this.tasks[this.conditionId]) {
            this.openModal();
        }
        else{
            this.view.set( {
                label: 'Task: ' + this.tasks[this.conditionId],
            } );
            this.start_data_collection();
        }
    }

    openModal() {
        const modal = document.createElement('div');
        modal.classList.add('modal');

        let modalContent = '<div class="modal-content">';
        modalContent += `<h2>Select a Task</h2>
                  <p><strong>Language:</strong> ${intro.language}</p>
                  <p><strong>Text Length:</strong> ${intro.textLength}</p>
                  <p><strong>Quality:</strong> ${intro.quality}</p>
                  <p><strong>Time:</strong> ${intro.time}</p>`;
        this.tasks.tasks.forEach((task, index) => {
            if (!Object.values(this.tasks).includes(task.title)) {
                modalContent += `
                    <div class="task" id="task${index}">
                        <h3>${task.title}</h3>
                        <p>${task.description}</p>
                    </div>
                `;
            }
        });
        modalContent += '<button class="close-button" disabled>Select your task first</button></div>';

        modal.innerHTML = modalContent;
        document.body.appendChild(modal);

        const closeButton = modal.querySelector('.close-button');
        const taskDivs = modal.querySelectorAll('.task');

        taskDivs.forEach(taskDiv => {
            taskDiv.addEventListener('click', () => {
                taskDivs.forEach(task => task.classList.remove('selected'));
                taskDiv.classList.add('selected');
                closeButton.disabled = false;
                closeButton.textContent = taskDiv.querySelector('h3').textContent;
                selectedTask = taskDiv;
            });
        });

        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);

            this.tasks[this.conditionId] = selectedTask.querySelector('h3').textContent;
            this.view.set( {
                label: 'Task: ' + selectedTask.querySelector('h3').textContent,
            } );
            this.fileServer.save_tasks(JSON.stringify(this.tasks));

            this.editor.fire(Utils.TaskSelected, {"selected": this.tasks[this.conditionId], "all": this.tasks.tasks});
            this.start_data_collection();
        });
    }

    showSelectedTask() {
        const modal = document.createElement('div');
        modal.classList.add('modal');

        let modalContent = '<div class="modal-content">';
        modalContent += `<h2>Selected Task</h2>
                      <p><strong>Language:</strong> ${intro.language}</p>
                      <p><strong>Text Length:</strong> ${intro.textLength}</p>
                      <p><strong>Quality:</strong> ${intro.quality}</p>
                      <p><strong>Time:</strong> ${intro.time}</p>`;
        const selectedTask = this.tasks.tasks.find(task => task.title === this.tasks[this.conditionId]);

        modalContent += `
            <div class="task">
                <h3>${selectedTask.title}</h3>
                <p>${selectedTask.description}</p>
            </div>
        `;
        modalContent += '<button class="close-button">Close</button></div>';

        modal.innerHTML = modalContent;
        document.body.appendChild(modal);

        const closeButton = modal.querySelector('.close-button');

        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    start_data_collection() {
        const manager = this.editor.plugins.get(Manager.pluginName);

        //this.fileServer.start_recording();
        manager.setup_listeners();
        this.fileServer.enable_autosave();

        // Set time until user can proceed
        setTimeout(() => {
            manager.saveToProceed(manager.participantToken);
        }, 5000);
    }

    get_current_task() {
        if(this.waiting_for_data.tasks === true || this.waiting_for_data.document_data === true) return null;
        let task = this.tasks.tasks.find(task => task.title === this.tasks[this.conditionId]);
        return task ? task.description : null;
    }
}
