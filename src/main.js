// Application entry point: assemble the UI, scene, and a single session controller.
import './styles/base.css';
import './styles/game.css';
import './styles/management.css';
import './styles/menu.css';
import { startApplication } from './session.js';

startApplication(document.querySelector('#app'));
