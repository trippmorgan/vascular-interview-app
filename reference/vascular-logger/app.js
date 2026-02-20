const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to handle the form submission
app.post('/log-procedure', (req, res) => {
    const procedureData = req.body;
    
    // For now, we just log it to the console.
    // In a real app, you would save this to a database or a CSV file.
    console.log('Received procedure data:', procedureData);

    res.status(200).json({ status: 'success', message: 'Data logged successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log('Open this URL in your browser.');
});