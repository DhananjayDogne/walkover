require('dotenv').config();

const fetch = require('node-fetch');
const { parse } = require('csv-parse/sync');
const nodemailer = require('nodemailer');

const SHEET_CSV_URL = process.env.SHEET_CSV_URL;

// Setup Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function fetchSheetData() {
    const response = await fetch(SHEET_CSV_URL);
    const csvText = await response.text();
    const records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
    });
    return records;
}
async function sendInvitation(name, email) {
    const mailOptions = {
        from: `"Your Name" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Invitation to our Event',
        text: `Hi ${name},\n\nYou are invited to our event! Please join us.\n\nBest regards,\nYour Team`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${email}`);
    } catch (err) {
        console.error(`❌ Failed to send email to ${email}:`, err.message);
    }
}


async function main() {
    try {
        const rows = await fetchSheetData();

        for (const row of rows) {
            const values = Object.values(row);
            const nameVal = values[0];
            const emailVal = values[1];


            console.log(`Parsed: ${nameVal} <${emailVal}>`);

            if (nameVal && emailVal) {
                await sendInvitation(nameVal, emailVal);
                console.log(`✅ Invitation sent to ${emailVal}`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message || error);
    }
}

main();
