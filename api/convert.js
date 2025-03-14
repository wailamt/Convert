const CryptoJS = require('crypto-js');
const express = require('express');
const app = express();

app.use(express.json());

const encryptionKey = 'DSFG@Dah$ing'; // 加密密钥

// 加密函数
function encryptData(data, key) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
}

// 解密函数
function decryptData(encryptedData, key) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

app.post('/api/convert', async (req, res) => {
    try {
        // 解密数据
        const decryptedData = decryptData(req.body.data, encryptionKey);

        // 调用 DeepSeek API
        const response = await fetch('https://api.deepseek.com/v1/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({ message: decryptedData.message })
        });

        const data = await response.json();

        // 加密响应数据
        const encryptedResponse = encryptData(data, encryptionKey);

        // 返回加密后的数据
        res.status(200).json({ data: encryptedResponse });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;