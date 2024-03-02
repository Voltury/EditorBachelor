import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import DropdownSuggestion from "./Suggestions/DropdownSuggestions/Dropdown";
import InlineSuggestion from "./Suggestions/InlineSuggestions/Inline";
import SidebarSuggestion from "./Suggestions/SidebarSuggestions/Sidebar";
import Utils from "./Suggestions/utils";

export default class Manager extends Plugin {
    constructor(editor) {
        super(editor);

        this.editor = editor;
        this.conditionId = null;
        this.paricipantId = null;
    }
    static get pluginName() {
        return 'Manager';
    }

    init() {
        // setup Study Align
        this.handleSal();

        // setup connection with eye tracker server
        this.handleServer(this.paricipantId);
    }

    afterInit() {
        document.addEventListener('keydown', event => {
            const currentDate = new Date();
            const timestamp = currentDate.getTime();

            let metaData = {"isFocused": this.editor.editing.view.document.isFocused, "text": null, "before_cursor": null, "after_cursor": null};

            if (this.editor.editing.view.document.isFocused) {
                metaData.text = this.editor.getData();
                metaData.before_cursor = Utils._getTextBeforeCursor(this.editor, 20);
                metaData.after_cursor = Utils._getTextAfterCursor(this.editor, 20);
            }

            this.sal.logKeyboardInteraction(this.conditionId, 'keydown', event, timestamp, metaData)
                .then(response => {
                    console.log(response);
                })
                .catch(error => {
                    console.log(error);
                });
        });
        this.editor.on(Utils.SuggestionsRemoved, (event, data) => {
            const currentDate = new Date();
            const timestamp = currentDate.getTime();

            this.sal.logGenericInteraction(this.conditionId, Utils.SuggestionsRemoved, data, timestamp)
                .then(response => {
                    console.log(response);
                })
                .catch(error => {
                    console.log(error);
                });
        });
        this.editor.on(Utils.SuggestionsDisplayed, (event, data) => {
            const currentDate = new Date();
            const timestamp = currentDate.getTime();

            this.sal.logGenericInteraction(this.conditionId, Utils.SuggestionsDisplayed, data, timestamp)
                .then(response => {
                    console.log(response);
                })
                .catch(error => {
                    console.log(error);
                });
        });
        this.editor.on(Utils.SuggestionInserted, (event, data) => {
            const currentDate = new Date();
            const timestamp = currentDate.getTime();

            this.sal.logGenericInteraction(this.conditionId, Utils.SuggestionInserted, data, timestamp)
                .then(response => {
                    console.log(response);
                })
                .catch(error => {
                    console.log(error);
                });
        });
    }

    handleSal(){
        const url = new URL(window.location.href);
        this.conditionId = url.searchParams.get("condition_id") || 1; // value from get parameter or 1 (default)
        const loggerKey = url.searchParams.get("logger_key"); // needed for logging
        const participantToken = url.searchParams.get("participant_token");
        this.paricipantId = url.searchParams.get("participant_id");

        if (!participantToken) {
            console.log("No participant Token");
            //this.socket.close(4000, "No participant Token");
            return;
        }

        console.log(this.conditionId)
        console.log(loggerKey)

        this.sal = new studyAlignLib("https://hciaitools.uni-bayreuth.de/study-align-sec", 32); // params: backend_url and studyId
        console.log(this.sal)
        this.sal.setLoggerKey(loggerKey);

        setTimeout(this.saveToProceed.bind(this, participantToken), 5000);
    }

    handleServer(id) {
        const pluginName = (() => {
            if(this.editor.plugins.has(InlineSuggestion.pluginName)) return InlineSuggestion.pluginName;
            if(this.editor.plugins.has(DropdownSuggestion.pluginName)) return DropdownSuggestion.pluginName;
            if(this.editor.plugins.has(SidebarSuggestion.pluginName)) return SidebarSuggestion.pluginName;
            else return 'baseline';
        })();

        const socket = new WebSocket('ws://localhost:55556');

        socket.addEventListener('open', (_) => {
            socket.send(id);
            socket.send(pluginName);
            socket.send('start')
        });

        socket.addEventListener('message', function (event) {
            console.log(event.data)
        });

        socket.addEventListener('error', (event) => {
            console.log('WebSocket error: ', event);
        });

        socket.addEventListener('close', (event) => {
            let reason = event.reason || 'No reason provided by server';
            console.log('Connection closed with code ' + event.code + ' and reason: ' + reason);
        });
    }

    async saveToProceed(participantToken) {
        try {
            console.log("Message studyAlign with Token: " + participantToken);
            await this.sal.updateNavigator(participantToken, "condition", "done");
        } catch (e) {
            console.warn(e)
            console.warn("StudyAlign Navigator could not be updated");
        }
    }
}
