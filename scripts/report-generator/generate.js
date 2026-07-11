const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const htmlToDocx = require('html-to-docx');

async function generateReport() {
    try {
        console.log('Reading markdown file...');
        const mdPath = path.join(__dirname, 'report.md');
        const markdownContent = fs.readFileSync(mdPath, 'utf-8');

        console.log('Converting markdown to HTML...');
        // Convert markdown to HTML
        const htmlContent = marked.parse(markdownContent);

        // Wrap the HTML with basic styles required by the guidelines
        const htmlWithStyles = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: "Times New Roman", Times, serif;
                        font-size: 12pt;
                        line-height: 1.5;
                    }
                    h1 {
                        font-size: 24pt;
                        font-weight: bold;
                        page-break-before: always;
                    }
                    h2 {
                        font-size: 16pt;
                        font-weight: bold;
                        margin-top: 20px;
                    }
                    h3, h4 {
                        font-size: 14pt;
                        font-weight: bold;
                        margin-top: 15px;
                    }
                    p {
                        margin-bottom: 12px;
                        text-align: justify;
                    }
                    li {
                        margin-bottom: 8px;
                    }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `;

        console.log('Generating DOCX file...');
        
        // Define margins (Left: 37mm, Top/Bottom/Right: 25mm)
        // Values in twips (1 inch = 1440 twips). 
        // 37mm ≈ 1.45 inches ≈ 2098 twips
        // 25mm ≈ 0.98 inches ≈ 1417 twips
        const fileBuffer = await htmlToDocx(htmlWithStyles, null, {
            table: { row: { cantSplit: true } },
            footer: true,
            pageNumber: true,
            margins: {
                top: 1417,
                right: 1417,
                bottom: 1417,
                left: 2098,
            }
        });

        const outputPath = path.join(__dirname, '..', '..', 'Dissertation_Photographer_Portal.docx');
        fs.writeFileSync(outputPath, fileBuffer);

        console.log(`Successfully generated DOCX report at: ${outputPath}`);
    } catch (error) {
        console.error('Error generating report:', error);
    }
}

generateReport();
