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
            this.editor.model.document.registerPostFixer( writer => {
                if(this.sidebarElement.firstChild) {
                    const changes = this.editor.model.document.differ.getChanges();

                    // change of selection
                    if(changes.length === 0){
                        return;
                    }

                    for ( const entry of changes ) {
                        if ( entry.type === 'insert' && entry.name === '$text' ) {
                            // when creating a new paragraph, entry.position.textNode is empty
                            let text = null;
                            if(entry.position.textNode === null && entry.position.nodeAfter !== null){
                                text =  entry.position.nodeAfter.data[entry.position.offset]
                            }
                            else{
                                text = entry.position.textNode.data[entry.position.offset]
                            }

                            if(text === ' '){
                                return;
                            }
                        }
                    }
                    this._removeSuggestions();
                }
                this._possibleSuggestion.bind(this)();
            } );

            this.editor.model.document.selection.on('change', () => {
                TextSuggestion.clearTimer();
            });
        });
    }

    _possibleSuggestion() {
        const task = this.editor.plugins.get(ModalPlugin.pluginName).get_current_task();
        if(!task){
            return;
        }

        const prompt = [{"role": "system",
            "content": `You are a smart text generator that helps the user to write a blogpost about the following topic: ${task}. Your task is to always generate exactly one complete sentence.`},
            {"role": "user", "content": `${Utils._getTextBeforeCursor(this.editor)}.`}]

        TextSuggestion.generateSuggestion(
            prompt,
            4,
            () => {return true},
            this._insertSuggestions.bind(this))
    }

    _insertSuggestions(suggestions) {
        this._removeSuggestions();

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

        this.editor.fire(Utils.SuggestionsDisplayed, {"suggestions": suggestions});
    }

    _removeSuggestions() {
        // Ignore if there are no suggestions
        if(!this.sidebarElement.firstChild) return;

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
