document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('timeSeriesChart');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let scale = 1; // Starting scale
    let offsetX = 0; // Horizontal scroll offset
    // Example data, replace with your data as needed
    const data = [
        { timestamp: Date.parse('2023-01-01T00:00:00Z'), value: 10 },
        { timestamp: Date.parse('2023-01-02T00:00:00Z'), value: 15 },
        { timestamp: Date.parse('2023-01-03T00:00:00Z'), value: 8 },
        { timestamp: Date.parse('2023-01-04T00:00:00Z'), value: 12 },
        { timestamp: Date.parse('2023-01-05T00:00:00Z'), value: 17 },
        { timestamp: Date.parse('2023-01-06T00:00:00Z'), value: 6 },
        { timestamp: Date.parse('2023-01-07T00:00:00Z'), value: 11 }
    ];

    function formatDate(timestamp, scale) {
        const date = new Date(timestamp);
        if (scale > 1000000) { // Year level
            return `${date.getFullYear()}`;
        } else if (scale > 10000) { // Day level
            return `${date.getMonth() + 1}/${date.getDate()}`;
        } else { // Second level
            return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        }
    }

    function drawChart() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const now = new Date();
        
        // Draw axis lines
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 30);
        ctx.lineTo(canvas.width, canvas.height - 30);
        ctx.moveTo(30, 0);
        ctx.lineTo(30, canvas.height);
        ctx.stroke();

        // Draw data line
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        for (let i = 0; i < data.length; i++) {
            const x = ((data[i].timestamp - data[0].timestamp) / 1000000 * scale) - offsetX + 30;
            const y = canvas.height - data[i].value * 10 - 30;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Draw x-axis labels
        ctx.textAlign = 'center';
        let labelSpacing = 100 * scale; // Adjust label spacing based on scale
        for (let i = 0; i < canvas.width; i += labelSpacing) {
            const timestamp = data[0].timestamp + (i + offsetX) * 1000000 / scale;
            const label = formatDate(timestamp, scale);
            ctx.fillText(label, i + 30, canvas.height - 10);
        }

        // Draw 'Now' line
        const nowX = ((now.getTime() - data[0].timestamp) / 1000000 * scale) - offsetX + 30;
        if (nowX >= 30 && nowX <= canvas.width) {
            ctx.beginPath();
            ctx.strokeStyle = 'orange';
            ctx.moveTo(nowX, 0);
            ctx.lineTo(nowX, canvas.height - 30);
            ctx.stroke();
        }
    }

    // Zoom in/out functionality
    document.getElementById('zoomIn').addEventListener('click', function() {
        scale *= 2;
        drawChart();
    });

    document.getElementById('zoomOut').addEventListener('click', function() {
        scale = Math.max(1, scale / 2);
        drawChart();
    });

    // Scroll functionality
    let isDragging = false;
    let lastX = 0;

    function getXPosition(event) {
        if (event.touches && event.touches[0]) {
            return event.touches[0].clientX;
        } else {
            return event.clientX;
        }
    }

    function startScroll(event) {
        isDragging = true;
        lastX = getXPosition(event);
    }

    function doScroll(event) {
        if (isDragging) {
            const currentX = getXPosition(event);
            const deltaX = currentX - lastX;
            offsetX += deltaX;
            lastX = currentX;
            drawChart();
        }
    }

    function endScroll() {
        isDragging = false;
    }

    // Mouse events
    canvas.addEventListener('mousedown', startScroll);
    canvas.addEventListener('mousemove', doScroll);
    canvas.addEventListener('mouseup', endScroll);
    canvas.addEventListener('mouseleave', endScroll);

    // Touch events
    canvas.addEventListener('touchstart', startScroll);
    canvas.addEventListener('touchmove', doScroll);
    canvas.addEventListener('touchend', endScroll);

    // Update 'Now' line every second
    setInterval(drawChart, 1000);
    
    drawChart();
});