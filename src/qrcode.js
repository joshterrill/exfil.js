const QRCode = require('qrcode');

function splitText(text, chunkSize) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
}

async function generateQRCodes(text) {
    let chunks = splitText(text, 500);
    let qrCodes = [];
    for (let i = 0; i < chunks.length; i++) {
        let qrCode = await QRCode.toCanvas(chunks[i], {scale: 10, errorCorrectionLevel: 'H'});
        qrCodes.push(qrCode);
    }
    return qrCodes;
}

window.generateQRCodes = generateQRCodes;