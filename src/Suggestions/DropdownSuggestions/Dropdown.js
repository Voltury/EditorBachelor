import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TextSuggestion from "../TextSuggestion/TextSuggestion";
import DropdownElement from "./DropdownElement/DropdownElement";

export default class DropdownSuggestion extends Plugin {
    static get requires() {
        return [TextSuggestion];
    }

    static get pluginName() {
        return 'DropdownSuggestion';
    }

    static get labelName(){
        return "Dropdown"
    }

    init() {
        const editor = this.editor;
        this.isEnabled = false;
        this.dropdownShow = false;

        // Trigger suggestions
        this.editor.model.document.on('change:data', () => {
            if (this.isEnabled) this._possibleSuggestion();
        });
        this.editor.model.document.selection.on('change:range', () => {
            if (this.isEnabled) this._removeExistingSuggestion();
        });

        editor.on('ready', () => {
            this.dropdownElement = new DropdownElement();
        });
    }

    _possibleSuggestion() {
        // Get the current selection.
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        // Get the bounding rectangle of the current selection.
        const rect = selection.getRangeAt(0).getBoundingClientRect();

        // Add the dropdown to the document at the position of the selection.
        this.dropdownElement.addToDocument(rect.left, rect.bottom);
        this.dropdownShow = true;
    }

    _removeExistingSuggestion() {
        if(!this.dropdownShow) return;

        this.dropdownElement.removeFromDocument();
        this.dropdownShow = false;
    }

    enablePlugin() {
        this.isEnabled = true;
    }

    disablePlugin() {
        this.isEnabled = false;
        this._removeExistingSuggestion();
    }
}
