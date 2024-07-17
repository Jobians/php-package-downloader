const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const { sanitizeComposerJson, isValidComposerJson } = require('./composerValidation');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_DIR = path.resolve(__dirname, '..');
const EXPIRATION_TIME = 60000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(BASE_DIR, 'public')));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  const roomId = uuidv4();
  socket.join(roomId);

  socket.on('download', (composerJson) => {
    const validationError = isValidComposerJson(composerJson);
    if (validationError) {
      return io.to(roomId).emit('error', validationError);
    }

    const tempDir = path.join(BASE_DIR, 'temp', roomId);
    const zipFilePath = path.join(BASE_DIR, 'packages', `${roomId}.zip`);

    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'composer.json'), composerJson);

    const composerProcess = exec(`COMPOSER_ALLOW_SUPERUSER=1 composer install`, { cwd: tempDir });

    composerProcess.stdout.on('data', (data) => {
      io.to(roomId).emit('log', data);
    });

    composerProcess.stderr.on('data', (data) => {
      io.to(roomId).emit('log', data);
    });

    composerProcess.on('close', (code) => {
      if (code !== 0) {
        return io.to(roomId).emit('error', 'Failed to download packages');
      }

      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip');

      output.on('close', () => {
        io.to(roomId).emit('done', { EXPIRATION_TIME, zipPath: `/download/${roomId}` });
        fs.rmdirSync(tempDir, { recursive: true });

        // Schedule expiration
        setTimeout(() => {
          fs.access(zipFilePath, fs.constants.F_OK, (err) => {
            if (err) {
              return;
            }
            
            fs.unlink(zipFilePath, (err) => {
              if (err) {
                console.error(`Error deleting zip: ${err}`);
              }
            });
          });
        }, EXPIRATION_TIME);
      });

      archive.on('error', (err) => {
        console.error(`Error creating zip: ${err}`);
        io.to(roomId).emit('error', 'Failed to create zip file');
      });

      archive.pipe(output);
      archive.directory(tempDir, false);
      archive.finalize();
    });
  });

  // Endpoint to handle zip file downloads
  app.get('/download/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    const zipFilePath = path.join(BASE_DIR, 'packages', `${roomId}.zip`);

    fs.access(zipFilePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send('File not found or has expired');
      }
      res.download(zipFilePath, (err) => {
        if (err) {
          console.error(`Error sending file: ${err}`);
        } else {
          // Delete file after download
          fs.unlink(zipFilePath, (err) => {
            if (err) console.error(`Error deleting file after download: ${err}`);
          });
        }
      });
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});