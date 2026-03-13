// Digital Optimus - Screen Capture Module
const screenshot = require('screenshot-desktop');
const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

class ScreenCapture {
  constructor(opts = {}) {
    this.interval = opts.interval || 5000;
    this.buffer = [];
    this.bufferSize = opts.bufferSize || 5;
    this.capturing = false;
    this.outputDir = opts.outputDir || path.join(__dirname, '../temp');
    if (!fs.existsSync(this.outputDir)) fs.mkdirSync(this.outputDir, { recursive: true });
  }

  async takeScreenshot() {
    try {
      const img = await screenshot({ format: 'png' });
      const resized = await sharp(img).resize(1280, 720, { fit: 'inside' }).png().toBuffer();
      const hash = crypto.createHash('sha256').update(resized).digest('hex');
      const ts = Date.now();
      const fp = path.join(this.outputDir, `screen_${ts}.png`);
      await sharp(resized).toFile(fp);
      const entry = { timestamp: ts, hash, filepath: fp, base64: resized.toString('base64') };
      this.buffer.push(entry);
      if (this.buffer.length > this.bufferSize) this.buffer.shift();
      return entry;
    } catch (e) { console.error('Capture error:', e.message); return null; }
  }

  startContinuous(cb) {
    this.capturing = true;
    this._loop = setInterval(async () => {
      if (!this.capturing) return;
      const e = await this.takeScreenshot();
      if (e && cb) cb(e);
    }, this.interval);
  }

  stopContinuous() { this.capturing = false; if (this._loop) clearInterval(this._loop); }
  getBuffer() { return this.buffer; }
  getLast() { return this.buffer[this.buffer.length - 1] || null; }
}

module.exports = { ScreenCapture };
