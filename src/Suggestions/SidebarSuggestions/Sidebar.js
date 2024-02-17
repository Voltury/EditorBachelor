import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import './theme/Sidebar.css';

export default class SidebarSuggestion extends Plugin {
    static get pluginName() {
        return 'SidebarSuggestion';
    }

    init() {
        console.log('SidebarPlugin#init() got called');

        this.width = 200;

        // Create sidebar UI
        this.sidebarElement = document.createElement('div');
        this.sidebarElement.textContent = 'This is the sidebar';
        this.sidebarElement.className = 'sidebar';
        this.sidebarElement.style.width = this.width + 'px';

        let currentMargin = parseFloat(document.body.style.marginRight);
        if (isNaN(currentMargin)) {
            currentMargin = 0;
        }

        document.body.style.marginRight = (currentMargin + this.width) + "px";
        document.body.appendChild(this.sidebarElement);
    }
}
