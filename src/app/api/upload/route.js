import { NextResponse } from "next/server";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

//Extract emails

function extractEmail(data) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    let emails = [];

    data.forEach((row) => {
        Object.values(row).forEach((value) => {
            if (typeof value === 'string' && emailRegex.test(value.trim())) {
                emails.push(value.trim())
            }
        })
    });

    return emails;
}

//Handle files

export async function POST(request) {

    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({
                success: false,
                message: "No file uploaded"
            },
                {
                    status: 400
                })
        }

        const buffer = Buffer.from(await file.buffer());
        let emails = [];

        if (file.name.endsWith('.csv')) {
            const csvtext = buffer.toString();
            const result = Papa.parse(csvtext, { header: true });
            emails = extractEmail(result.data)
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const spreadsheet = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = spreadsheet.SheetNames[0];
            const sheet = XLSX.utils.sheet_to_json(spreadsheet.Sheets[sheetName]);
            emails = extractEmail(sheet);
        } else {
            return NextResponse.json({
                success: false,
                message: "Invalid file type, please upload a CSV or Excel file"
            },
                {
                    status: 400
                })
        }

        emails = [...new Set(emails)];

        return NextResponse.json({
            success: true,
            message: "Emails extracted successfully"
        },
            {
                status: 200
            })
    } catch (error) {
        console.error("Error occurred:", error.message);
        return NextResponse.json({
            success: false,
            message: error.message
        },
            {
                status: 500
            })
    }
}