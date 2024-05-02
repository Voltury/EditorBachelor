import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TextSuggestion from "../TextSuggestion/TextSuggestion";
import DropdownElement from "./DropdownElement/DropdownElement";
import Utils from "../../utils";
import ModalPlugin from "../../Modal/Modal";
import {keyCodes} from "@ckeditor/ckeditor5-utils";

export default class DropdownSuggestion extends Plugin {
    static get requires() {
        return [TextSuggestion];
    }

    static get pluginName() {
        return 'DropdownSuggestion';
    }

    init() {
        const editor = this.editor;
        this.dropdownShow = false;
        this.currentlyWriting = false;
        this.selectedIndex = 0;

        // Trigger suggestions
        this.editor.model.document.on('change:data', () => {
            const changes = this.editor.model.document.differ.getChanges();

            if(this.dropdownShow){
                if(changes.length === 1 && changes[0].type === 'insert' && changes[0].name === '$text' && changes[0].length === 1){
                    // Check if the inserted text is a space (and before the suggestion)
                    const insertedText = changes[0].position.parent._children._nodes[changes[0].position.path[0]]._data[changes[0].position.path[1]];
                    console.log(insertedText)

                    if(insertedText === ' '){
                        // If it's a space, don't remove the suggestion
                        return;
                    }
                }
                this._removeDropdown();
            }
            this._possibleSuggestion.bind(this)();
        });

        this.editor.model.document.selection.on('change', () => {
            TextSuggestion.clearTimer();
        });


        editor.on('ready', () => {
            this.dropdownElement = new DropdownElement();

            // Add these lines
            this.editor.editing.view.document.on('keydown', (event, data) => {
                if (data.keyCode === keyCodes.tab) {
                    data.preventDefault();
                    event.stop();
                }

                if (!this.dropdownShow) return;

                switch (data.keyCode) {
                    case keyCodes.ArrowUp:
                        data.preventDefault();
                        if(this.dropdownElement.mouseHover) return;
                        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                        break;
                    case keyCodes.ArrowDown: case keyCodes.Tab:
                        data.preventDefault();
                        if(this.dropdownElement.mouseHover) return;
                        this.selectedIndex = Math.min(this.selectedIndex + 1, this.dropdownElement.suggestionList.children.length - 1);
                        break;
                    case keyCodes.Enter:
                        data.preventDefault();
                        this._addToText(this.dropdownElement.suggestionList.children[this.selectedIndex].textContent);
                        break;
                    default:
                        return;
                }

                // Highlight the selected suggestion
                for (const child of this.dropdownElement.suggestionList.children) {
                    child.classList.remove('selected');
                }
                this.dropdownElement.suggestionList.children[this.selectedIndex].classList.add('selected');
            });
        });
    }

    _possibleSuggestion() {
        if (this.currentlyWriting) return;

        const task = this.editor.plugins.get(ModalPlugin.pluginName).get_current_task();
        if(!task){
            return;
        }

        TextSuggestion.generateSuggestion(
            Utils._getTextBeforeCursor(this.editor),
            task,
            3,
            () => {return true},
            this._insertDropdown.bind(this),
            1000)
    }

    _insertDropdown(suggestions) {
        // Get the current selection.
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        // Get the bounding rectangle of the current selection.
        let rect;
        if (selection.isCollapsed) {
            // Create a temporary node at the selection.
            const range = selection.getRangeAt(0).cloneRange();
            const tempNode = document.createElement('span');
            tempNode.appendChild(document.createTextNode('\u200B'));
            range.insertNode(tempNode);

            // Get the bounding rectangle of the temporary node.
            rect = tempNode.getBoundingClientRect();

            // Remove the temporary node.
            tempNode.parentNode.removeChild(tempNode);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            rect = selection.getRangeAt(0).getBoundingClientRect();
        }

        // Add the dropdown to the document at the position of the selection.
        this.dropdownElement.addSuggestions(suggestions, this._addToText.bind(this));
        this.dropdownElement.addToDocument(rect.left, rect.bottom);
        this.dropdownShow = true;
        this.editor.fire(Utils.SuggestionsDisplayed, {"suggestions": suggestions})
    }

    _removeDropdown() {
        TextSuggestion.clearTimer();
        if (!this.dropdownShow) return;
        this.selectedIndex = 0;

        this.dropdownElement.removeFromDocument();
        this.dropdownShow = false;

        let suggestions = [];
        for(const child of this.dropdownElement.suggestionList.children) {
            suggestions.push(child.textContent);
        }

        this.dropdownElement.clearSuggestions()

        this.editor.fire(Utils.SuggestionsRemoved, {"suggestions": suggestions})
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
        for(const child of this.dropdownElement.suggestionList.children) {
            suggestions.push(child.textContent);
        }
        this.editor.fire(Utils.SuggestionInserted, {"selected": suggestion, "all": suggestions})

        this.currentlyWriting = false;
        // Set focus back to the text field
        this.editor.editing.view.focus();
    }
}
