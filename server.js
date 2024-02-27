const express = require('express');
const session = require('express-session'); // For managing sessions
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const pythonScriptPath = path.join(__dirname, 'python', 'recognize_image.py');
const app = express();
const cluster = require('cluster');
const os = require('os');
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const Recipe = require('./menu/recipeBrowse/recipe');

const diaryRoutes = require('./menu/diaryBrowse/diaryRoutes');
const recipeRoutes = require('./menu/recipeBrowse/recipeRoutes');
const favoritesRoutes = require('./menu/recipeFavorites/favoritesRoutes');
const PORT = process.env.PORT || 80;
const HOST = '140.116.245.86'; // 固定 IP 地址

const API_KEY = "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";

const OpenAI = require("openai");
const openai = new OpenAI({
    apiKey: API_KEY,
});

const csvFilePath = './views/users.csv';
const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: [
        { id: 'USERNAME', title: 'USERNAME' },
        { id: 'PASSWORD', title: 'PASSWORD' }
    ]
});

const jwt = require('jsonwebtoken');
const secretKey = 'ncku';

// Set up session management
app.use(session({
    secret: 'ncku', // Change this to a strong secret
    resave: false,
    saveUninitialized: true,
}));
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.json());  // Use body-parser to parse JSON request bodies

async function getUsersFromCSV() {
    return new Promise((resolve, reject) => {
        const users = [];
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (data) => users.push(data))
            .on('end', () => {
                resolve(users);
            })
            .on('error', reject);
    });
}

// Middleware to check if user is logged in
function checkLoggedIn(req, res, next) {
    if (req.session.user) {
        // User is logged in
        next();
    } else {
        // User is not logged in, redirect to login page
        res.redirect('/login');
    }
}

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Serve login page
app.get('/login.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.js'), {
        headers: {
            'Content-Type': 'application/javascript'
        }
    });
});

// Handle login POST request
app.post('/login', async (req, res) => {
    const { userID, user_password } = req.body;
    console.log('Input username:', userID);
    console.log('Input password:', user_password);

    try {
        const users = await getUsersFromCSV();
        const user = users.find(u => u.USERNAME === userID);

        if (user && user.PASSWORD === user_password) {
            const token = jwt.sign({ username: userID }, secretKey, { expiresIn: '1h' });
            res.status(200).json({ success: true, token });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error reading users from CSV:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Handle login POST request
app.post('/register', async (req, res) => {
    const { registerUsername, registerPassword } = req.body;
    console.log('R username:', registerUsername);
    console.log('R password:', registerPassword);

    try {
        const users = await getUsersFromCSV();
        const userExists = users.some(user => user.USERNAME === registerUsername);

        if (userExists) {
            return res.status(400).json({ message: 'Username already registered' });
        }

        users.push({ USERNAME: registerUsername, PASSWORD: registerPassword });
        await csvWriter.writeRecords(users); // 写入 CSV 文件

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error updating CSV file:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Use the checkLoggedIn middleware to protect the main page
app.get('/', checkLoggedIn, (req, res) => {
    // Render the main page here
    // Your existing code for the main page goes here
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Set up storage engine with multer
const storage = multer.diskStorage({
    destination: './uploaded_images/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 30 * 1024 * 1024 }, // Limit file size to 1MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('photo');

function checkFileType(file, cb) {
    // Allowed file types
    const filetypes = /jpeg|jpg|png|heic/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
    // return cb(null, true);
}


// 连接到 MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/Diary'
).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("Error connecting to MongoDB", err);
});

app.use('', recipeRoutes);
app.use('', diaryRoutes);
app.use('', favoritesRoutes);

app.use('/uploads', express.static('uploads'));
app.use('', express.static(__dirname));  // Serve static files from the current directory


// Handle image upload
app.post('/api/save-image', (req, res) => {
    // console.log(req.files); // Log any files in the request
    upload(req, res, (err) => {
        if (err) {
            console.error("Server Error:", err);  // Log the error
            res.status(400).json({ success: false, message: err });
        } else {
            if (req.file == undefined) {
                res.status(400).json({ success: false, message: 'No file selected' });
            } else {
                res.json({ success: true, message: 'Image uploaded successfully' });
            }
        }
    });
});


// Handle image recognition
app.post('/api/recognize', (req, res) => {
    // Handle the file upload
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err });
        }
        if (req.file == undefined) {
            return res.status(400).json({ success: false, message: 'No file selected' });
        }

        // Define variables for language and image path
        const language = req.headers['current-language'];
        const languageFlag = language === 'en' ? 0 : 1;
        const imagePath = req.file.path;

        // Execute the Python script for image recognition
        exec(`python ${pythonScriptPath} ${imagePath} ${languageFlag}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).json({ success: false, message: 'Recognition failed.' });
            }

            // Parse and send the response
            try {
                const recognitionResult = JSON.parse(stdout);
                const formattedResult = recognitionResult.messages.join('<br>');
                const ingredient = recognitionResult.result;

                res.json({ success: true, result: formattedResult, ingredient: ingredient });
            } catch (parseError) {
                console.error(`Error parsing JSON: ${parseError}`);
                return res.status(500).json({ success: false, message: 'Error parsing recognition results.' });
            }

        });
    });
});


// Handle generate recipe
app.get('/api/generate-recipe', async (req, res) => {
    const ingredient = req.query.ingredient;
    const language = req.query.language;
    console.log(`Ingredient: ${ingredient}`);

    try {
        const response = await openai.chat.completions.create({
            max_tokens: 500,
            temperature: 0.5,
            top_p: 0.9,
            n: 1,
            model: "gpt-4", // Make sure this model is available
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user", content: `Provide a recipe in ${language} that uses ${ingredient} as the main ingredient. First list the ingredients needed, then describe the steps clearly. 
                如果 是英文，格式以"Recipe: Ingredients: Steps:"。如果是中文，格式以"食譜: 食材: 步驟:"` }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(response); // Log the entire response

        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            const recipe = response.choices[0].message.content.trim();
            console.log(recipe);
            res.json({ success: true, recipe: recipe });
        } else {
            throw new Error("Unexpected response structure from OpenAI API.");
        }
    } catch (apiError) {
        console.error(`OpenAI API error: ${apiError}`);
        if (apiError.response && apiError.response.status === 429) {
            res.status(429).json({ success: false, message: 'Rate limit exceeded. Please try again later.' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to fetch recipe.' });
        }
    }
});


// Handle save recipe
app.post('/api/save-recipe', async (req, res) => {
    try {
        // Extract and verify token
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, secretKey);
        const userId = decoded.username;
        const { recipeName, material, procedure } = req.body;

        // Check if a recipe with the same name already exists
        const existingRecipe = await Recipe.findOne({ recipeName: recipeName });
        if (existingRecipe) {
            return res.status(400).json({ message: 'Recipe with this name already exists' });
        }

        // Create a new recipe instance
        const newRecipe = new Recipe({
            userId: userId,
            favorite: [userId],
            recipeName: recipeName,
            material: material,
            procedure: procedure,
            createdAt: new Date()
        });

        // Save the recipe to the database
        await newRecipe.save();

        res.status(201).json({ message: 'Recipe saved successfully', recipe: newRecipe });
    } catch (error) {
        console.error('Error saving recipe:', error);
        res.status(500).send('Error saving recipe');
    }
});


// Handle generate image
app.get('/api/generate-image', async (req, res) => {
    const description = req.query.description;

    // Check if description is provided
    if (!description) {
        return res.status(400).json({ message: 'Description is required' });
    }

    try {
        // Request to generate image
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: "給我料理成果圖，背景黑色，只要成品，不要有文字。" + description,
            n: 1,
            size: "1024x1024",
        });
        console.log("Response Object:", response);
        console.log("Response Data:", response.data);

        const imageUrl = response.data[0].url;
        console.log("Response imageUrl:", imageUrl);

        // Sending the image URL in the response
        res.json({ imageUrl: imageUrl });
    } catch (error) {
        console.error(`Error generating image: ${error.message}`);
        res.status(500).json({ message: 'Error generating image' });
    }
});


// Multi-processing
if (cluster.isMaster) {
    // Fork workers for each CPU core
    for (let i = 0; i < os.cpus().length; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.id} died. Spawning a new one.`);
        cluster.fork();
    });
} else {
    // Your existing server code goes here
    app.listen(PORT, HOST, () => {
        console.log(`Server is running on http://${HOST}:${PORT}`);
    });
}

module.exports = app;