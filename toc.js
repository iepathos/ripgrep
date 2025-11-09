// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item affix "><a href="introduction.html">Introduction</a></li><li class="chapter-item affix "><li class="part-title">User Guide</li><li class="chapter-item "><a href="basics.html"><strong aria-hidden="true">1.</strong> Basics</a></li><li class="chapter-item "><a href="recursive-search.html"><strong aria-hidden="true">2.</strong> Recursive Search</a></li><li class="chapter-item "><a href="automatic-filtering.html"><strong aria-hidden="true">3.</strong> Automatic Filtering</a></li><li class="chapter-item "><a href="manual-filtering-globs.html"><strong aria-hidden="true">4.</strong> Manual Filtering: Globs</a></li><li class="chapter-item "><a href="manual-filtering-types.html"><strong aria-hidden="true">5.</strong> Manual Filtering: File Types</a></li><li class="chapter-item "><a href="replacements.html"><strong aria-hidden="true">6.</strong> Replacements</a></li><li class="chapter-item "><a href="configuration-file.html"><strong aria-hidden="true">7.</strong> Configuration File</a></li><li class="chapter-item "><a href="file-encoding.html"><strong aria-hidden="true">8.</strong> File Encoding</a></li><li class="chapter-item "><a href="binary-data.html"><strong aria-hidden="true">9.</strong> Binary Data</a></li><li class="chapter-item "><a href="compressed-files.html"><strong aria-hidden="true">10.</strong> Compressed Files</a></li><li class="chapter-item "><a href="preprocessor.html"><strong aria-hidden="true">11.</strong> Preprocessor</a></li><li class="chapter-item "><a href="common-options.html"><strong aria-hidden="true">12.</strong> Common Options</a></li><li class="chapter-item "><a href="context-lines.html"><strong aria-hidden="true">13.</strong> Context Lines</a></li><li class="chapter-item "><a href="output-formats.html"><strong aria-hidden="true">14.</strong> Output Formats</a></li><li class="chapter-item "><a href="sorting-results.html"><strong aria-hidden="true">15.</strong> Sorting Results</a></li><li class="chapter-item "><a href="utility-modes.html"><strong aria-hidden="true">16.</strong> Utility Modes</a></li><li class="chapter-item affix "><li class="part-title">Advanced Topics</li><li class="chapter-item "><a href="advanced-patterns.html"><strong aria-hidden="true">17.</strong> Advanced Patterns</a></li><li class="chapter-item "><a href="performance.html"><strong aria-hidden="true">18.</strong> Performance</a></li><li class="chapter-item "><a href="statistics.html"><strong aria-hidden="true">19.</strong> Statistics and Metrics</a></li><li class="chapter-item "><a href="hyperlinks.html"><strong aria-hidden="true">20.</strong> Hyperlinks</a></li><li class="chapter-item "><a href="troubleshooting.html"><strong aria-hidden="true">21.</strong> Troubleshooting</a></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0].split("?")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
