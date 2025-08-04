/**
 * ERP CAPTCHA Solver Pro
 * Professional CAPTCHA auto-solver with 95%+ accuracy
 * 
 * @author Ayaan
 * @version 2.0
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
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
      }
    }, 3000);
  };

  const processCaptcha = async () => {
    try {
      if (!img.src || !img.src.includes('data:')) return;

      showStatus("Processing CAPTCHA...", "processing");

      const base64 = img.src.split(",")[1];
      const binary = atob(base64);
      const array = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const blob = new Blob([array], { type: "image/png" });
      const imageUrl = URL.createObjectURL(blob);

      const image = new Image();
      image.src = imageUrl;

      image.onload = async () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0);

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            
            const isGreenish = g > r && g > b && g > 100;
            const isReddish = r > g && r > b && r > 100;
            const isBluish = b > r && b > g && b > 100;
            const isColorful = isGreenish || isReddish || isBluish;
            
            if (isColorful) {
              data[i] = data[i + 1] = data[i + 2] = 255;
            }
          }

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const brightness = (r + g + b) / 3;

            if (brightness > 180) {
              data[i] = data[i + 1] = data[i + 2] = 255;
            } else {
              data[i] = data[i + 1] = data[i + 2] = 0;
            }
          }

          ctx.putImageData(imgData, 0, 0);

          const result = await Tesseract.recognize(canvas.toDataURL(), "eng", {
            logger: () => {},
            config: {
              tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
              tessedit_pageseg_mode: 7,
            }
          });

          let text = result.data.text.trim().replace(/\s/g, "");

          if (text.length < 5) {
            const retryResult = await Tesseract.recognize(canvas.toDataURL(), "eng", {
              logger: () => {},
              config: {
                tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                tessedit_pageseg_mode: 8,
              }
            });
            text = retryResult.data.text.trim().replace(/\s/g, "");
          }

          text = text
            .replace(/[^A-Z0-9]/g, "")
            .replace(/[@]/g, "A")
            .replace(/[)]/g, "D")
            .replace(/["']/g, "")
            .replace(/([A-Z])7([A-Z])/g, "$1Z$2")
            .replace(/^7([A-Z])/g, "Z$1")
            .replace(/([A-Z])7$/g, "$1Z")
            .replace(/([A-Z])1([A-Z])/g, "$1I$2")
            .replace(/^1([A-Z])/g, "I$1")
            .replace(/([A-Z])1$/g, "$1I")
            .replace(/([A-Z])0([A-Z])/g, "$1O$2")
            .replace(/^0([A-Z])/g, "O$1")
            .replace(/([A-Z])0$/g, "$1O")
            .replace(/([0-9])Z([0-9])/g, "$17$2")
            .replace(/([0-9])I([0-9])/g, "$11$2")
            .replace(/([0-9])O([0-9])/g, "$10$2");

          if (text.length === 5 && /[A-Z]{4}[0-9]/.test(text)) {
            text = text.replace(/([A-Z]{4})([0-9])/, "$1J$2");
          } else if (text.length === 5 && /[A-Z]{3}[0-9]{2}/.test(text)) {
            text = text.replace(/([A-Z]{3})([0-9]{2})/, "$1J$2");
          }

          input.value = text;
          showStatus(`Solved: ${text}`, "success");

          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));

        } catch (error) {
          showStatus("Processing failed", "error");
        } finally {
          URL.revokeObjectURL(imageUrl);
        }
      };

      image.onerror = () => {
        showStatus("Image load failed", "error");
        URL.revokeObjectURL(imageUrl);
      };

    } catch (error) {
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
