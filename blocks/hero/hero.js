import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];

  // First row that only holds a picture is treated as the background image.
  const imageRow = rows.find((row) => row.querySelector('picture') && !row.textContent.trim());
  const contentRows = rows.filter((row) => row !== imageRow);

  // Optimize the background picture, preserving authoring instrumentation.
  if (imageRow) {
    const img = imageRow.querySelector('picture > img');
    if (img) {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, true, [{ width: '1600' }]);
      moveInstrumentation(img, optimizedPic.querySelector('img'));
      img.closest('picture').replaceWith(optimizedPic);
    }
    imageRow.className = 'hero-image';
    while (imageRow.firstElementChild && imageRow.firstElementChild.children.length === 0
      && !imageRow.firstElementChild.querySelector('picture')) {
      imageRow.firstElementChild.remove();
    }
  }

  // Group the remaining text/CTA content into a single body wrapper.
  const body = document.createElement('div');
  body.className = 'hero-body';
  contentRows.forEach((row) => {
    while (row.firstElementChild) body.append(row.firstElementChild);
    row.remove();
  });

  // Any link in the body becomes the CTA button.
  body.querySelectorAll('a').forEach((link) => {
    link.classList.add('button');
    const container = link.closest('p') || link.parentElement;
    if (container) container.classList.add('button-container');
  });

  block.append(body);
}
