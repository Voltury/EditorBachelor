import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import './theme/Sidebar.css';

import TextSuggestion from "../TextSuggestion/TextSuggestion";
import Utils from "../../utils";
import ModalPlugin from "../../Modal/Modal";

export default class SidebarSuggestion extends Plugin {
    static get requires() {
        return [TextSuggestion];
    }

    static get pluginName() {
        return 'SidebarSuggestion';
    }

    init() {
        console.log('SidebarPlugin#init() got called');

        this.max_suggestions = 8;
        this.width = 200;

        this.editor.on('ready', () => {
            // Use the existing sidebar div
            this.sidebarElement = document.querySelector('#sidebar');
            this.sidebarElement.className = 'sidebar';
            this.sidebarElement.style.width = this.width + 'px';

            // Set the sidebar height to match the editor height minus the toolbar height
            let editorElement = document.querySelector('#editor');
            let editorHeight = parseInt(getComputedStyle(editorElement).height);
            this.sidebarElement.style.height = editorHeight + 'px';

            // Trigger suggestions
            this.editor.model.document.on('change:data', this._possibleSuggestion.bind(this));
            this.editor.model.document.selection.on('change:range', TextSuggestion.clearTimer.bind(TextSuggestion));
        });
    }

    _possibleSuggestion() {
        const task = this.editor.plugins.get(ModalPlugin.pluginName).get_current_task();
        if(!task){
            return;
        }

        TextSuggestion.generateSuggestion(
            Utils._getTextBeforeCursor(this.editor),
            task,
            1,
            () => {return true},
            this._insertSuggestions.bind(this),
            1000)
    }

    _insertSuggestions(suggestions) {
        suggestions.forEach(suggestion => {
            const button = document.createElement('button');
            button.textContent = suggestion;
            button.className = 'suggestion-button';
            button.style.width = this.width + 'px';
            button.style.border = 'none';
            button.style.borderBottom = '1px solid #ccc';

            button.style.marginBottom = '0px'; // No vertical spacing between buttons
            button.style.backgroundColor = 'white'; // White background
            button.style.color = 'black'; // Black text
            button.style.padding = '15px'; // Padding for a larger, more clickable area
            button.style.textAlign = 'center'; // Centered text
            button.style.textDecoration = 'none'; // Remove default underline
            button.style.display = 'inline-block';
            button.style.transitionDuration = '0.4s'; // Transition effect
            button.onmouseover = function () {
                button.style.backgroundColor = '#f2f2f2'
            }; // Slightly gray when mouse hovers over
            button.onmouseout = function () {
                button.style.backgroundColor = 'white'
            }; // Return to white when mouse leaves
            button.onclick = () => this._addToText(suggestion);

            // Insert each suggestion button at the top of the sidebar element
            this.sidebarElement.insertBefore(button, this.sidebarElement.firstChild);
        });

        // If the number of suggestions exceeds maxSuggestions, remove the last one
        while (this.sidebarElement.childNodes.length > this.max_suggestions) {
            this.sidebarElement.removeChild(this.sidebarElement.lastChild);
            this.editor.fire(Utils.SuggestionsRemoved, {"suggestion": this.sidebarElement.lastChild.textContent});
        }

        this.editor.fire(Utils.SuggestionsDisplayed, {"suggestions": suggestions});
    }

    _removeSuggestions() {
        let suggestions = []
        while (this.sidebarElement.firstChild) {
            suggestions.push(this.sidebarElement.firstChild.textContent);
            this.sidebarElement.removeChild(this.sidebarElement.firstChild);
        }
        this.editor.fire(Utils.SuggestionsRemoved, {"suggestions": suggestions});
    }
    
    _addToText(suggestion) {
        const selection = this.editor.model.document.selection;
        const range = selection.getFirstPosition();
        this.editor.model.change(writer => {
            writer.insertText(suggestion, range);
            // Move the cursor to the end of the inserted text
            const endPosition = range.getShiftedBy(suggestion.length);
            writer.setSelection(endPosition);
        });

        let suggestions = [];
        for(const child of this.sidebarElement.children) {
            suggestions.push(child.textContent);
        }
        this.editor.fire(Utils.SuggestionInserted, {"selected": suggestion, "all": suggestions})

        // Set focus back to the text field
        this.editor.editing.view.focus();
    }
}
