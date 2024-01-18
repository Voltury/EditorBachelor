import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import './theme/sidebar.css';

export default class SidebarSuggestion extends Plugin {
    constructor(editor) {
        super(editor);
        this.isEnabled = false;
        this.sidebarElement = null;
        this.width = 200;
    }

    static get pluginName() {
        return 'SidebarSuggestion';
    }

    init() {
        console.log('SidebarPlugin#init() got called');

        // Create sidebar UI
        this.sidebarElement = document.createElement('div');
        this.sidebarElement.textContent = 'This is the sidebar';
        this.sidebarElement.className = 'sidebar';
        this.sidebarElement.style.width = this.width + 'px';
    }

    enablePlugin() {
        if(this.isEnabled) return;

        let currentMargin = parseFloat(document.body.style.marginRight);
        if (isNaN(currentMargin)) {
            currentMargin = 0;
        }
        document.body.style.marginRight = (currentMargin + this.width) + "px";

        document.body.appendChild(this.sidebarElement);
        this.isEnabled = true;
    }

    disablePlugin() {
        if(!this.isEnabled) return;

        let currentMargin = parseFloat(document.body.style.marginRight);
        if (isNaN(currentMargin)) {
            currentMargin = 0;
        }
        document.body.style.marginRight = (currentMargin - this.width) + "px";

        this.sidebarElement.parentNode.removeChild(this.sidebarElement);
        this.isEnabled = false;
    }
}
