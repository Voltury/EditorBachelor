import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TextSuggestion from "../TextSuggestion/TextSuggestion";
import DropdownElement from "./DropdownElement/DropdownElement";
import Utils from "../utils";

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

        // Trigger suggestions
        this.editor.model.document.on('change:data', this._possibleSuggestion.bind(this));
        this.editor.model.document.selection.on('change:range', this._removeDropdown.bind(this));

        editor.on('ready', () => {
            this.dropdownElement = new DropdownElement();
        });
    }

    _possibleSuggestion() {
        TextSuggestion.generateSuggestion(Utils._getTextBeforeCursor(this.editor, 100),
            3,
            10,
            Utils._checkSuggestionAppropriate.bind(null, this.editor),
            this._insertDropdown.bind(this))
    }

    _insertDropdown(suggestions) {
        // Get the current selection.
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        // Get the bounding rectangle of the current selection.
        const rect = selection.getRangeAt(0).getBoundingClientRect();

        // Add the dropdown to the document at the position of the selection.
        this.dropdownElement.addSuggestions(suggestions)
        this.dropdownElement.addToDocument(rect.left, rect.bottom);
        this.dropdownShow = true;
    }

    _removeDropdown() {
        if (!this.dropdownShow) return;

        this.dropdownElement.removeFromDocument();
        this.dropdownShow = false;
        this.dropdownElement.clearSuggestions()
    }
}
