require('jimp');

function textToBinary(text) {
    return text.split('').map(char => {
        return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join('');
}

function binaryToText(binaryStr) {
    return binaryStr.match(/.{1,8}/g).map(byte => {
        return String.fromCharCode(parseInt(byte, 2));
    }).join('');
}

const delimiter = '111111110000000011111111'; // TODO: let the user generate this

async function embedTextInImage(image, text) {
    const binaryMessage = textToBinary(text) + delimiter ;

    const totalPixels = image.bitmap.width * image.bitmap.height;
    if (binaryMessage.length > totalPixels * 3) {
        throw new Error('Text message is too long to encode in the given image.');
    }

    let binaryIndex = 0;
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        if (binaryIndex < binaryMessage.length) {
            this.bitmap.data[idx + 0] = (this.bitmap.data[idx + 0] & ~1) | parseInt(binaryMessage[binaryIndex++], 2);
        }
        if (binaryIndex < binaryMessage.length) {
            this.bitmap.data[idx + 1] = (this.bitmap.data[idx + 1] & ~1) | parseInt(binaryMessage[binaryIndex++], 2);
        }
        if (binaryIndex < binaryMessage.length) {
            this.bitmap.data[idx + 2] = (this.bitmap.data[idx + 2] & ~1) | parseInt(binaryMessage[binaryIndex++], 2);
        }
    });

    const buffer = await image.getBufferAsync('image/png');
    // return buffer.toString('base64');
    return buffer;
}

async function extractTextFromImage(image) {
    let binaryMessage = '';

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        binaryMessage += (this.bitmap.data[idx + 0] & 1).toString();
        binaryMessage += (this.bitmap.data[idx + 1] & 1).toString();
        binaryMessage += (this.bitmap.data[idx + 2] & 1).toString();
    });

    const delimiterIndex = binaryMessage.indexOf(delimiter);
    if (delimiterIndex === -1) {
        throw new Error('Delimiter not found, unable to extract message.');
    }

    const messageBinary = binaryMessage.substring(0, delimiterIndex);
    return binaryToText(messageBinary);
}

window.embedTextInImage = embedTextInImage;
window.extractTextFromImage = extractTextFromImage;