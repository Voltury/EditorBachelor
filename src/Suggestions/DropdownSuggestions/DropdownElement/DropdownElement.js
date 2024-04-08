import DropdownSuggestion from "../Dropdown";

export default class DropdownElement {
    constructor() {
        // Create the suggestion list.
        this.suggestionList = document.createElement('ul');
        this.suggestionList.style.position = 'absolute';
        this.suggestionList.style.top = '50%';
        this.suggestionList.style.left = '50%';
        this.suggestionList.style.backgroundColor = '#ffffff';
        this.suggestionList.style.borderRadius = '5px';
        this.suggestionList.style.padding = '10px';
        this.suggestionList.style.listStyleType = 'none';
        this.suggestionList.style.width = '200px';
        this.suggestionList.style.border = '1px solid #ccc';
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

    addSuggestion(suggestion, buttonCallback, index) {
        this.dropdown = editor.plugins.get(DropdownSuggestion.pluginName);
        const listItem = document.createElement('li');

        if(index === 0){
            listItem.classList.add('selected');
        }

        listItem.textContent = suggestion;
        listItem.style.padding = '10px';
        listItem.style.cursor = 'pointer';
        listItem.style.transitionDuration = '0.4s'; // Transition effect
        listItem.onmouseover = () => {
            this.mouseHover = true;
            for (const child of this.suggestionList.children) {
                child.classList.remove('selected');
            }
            listItem.classList.add('selected');
            this.dropdown.selectedIndex = index;
        };
        listItem.onmouseout = () => {
            this.mouseHover = false;
        };
        listItem.onclick = () => buttonCallback(suggestion);

        this.suggestionList.appendChild(listItem);
    }

    addSuggestions(suggestions, buttonCallback) {
        let counter = 0;
        for (const suggestion of suggestions) {
            this.addSuggestion(suggestion, buttonCallback, counter++);
        }
    }

    clearSuggestions() {
        while (this.suggestionList.firstChild) {
            this.suggestionList.removeChild(this.suggestionList.lastChild);
        }
    }
}
