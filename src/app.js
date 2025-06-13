import Plotly from 'plotly.js-dist-min'

const canvas = document.getElementById('canvas');
const sliderInput = document.getElementById('slider');
const sliderPlot = document.getElementById('plot');
const imageInput = document.getElementById('inputImage');
const context = canvas.getContext('2d');

let sliderValue;
let functionValues;
let originalImageData = null;


// use sigmoid functions to create s curves
function directSigmoid(x, k) {
    return 1 / (1 + Math.exp((k / 10000000) * (-x + 127.5))) * 255;
}


function inverseSigmoid(x, k) {
    return 1 / (1 + Math.exp((100 / k) * (-x + 127.5))) * 255;
}


function normalize(x, k, func) {
    return ((func(x, k) - func(0, k)) / (func(255, k) - func(0, k))) * 256;
}


function interpolateValues() {

    const keys = Array.from(functionValues.keys());

    const interpolatedValues = new Map();

    for (let x = 0; x <= 255; x++) {

        if (x <= keys[0]) {
            interpolatedValues.set(x, functionValues.get(keys[0]))
        }

        if (x >= keys[keys.length - 2]) {
            interpolatedValues.set(x, functionValues.get(keys[keys.length - 2]));
        }

        for (let i = 0; i < keys.length - 1; i++) {
            const lowerX = keys[i];
            const upperX = keys[i + 1];

            if (x >= lowerX && x <= upperX) {
                const lowerValue = functionValues.get(lowerX);
                const upperValue = functionValues.get(upperX);

                interpolatedValues.set(x, lowerValue + (upperValue - lowerValue) * (x - lowerX) / (upperX - lowerX));
            }
        }
    }

    functionValues = interpolatedValues;
}


function calculateValues() {

    functionValues = new Map();

    const k = Math.pow(1.5, sliderValue)

    for (let i = 0; i <= 255; i++) {

        if (sliderValue >= 24) {
            const x = normalize(i, k, directSigmoid);
            functionValues.set(Math.round(x), i)
        } else {
            const y = normalize(i, k, inverseSigmoid);
            functionValues.set(i, Math.round(y));
        }
    }
}


function plotValues() {

    calculateValues()

    if (functionValues.length !== 256) {
        interpolateValues();
    }

    Plotly.newPlot(sliderPlot, [
        {
            x: Array.from(functionValues.keys()),
            y: Array.from(functionValues.values()),
            mode: 'lines',
            line: { color: 'black', width: 5 }
        },
    ], {
        xaxis: { range: [-10, 260] },
        yaxis: { range: [-10, 260] },
        width: 750,
        height: 750,
        displayModeBar: false
    });
}


function processImage() {
    if (!originalImageData) {
        return;
    }

    const imageData = context.createImageData(originalImageData.width, originalImageData.height);
    const data = imageData.data;
    const originalData = originalImageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = originalData[i];
        const g = originalData[i + 1];
        const b = originalData[i + 2];
        const a = originalData[i + 3];

        data[i]     = functionValues.get(r);
        data[i + 1] = functionValues.get(g);
        data[i + 2] = functionValues.get(b);
        data[i + 3] = a;

    }

    context.putImageData(imageData, 0, 0);
}


sliderInput.addEventListener('input', () => {
    sliderValue = parseFloat(sliderInput.value);
    plotValues();
    processImage();
});


imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const image = new Image();

    image.onload = () => {
        const maxWidth = window.innerWidth;
        let scale = 1;

        if (image.width > maxWidth) {
            scale = maxWidth / image.width;
        }

        canvas.width = image.width * scale;
        canvas.height = image.height * scale;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        originalImageData = context.getImageData(0, 0, canvas.width, canvas.height);

        processImage();
    };

    image.src = URL.createObjectURL(file);
});


sliderValue = parseFloat(sliderInput.value);
plotValues();

