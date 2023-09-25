const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use('', express.static(__dirname));

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

app.listen(PORT, () => { console.log(`Server listening on port ${PORT}`); });
module.exports = app