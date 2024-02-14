import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import PluginManager from "../PluginManager/PluginManager";
import SidebarSuggestion from "../Suggestions/SidebarSuggestions/Sidebar";
import InlineSuggestion from "../Suggestions/InlineSuggestions/Inline";
import DropdownSuggestion from "../Suggestions/DropdownSuggestions/Dropdown";

export default class RemoteConnection extends Plugin {
    constructor(editor) {
        super(editor);

        this.states = {
            NewSetup: 0,
            Reconnected: 1,
            LostConnection: 2,
            Tasks: 3,
            Finished: 4
        }
    }

    static get pluginName() {
        return 'RemoteConnection';
    }

    static get requires() {
        return [PluginManager, InlineSuggestion, SidebarSuggestion, DropdownSuggestion]
    }

    init() {
        this.pluginManager = this.editor.plugins.get(PluginManager.pluginName);
        this.handleServer();
        console.log('RemoteConnection#init() got called');
    }

    handleServer(){
        const socket = new WebSocket('ws://localhost:8080');

        socket.addEventListener('message', function (event) {
            this.handleMessage(event.data)
        });

        socket.addEventListener('error', (event) => {
            console.log('WebSocket error: ', event);
        });

        socket.addEventListener('close', (event) => {
            let reason = event.reason || 'No reason provided by server';
            console.log('Connection closed with code ' + event.code + ' and reason: ' + reason);
            this.pluginManager.enableManualSelection();
        });

    }

    handleMessage(message){
        console.log('Message from server: ', event.data);
    }
}
