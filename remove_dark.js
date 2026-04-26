const fs = require('fs');

const files = [
    'C:\\Users\\Merry\\Desktop\\nexus-bcc\\front-nexus\\src\\components\\pages\\admin\\AcademicCalendar.jsx',
    'C:\\Users\\Merry\\Desktop\\nexus-bcc\\front-nexus\\src\\components\\pages\\admin\\TimetableBuilder.jsx',
    'C:\\Users\\Merry\\Desktop\\nexus-bcc\\front-nexus\\src\\components\\pages\\admin\\SubjectSections.jsx'
];

for (let file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let newContent = content.replace(/\s*dark:[\w\-:/\[\]\.]+/g, '');
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`File not found: ${file}`);
        
    }
}
