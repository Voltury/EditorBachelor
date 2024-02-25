export default class DropdownElement {
    constructor() {
        // Create the suggestion list.
        this.suggestionList = document.createElement('ul');
        this.suggestionList.style.position = 'absolute';
        this.suggestionList.style.top = '50%';
        this.suggestionList.style.left = '50%';
        this.suggestionList.style.backgroundColor = '#2e2e2e';
        this.suggestionList.style.borderRadius = '5px';
        this.suggestionList.style.padding = '10px';
        this.suggestionList.style.listStyleType = 'none';
        this.suggestionList.style.width = '200px';
    }

    static get pluginName() {
        return 'DropdownElement';
    }

    // Method to add the suggestion list to the document's body.
    addToDocument(x, y) {
        this.suggestionList.style.position = 'absolute';
        this.suggestionList.style.left = `${x}px`;
        this.suggestionList.style.top = `${y}px`;
        document.body.appendChild(this.suggestionList);
    }

    // Method to remove the suggestion list from the document's body.
    removeFromDocument() {
        document.body.removeChild(this.suggestionList);
    }

    addSuggestion(suggestion) {
        const listItem = document.createElement('li');
        listItem.textContent = suggestion;
        listItem.style.color = '#ffffff';
        listItem.style.padding = '10px';
        listItem.style.cursor = 'pointer';
        listItem.onmouseover = function () {
            this.style.backgroundColor = '#575757';
        }
        listItem.onmouseout = function () {
            this.style.backgroundColor = '#2e2e2e';
        }
        this.suggestionList.appendChild(listItem);
    }

    addSuggestions(suggestions) {
        for (const suggestion of suggestions) {
            this.addSuggestion(suggestion);
        }
    }

    clearSuggestions() {
        while (this.suggestionList.firstChild) {
            this.suggestionList.removeChild(this.suggestionList.lastChild);
        }
    }
}
