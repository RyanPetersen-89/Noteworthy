const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Helper function to read data from db.json
const readFromFile = (filePath) =>
  new Promise((resolve, reject) =>
    fs.readFile(filePath, 'utf8', (err, data) => (err ? reject(err) : resolve(data)))
  );

// Helper function to write data to db.json
const writeToFile = (filePath, content) =>
  new Promise((resolve, reject) =>
    fs.writeFile(filePath, JSON.stringify(content, null, 4), (err) =>
      err ? reject(err) : resolve()
    )
  );

// GET /api/notes should read the db.json file and return all saved notes as JSON.
router.get('/', async (req, res) => {
  try {
    const data = await readFromFile(path.join(__dirname, '../db/db.json'));
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read notes data.' });
  }
});

// POST /api/notes should receive a new note to save on the request body, add it to the db.json file, and then return the new note to the client.
router.post('/', async (req, res) => {
  try {
    const { title, text } = req.body;
    const newNote = { id: uuidv4(), title, text };
    const data = await readFromFile(path.join(__dirname, '../db/db.json'));
    const notes = JSON.parse(data);
    notes.push(newNote);
    await writeToFile(path.join(__dirname, '../db/db.json'), notes);
    res.json(newNote);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save note.' });
  }
});

// DELETE /api/notes/:id should receive a query parameter that contains the id of a note to delete.
router.delete('/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const data = await readFromFile(path.join(__dirname, '../db/db.json'));
    const notes = JSON.parse(data);
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    await writeToFile(path.join(__dirname, '../db/db.json'), updatedNotes);
    res.json({ message: 'Note deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note.' });
  }
});

module.exports = router;
