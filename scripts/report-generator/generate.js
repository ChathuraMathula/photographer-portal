const fs = require('fs');
const path = require('path');

// Execute md-to-docx using the child_process module
const { execSync } = require('child_process');

async function generateReport() {
    try {
        console.log('Combining markdown files...');
        const md1 = fs.readFileSync(path.join(__dirname, 'report.md'), 'utf-8');
        const md2 = fs.readFileSync(path.join(__dirname, 'report2.md'), 'utf-8');
        const md3 = fs.readFileSync(path.join(__dirname, 'report3.md'), 'utf-8');
        const md4 = fs.readFileSync(path.join(__dirname, 'report4.md'), 'utf-8');

        const combinedMarkdown = md1 + '\n\n' + md2 + '\n\n' + md3 + '\n\n' + md4;
        
        const combinedPath = path.join(__dirname, 'combined_report.md');
        fs.writeFileSync(combinedPath, combinedMarkdown);

        console.log('Generating DOCX file using md-to-docx...');
        
        // Outputting to _Final to bypass the file lock if V2 is open in MS Word
        const outputPath = path.join(__dirname, '..', '..', 'Dissertation_Photographer_Portal_Final.docx');
        
        // Use npx md-to-docx to convert the combined markdown
        execSync(`npx md-to-docx combined_report.md "${outputPath}"`, { stdio: 'inherit' });

        console.log(`Successfully generated DOCX report at: ${outputPath}`);
    } catch (error) {
        console.error('Error generating report:', error);
    }
}

generateReport();
