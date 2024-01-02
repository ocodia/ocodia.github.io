document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('timeSeriesChart');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let zoomLevel = 0; // Zoom levels: 0 (years) to 5 (seconds)
    let offsetX = 0; // Horizontal scroll offset
    const data = [
        { timestamp: Date.parse('2023-01-01T00:00:00Z'), value: 10 },
        { timestamp: Date.parse('2023-01-02T00:00:00Z'), value: 15 },
        { timestamp: Date.parse('2023-01-03T00:00:00Z'), value: 8 },
        { timestamp: Date.parse('2023-01-04T00:00:00Z'), value: 12 },
        { timestamp: Date.parse('2023-01-05T00:00:00Z'), value: 17 }
    ];

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        switch (zoomLevel) {
            case 0: return `${date.getFullYear()}`;
            case 1: return `${date.getFullYear()}-${date.getMonth() + 1}`;
            case 2: return `${date.getMonth() + 1}/${date.getDate()}`;
            case 3: return `${date.getHours()}:00`;
            case 4: return `${date.getHours()}:${date.getMinutes()}`;
            case 5: return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
            default: return `${date.getMonth() + 1}/${date.getDate()}`;
        }
    }

    function getScaleFactor() {
        switch (zoomLevel) {
            case 0: return 31536000000; // Year
            case 1: return 2592000000;  // Month
            case 2: return 86400000;    // Day
            case 3: return 3600000;     // Hour
            case 4: return 60000;       // Minute
            case 5: return 1000;        // Second
            default: return 86400000;
        }
    }

    function drawChart() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const scaleFactor = getScaleFactor();
        
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
            const x = ((data[i].timestamp - data[0].timestamp) / scaleFactor * scale) - offsetX + 30;
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
        let labelSpacing = 100 * scaleFactor; // Adjust label spacing based on scale
        for (let i = 0; i < canvas.width; i += labelSpacing) {
            const timestamp = data[0].timestamp + (i + offsetX) * scaleFactor;
            const label = formatDate(timestamp);
            ctx.fillText(label, i + 30, canvas.height - 10);
        }

        // Draw 'Now' line
        drawNowLine();
    }

    function drawNowLine() {
        const now = new Date();
        const scaleFactor = getScaleFactor();
        const nowX = ((now.getTime() - data[0].timestamp) / scaleFactor) - offsetX + 30;
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
        zoomLevel = Math.min(zoomLevel + 1, 5); // Limit zoom in
        drawChart();
    });

    document.getElementById('zoomOut').addEventListener('click', function() {
        zoomLevel = Math.max(zoomLevel - 1, 0); // Limit zoom out
        drawChart();
    });

    // Scroll functionality
    let isDragging    = false;
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
    setInterval(drawNowLine, 1000);
    
    drawChart();
});