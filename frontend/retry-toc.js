const fs = require('fs');

const futurePath = 'c:/Users/PC/Desktop/IGV/igv site/igv-website-complete/frontend/src/pages/FutureCommerce.js';
let content = fs.readFileSync(futurePath, 'utf8');

// The component we want to insert
const tocComponent = `
      {/* Table of Contents */}
      <nav className="sticky top-20 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="#israel" className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium">
              Pourquoi Israël
            </a>
            <a href="#realities" className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium">
              3 Réalités
            </a>
            <a href="#what-we-do" className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium">
              Ce que nous faisons
            </a>
            <a href="#why-series" className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium">
              Pourquoi les franchises
            </a>
          </div>
        </div>
      </nav>
`;

// Check if TOC is already there
if (content.includes('Table of Contents')) {
    console.log('⚠️ Table of Contents already present.');
} else {
    // Try to find the junction point more loosely
    // We know the Israel section starts with "{/* Israel Section */}"
    // And before it, there is likely a </section> and some whitespace.

    if (content.includes('{/* Israel Section */}')) {
        content = content.replace('{/* Israel Section */}', `${tocComponent}\n      {/* Israel Section */}`);
        console.log('✅ Inserted Table of Contents before Israel Section');

        // Also ensure IDs are added if they failed before
        if (!content.includes('id="israel"')) {
            content = content.replace('className="py-20 px-4 sm:px-6 lg:px-8 bg-white"', 'id="israel" className="py-20 px-4 sm:px-6 lg:px-8 bg-white"');
            content = content.replace('className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"', 'id="realities" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"');
            // Careful with duplicate replacements if strings are identical. 
            // Better to target specific context or confirm unique strings.
            // But for now, let's trust the previous script might have failed IDs too if it used exact string matching with potential whitespace mismatch.
        }

        fs.writeFileSync(futurePath, content, 'utf8');
    } else {
        console.error('❌ Could not find insertion point "{/* Israel Section */}"');
    }
}
