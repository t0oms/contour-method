const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;


const range = 55;


function graph(x, z) {
    return (1 / (Math.sqrt(x*x + z*z) + 1)) * Math.sin(Math.sqrt(x*x + z*z)) * 30
}


function project(x, y, z) {
    const scale3d = 10;
    const px = width / 2 + (x - z) * scale3d;
    const py = height / 2 - y * scale3d + (x + z) * scale3d * 0.5;
    return { x: px, y: py };
}


function draw() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = 'black';
    context.lineWidth = 1;

    const upperHorizon = new Array(width).fill(-1000000000);
    const lowerHorizon = new Array(width).fill(1000000000);

    for (let z = range; z >= -range; z -= 0.2) {

        let lastPoint = null;

        context.beginPath();

        for (let x = range; x >= -range; x -= 0.05) {

            const y = graph(x, z);
            const point = project(x, y, z);

            const px = Math.round(point.x);
            const py = point.y;

            if (px >= 0 && px < width) {
                if (py < lowerHorizon[px] || py > upperHorizon[px]) {

                    upperHorizon[px] = Math.max(py, upperHorizon[px]);
                    lowerHorizon[px] = Math.min(py, lowerHorizon[px]);

                    if (lastPoint) {
                        context.moveTo(lastPoint.x, lastPoint.y);
                        context.lineTo(point.x, point.y);
                    }

                    lastPoint = point;
                } else {
                    lastPoint = point;
                    lastPoint.y = lowerHorizon[px];
                }
            }
        }

        context.stroke();
    }
}

document.getElementById('plotButton').addEventListener('click', () => {
    const input = document.getElementById('functionInput').value.trim();
    if (!input) {
        return;
    }

    try {
        graph = new Function('x', 'z', `return ${input};`);
        draw();
    } catch (e) {
        alert('Invalid function: ' + e.message);
    }
});

draw();
