import { BasicApp } from './app/basic-app';
import './styles/scss/main.scss';
import { MyScene } from './app/my-scene';

const canvas = document.querySelector<HTMLCanvasElement>('.main__canvas');

let currentApp: BasicApp = new MyScene(canvas);
currentApp.run();

document.getElementById('demo-picker').addEventListener('change', async d => {
    const selection: string = (<HTMLSelectElement>d.target).value;

    if (selection.localeCompare('my-scene') === 0) {
        await currentApp.stop();
        currentApp = new MyScene(canvas);
        currentApp.run();
        return;
    }

});