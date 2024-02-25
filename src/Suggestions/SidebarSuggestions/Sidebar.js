import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import './theme/Sidebar.css';

export default class SidebarSuggestion extends Plugin {
    static get pluginName() {
        return 'SidebarSuggestion';
    }

    init() {
        console.log('SidebarPlugin#init() got called');

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

            // Adding buttons with pseudo suggestions
            const suggestions = ['This is suggestions 1', 'This is a short one', 'And because we need it, this is a longer one'];

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
                button.onclick = () => alert(suggestion);

                // Append each suggestion button to the sidebar element
                this.sidebarElement.appendChild(button);
            });

            document.body.style.marginLeft = (offset_left + this.width + 1) + "px"; // the border adds a thickness if 2px (1, so borders overlap)
            document.body.appendChild(this.sidebarElement);
        });
    }
}
