// Loader logic snippet to add after successful data load
const loaderLogic = `
            // Hide loader on first successful load
            const pageLoader = document.getElementById('pageLoader');
            const pageContent = document.querySelector('.page-content');
            if (pageLoader && pageContent && !pageContent.classList.contains('loaded')) {
                setTimeout(() => {
                    pageLoader.classList.add('hidden');
                    pageContent.classList.add('loaded');
                }, 500);
            }
`;

console.log("Loader logic snippet created. Apply manually to each page's success handler.");
console.log(loaderLogic);
