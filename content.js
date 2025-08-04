/**
 * ERP CAPTCHA Solver Pro
 * Professional CAPTCHA auto-solver with 95%+ accuracy
 * Now powered by Tesseract.js v5!
 * @author Ayaan
 * @version 3
 * @license MIT
 */

(async () => {
  const img = document.querySelector("#imgPhoto");
  const input = document.querySelector("#captcha");

  if (!img || !input) return;

  let toastContainer = document.getElementById('captcha-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'captcha-toast-container';
    toastContainer.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      display: flex; flex-direction: column; gap: 8px;
      pointer-events: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial;
    `;
    document.body.appendChild(toastContainer);
  }

  const showStatus = (message, type = "success") => {
    const colors = {
      success: { bg: "#10B981", border: "#059669" },
      processing: { bg: "#3B82F6", border: "#2563EB" },
      warning: { bg: "#F59E0B", border: "#D97706" },
      error: { bg: "#EF4444", border: "#DC2626" }
    };
    
    const icons = {
      success: "✓",
      processing: "⟳",
      warning: "⚠",
      error: "✕"
    };

    const existingToast = toastContainer.querySelector('.captcha-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'captcha-toast';
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 14px;">${icons[type]}</span>
        <span style="font-size: 13px; font-weight: 500;">${message}</span>
      </div>
    `;
    toast.style.cssText = `
      background: ${colors[type].bg}; color: white; padding: 12px 16px;
      border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-left: 4px solid ${colors[type].border};
      animation: slideIn 0.3s ease-out;
      pointer-events: auto; cursor: default;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    if (!document.head.querySelector('#captcha-animations')) {
      style.id = 'captcha-animations';
      document.head.appendChild(style);
    }

    toastContainer.appendChild(toast);
    if (type !== 'processing') {
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => toast.remove(), 300);
            }
        }, 3000);
    }
  };

  // --- Main CAPTCHA processing function ---
  const processCaptcha = async () => {
    try {
      if (!img.src || !img.src.includes('data:')) return;

      showStatus("Processing CAPTCHA...", "processing");

      const image = new Image();
      image.src = img.src;

      image.onload = async () => {
        let worker;
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          const width = image.width;
          const height = image.height;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(image, 0, 0);

          let imgData = ctx.getImageData(0, 0, width, height);
          let pixelData = imgData.data;
          
          // --- STEP 1: Thresholding ---
          const darknessThreshold = 80;
          for (let i = 0; i < pixelData.length; i += 4) {
              const r = pixelData[i], g = pixelData[i+1], b = pixelData[i+2];
              const isBlack = r < darknessThreshold && g < darknessThreshold && b < darknessThreshold;
              pixelData[i] = pixelData[i + 1] = pixelData[i + 2] = isBlack ? 0 : 255;
          }
          
          // --- STEP 2: Thickening (Dilation) ---
          let thickenedData = new Uint8ClampedArray(pixelData.length);
          for (let i = 0; i < pixelData.length; i += 4) {
              thickenedData[i+3] = 255;
              if (pixelData[i] === 0) {
                  thickenedData[i] = thickenedData[i+1] = thickenedData[i+2] = 0;
                  continue;
              }
              let isNeighborBlack = false;
              const x = (i / 4) % width;
              const y = Math.floor((i / 4) / width);
              for (let j = -1; j <= 1; j++) {
                  for (let k = -1; k <= 1; k++) {
                      if (j === 0 && k === 0) continue;
                      const nX = x + k, nY = y + j;
                      if (nX >= 0 && nX < width && nY >= 0 && nY < height) {
                          if (pixelData[(nY * width + nX) * 4] === 0) {
                              isNeighborBlack = true;
                              break;
                          }
                      }
                  }
                  if (isNeighborBlack) break;
              }
              thickenedData[i] = thickenedData[i+1] = thickenedData[i+2] = isNeighborBlack ? 0 : 255;
          }
          pixelData = thickenedData;

          // --- STEP 3: Median Filter for Noise Reduction ---
          let finalPixelData = new Uint8ClampedArray(pixelData.length);
          for (let i = 0; i < pixelData.length; i += 4) {
              const x = (i / 4) % width;
              const y = Math.floor((i / 4) / width);
              let neighbors = [];
              for (let j = -1; j <= 1; j++) {
                  for (let k = -1; k <= 1; k++) {
                      const nX = x + k, nY = y + j;
                      if (nX >= 0 && nX < width && nY >= 0 && nY < height) {
                          neighbors.push(pixelData[(nY * width + nX) * 4]);
                      }
                  }
              }
              neighbors.sort((a, b) => a - b);
              const medianValue = neighbors[Math.floor(neighbors.length / 2)];
              finalPixelData[i] = finalPixelData[i+1] = finalPixelData[i+2] = medianValue;
              finalPixelData[i+3] = 255;
          }
          ctx.putImageData(new ImageData(finalPixelData, width, height), 0, 0);

          // --- Tesseract.js v5 Worker Implementation ---
          worker = await Tesseract.createWorker('eng');
          await worker.setParameters({
            tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE,
          });
          
          const { data: { text: ocrText } } = await worker.recognize(canvas);
          
          // --- FINAL CLEANUP: Relies purely on OCR of the cleaned image ---
          let text = ocrText.trim().replace(/[\s\W_]+/g, "");
          
          if (text.length > 6) {
              text = text.substring(0, 6);
          }

          input.value = text;
          showStatus(`Solved: ${text}`, "success");

          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));

        } catch (error) {
          console.error("CAPTCHA processing failed:", error);
          showStatus("Processing failed", "error");
        } finally {
          if (worker) {
            await worker.terminate();
          }
        }
      };

      image.onerror = () => {
        showStatus("Image load failed", "error");
      };

    } catch (error) {
      console.error("Outer CAPTCHA processing failed:", error);
      showStatus("Processing failed", "error");
    }
  };

  setTimeout(processCaptcha, 1000);

  const observer = new MutationObserver(() => {
    showStatus("New CAPTCHA detected", "warning");
    setTimeout(processCaptcha, 500);
  });
  observer.observe(img, { attributes: true, attributeFilter: ["src"] });

  showStatus("Extension ready!", "success");
})();
