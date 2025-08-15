const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

const jsonPath = path.join(__dirname, '../src/data/articles.json');
const upload = multer({ dest: 'uploads/' });

// ========== Helper Functions ==========
function readArticles() {
  if (!fs.existsSync(jsonPath)) {
    fs.writeFileSync(jsonPath, JSON.stringify({ articles: [] }, null, 2));
    return { articles: [] };
  }

  try {
    const rawData = fs.readFileSync(jsonPath);
    return JSON.parse(rawData);
  } catch (err) {
    console.error('Failed to parse articles JSON:', err);
    return { articles: [] };
  }
}

function writeArticles(data) {
  try {
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Failed to write articles JSON:', err);
    return false;
  }
}

// ========== File Upload Endpoint ==========
app.post('/api/upload-file', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const destination = req.body.destination || 'blog';
    const uploadDir = path.join(__dirname, `../src/assets/${destination}`);
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const finalPath = path.join(uploadDir, req.file.originalname);
    fs.renameSync(req.file.path, finalPath);

    res.json({ 
      status: 'success',
      path: `/assets/${destination}/${req.file.originalname}`
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// ========== Article CRUD Endpoints ==========
app.get('/api/articles', (req, res) => {
  try {
    const data = readArticles();
    res.json(data.articles);
  } catch (err) {
    console.error('Error reading articles:', err);
    res.status(500).json({ error: 'Failed to read articles' });
  }
});

app.get('/api/articles/:id', (req, res) => {
  try {
    const data = readArticles();
    const article = data.articles.find(a => a.id === req.params.id);

    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ error: 'Article not found' });
    }
  } catch (err) {
    console.error('Error finding article:', err);
    res.status(500).json({ error: 'Failed to find article' });
  }
});

app.post('/api/articles', (req, res) => {
  try {
    const data = readArticles();

    if (!req.body.title || !req.body.content) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'content']
      });
    }

    const newArticle = {
      ...req.body,
      id: req.body.id || Date.now().toString(),
      date: req.body.date || new Date().toISOString(),
      excerpt: req.body.excerpt || '',
      author: req.body.author || {
        name: 'Unknown',
        role: 'Writer',
        avatar: ''
      },
      readTime: req.body.readTime || '5 min',
      category: req.body.category || 'general',
      image: req.body.image || '',
      relatedArticles: req.body.relatedArticles || []
    };

    data.articles.push(newArticle);
    const success = writeArticles(data);

    if (success) {
      res.json({
        status: 'success',
        article: newArticle
      });
    } else {
      res.status(500).json({ error: 'Failed to save article' });
    }
  } catch (err) {
    console.error('Unexpected error in POST handler:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
});

app.put('/api/articles/:id', (req, res) => {
  try {
    const data = readArticles();
    const index = data.articles.findIndex(a => a.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const updatedArticle = {
      ...data.articles[index],
      ...req.body,
      id: data.articles[index].id
    };

    data.articles[index] = updatedArticle;
    const success = writeArticles(data);

    if (success) {
      res.json({ status: 'success', article: updatedArticle });
    } else {
      res.status(500).json({ error: 'Failed to update article' });
    }
  } catch (err) {
    console.error('Error updating article:', err);
    res.status(500).json({ error: 'Failed to update article', details: err.message });
  }
});

app.delete('/api/articles/:id', (req, res) => {
  try {
    const data = readArticles();
    const initialLength = data.articles.length;
    data.articles = data.articles.filter(a => a.id !== req.params.id);

    if (data.articles.length === initialLength) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const success = writeArticles(data);

    if (success) {
      res.json({ status: 'success' });
    } else {
      res.status(500).json({ error: 'Failed to delete article' });
    }
  } catch (err) {
    console.error('Error deleting article:', err);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// ========== Server Initialization ==========
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`- GET    /api/articles`);
  console.log(`- GET    /api/articles/:id`);
  console.log(`- POST   /api/articles`);
  console.log(`- PUT    /api/articles/:id`);
  console.log(`- DELETE /api/articles/:id`);
  console.log(`- POST   /api/upload-file`);
});