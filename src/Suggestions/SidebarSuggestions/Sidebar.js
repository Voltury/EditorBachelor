import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import './theme/Sidebar.css';

import TextSuggestion from "../TextSuggestion/TextSuggestion";
import Utils from "../../utils";

export default class SidebarSuggestion extends Plugin {
    static get requires() {
        return [TextSuggestion];
    }

    static get pluginName() {
        return 'SidebarSuggestion';
    }

    init() {
        console.log('SidebarPlugin#init() got called');

        this.currentlyWriting = false;
        this.width = 200;

        this.editor.on('ready', () => {
            const offset_left = document.querySelector('.ck-editor').offsetLeft;

            // Create sidebar UI
            this.sidebarElement = document.createElement('div');
            this.sidebarElement.className = 'sidebar';
            this.sidebarElement.style.width = this.width + 'px';
            this.sidebarElement.style.left = offset_left + "px";
            let toolbar = document.querySelector('.ck-toolbar');
            let toolbarHeight = toolbar.offsetHeight; // Get toolbar's height
            let editorTopPosition = document.querySelector('.ck-editor').offsetTop; // Get editor's top position
            this.sidebarElement.style.top = editorTopPosition + toolbarHeight + "px";
            document.body.style.marginLeft = (offset_left + this.width + 1) + "px"; // the border adds a thickness if 2px (1, so borders overlap)
            document.body.appendChild(this.sidebarElement);

            // Trigger suggestions
            this.editor.model.document.on('change:data', this._possibleSuggestion.bind(this));
            this.editor.model.document.selection.on('change:range', TextSuggestion.clearTimer.bind(TextSuggestion));
        });
    }

    _possibleSuggestion() {
        if(this.currentlyWriting) return;
        TextSuggestion.generateSuggestion(Utils._getTextBeforeCursor(this.editor),
            4,
            20,
            Utils._checkSuggestionAppropriate.bind(null, this.editor),
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
            //button.style.border = '1px solid #ccc'; // Add thin outline
            button.style.backgroundColor = 'white'; // White background
            button.style.color = 'black'; // Black text
            button.style.padding = '15px'; // Padding for a larger, more clickable area
            button.style.textAlign = 'center'; // Centered text
            button.style.textDecoration = 'none'; // Remove default underline
            button.style.display = 'inline-block';
            //button.style.fontSize = '16px'; // Larger font size
            button.style.transitionDuration = '0.4s'; // Transition effect
            button.onmouseover = function () {
                button.style.backgroundColor = '#f2f2f2'
            }; // Slightly gray when mouse hovers over
            button.onmouseout = function () {
                button.style.backgroundColor = 'white'
            }; // Return to white when mouse leaves
            button.onclick = () => this._addToText(suggestion);

            // Append each suggestion button to the sidebar element
            this.sidebarElement.appendChild(button);
        });
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
        this.currentlyWriting = true;
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

        this.currentlyWriting = false;
        // Set focus back to the text field
        this.editor.editing.view.focus();
    }
}
