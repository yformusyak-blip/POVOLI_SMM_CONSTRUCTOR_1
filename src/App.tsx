import React, { useState, useRef, useEffect } from "react";

export default function App() {
  const [text, setText] = useState(
    "МИСТЕЦТВО,\nЯКЕ НЕ ТЕРПИТЬ\nЖОДНОГО ПОСПІХУ"
  );
  const [subText, setSubText] = useState("");
  const [theme, setTheme] = useState("dark");
  const [layout, setLayout] = useState("overlay");
  const [format, setFormat] = useState("vertical"); 
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const previewContainerRef = useRef(null);
  const exportRef = useRef(null);

  const isHorizontal = format === "horizontal";
  const canvasW = isHorizontal ? 1920 : 1080;
  const canvasH = isHorizontal ? 1080 : 1350;

  useEffect(() => {
    if (!document.getElementById("tailwind-script")) {
      const tailwindScript = document.createElement("script");
      tailwindScript.id = "tailwind-script";
      tailwindScript.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(tailwindScript);
    }
    if (!document.getElementById("html-to-image-script")) {
      const h2iScript = document.createElement("script");
      h2iScript.id = "html-to-image-script";
      h2iScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js";
      document.head.appendChild(h2iScript);
    }
    if (!document.getElementById("montserrat-font")) {
      const link = document.createElement("link");
      link.id = "montserrat-font";
      link.href =
        "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const updateScale = () => {
      const { width, height } = container.getBoundingClientRect();
      const scaleWidth = (width - 80) / canvasW;
      const scaleHeight = (height - 80) / canvasH;
      setScale(Math.min(scaleWidth, scaleHeight, 1));
    };

    const observer = new ResizeObserver(() => updateScale());
    observer.observe(container);
    updateScale();

    return () => observer.disconnect();
  }, [format, canvasW, canvasH]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!exportRef.current || !window.htmlToImage) {
      alert(
        "Бібліотека для збереження ще завантажується, зачекайте секунду..."
      );
      return;
    }
    setIsExporting(true);

    const wrapper = document.getElementById("scale-wrapper");
    const originalTransform = wrapper.style.transform;

    wrapper.style.transform = "scale(1)";
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const dataUrl = await window.htmlToImage.toPng(exportRef.current, {
        pixelRatio: 2,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });

      const link = document.createElement("a");
      link.download = "povoli-post.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export error:", err);
      alert("Помилка при збереженні. Спробуйте ще раз.");
    } finally {
      wrapper.style.transform = originalTransform;
      setIsExporting(false);
    }
  };

  const themes = {
    dark: {
      bg: "#000000",
      text: "#FFFFFF",
      line: "#FFFFFF",
      blockBg: "#000000",
    },
    light: {
      bg: "#F4F4F4",
      text: "#000000",
      line: "#000000",
      blockBg: "#FFFFFF",
    },
  };
  const currentTheme = themes[theme];

  const TextBlock = ({ linePosition }) => (
    <div style={{ 
      width: "100%", 
      maxHeight: isHorizontal ? "700px" : "1000px", 
      overflow: "hidden" 
    }}>
      {linePosition === 'top' && (
        <div style={{ height: "14px", backgroundColor: currentTheme.line, marginBottom: "40px", width: "100%" }}></div>
      )}

      <h1
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "90px",
          lineHeight: "95px",
          fontWeight: 700,
          color: currentTheme.text,
          whiteSpace: "pre-wrap",
          textTransform: "uppercase",
        }}
      >
        {text}
      </h1>

      {subText && (
        <p
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "35px",
            lineHeight: "1.4", 
            fontWeight: 400, 
            color: currentTheme.text,
            whiteSpace: "pre-wrap",
            marginTop: "25px", // ЗМІНЕНО: Зменшено відступ, щоб текст був ближче до заголовка
          }}
        >
          {subText}
        </p>
      )}

      {linePosition === 'bottom' && (
        <div
          style={{
            height: isHorizontal && layout === 'overlay' ? "20px" : "14px",
            backgroundColor: currentTheme.line,
            marginTop: "40px",
            width: "100%",
          }}
        ></div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-gray-100 font-sans flex-col lg:flex-row overflow-hidden">
      <div className="w-full lg:w-80 bg-white shadow-xl p-6 flex flex-col gap-5 overflow-y-auto z-10 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Конструктор Постів
          </h2>
          <p className="text-sm text-gray-500">
            {isHorizontal
              ? "Формат 16:9 (1920x1080 px)"
              : "Формат 4:5 (1080x1350 px)"}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Формат
          </label>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setFormat("vertical")}
              className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                !isHorizontal
                  ? "bg-black text-white shadow"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Вертикальний
            </button>
            <button
              onClick={() => setFormat("horizontal")}
              className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                isHorizontal
                  ? "bg-black text-white shadow"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Горизонтальний
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Макет
          </label>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setLayout("overlay")}
              className={`p-3 text-sm rounded border text-left ${
                layout === "overlay"
                  ? "border-blue-500 bg-blue-50 font-semibold text-blue-700"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              Оверлей (Текст на плашці)
            </button>
            <button
              onClick={() => setLayout("image-bottom")}
              className={`p-3 text-sm rounded border text-left ${
                layout === "image-bottom"
                  ? "border-blue-500 bg-blue-50 font-semibold text-blue-700"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              {isHorizontal
                ? "Фото праворуч, текст ліворуч"
                : "Фото знизу, текст зверху"}
            </button>
            <button
              onClick={() => setLayout("image-top")}
              className={`p-3 text-sm rounded border text-left ${
                layout === "image-top"
                  ? "border-blue-500 bg-blue-50 font-semibold text-blue-700"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              {isHorizontal
                ? "Фото ліворуч, текст праворуч"
                : "Фото зверху, текст знизу"}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Тема плашки / фону
          </label>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                theme === "dark"
                  ? "bg-black text-white shadow"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Темна
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                theme === "light"
                  ? "bg-white text-black shadow"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Світла
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Заголовок (Bold)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-bold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Додатковий текст (Regular)
          </label>
          <textarea
            value={subText}
            onChange={(e) => setSubText(e.target.value)}
            rows={2}
            placeholder="Залиште порожнім, якщо не потрібно"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Фонове фото
          </label>
          <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium text-gray-600">
              🖼 Завантажити файл
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="mt-auto pt-4 pb-4">
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isExporting ? "Генерація..." : "💾 Зберегти як PNG"}
          </button>
        </div>
      </div>

      <div
        ref={previewContainerRef}
        className="flex-1 bg-gray-200 flex items-center justify-center p-4 lg:p-8 overflow-hidden relative w-full h-full"
      >
        <div
          style={{ width: canvasW * scale, height: canvasH * scale }}
          className="relative flex items-center justify-center transition-all duration-300"
        >
          <div
            id="scale-wrapper"
            style={{
              width: canvasW,
              height: canvasH,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            className="bg-white shrink-0 absolute top-0 left-0 transition-all duration-300"
          >
            <div
              ref={exportRef}
              style={{ width: canvasW, height: canvasH }}
              className="w-full h-full relative overflow-hidden bg-white flex flex-col"
            >
              {layout === "overlay" && (
                <div className="w-full h-full relative flex-1">
                  {image ? (
                    <div
                      className="w-full h-full absolute top-0 left-0 z-0"
                      style={{
                        backgroundImage: `url(${image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center absolute top-0 left-0 z-0">
                      <span className="text-gray-500 text-3xl font-bold">
                        Фон відсутній
                      </span>
                    </div>
                  )}

                  <div
                    className={`absolute top-[50px] left-[50px] z-10 flex flex-col ${
                      isHorizontal ? "bottom-[50px] w-[980px] justify-between" : "right-[50px]"
                    }`}
                    style={{
                      backgroundColor: currentTheme.blockBg,
                      padding: "80px",
                    }}
                  >
                    <TextBlock linePosition="bottom" />

                    <div className={`${isHorizontal ? "mt-auto pt-[40px]" : "mt-[80px]"} shrink-0`}>
                      <img
                        src="/povoli_descriptor_horizontal.svg"
                        alt="Logo"
                        className="w-[300px]"
                        style={{
                          filter: theme === "dark" ? "invert(1)" : "invert(0)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {layout === "image-bottom" && (
                <div
                  className={`w-full h-full flex ${
                    isHorizontal ? "flex-row" : "flex-col"
                  } relative`}
                  style={{ backgroundColor: currentTheme.bg }}
                >
                  <div
                    className="flex flex-col justify-between"
                    style={{
                      padding: "80px",
                      flex: isHorizontal ? "0 0 60%" : "none", 
                      minHeight: isHorizontal ? "100%" : "auto", 
                    }}
                  >
                    <TextBlock linePosition="bottom" />

                    <div className="mt-[40px] shrink-0">
                      <img
                        src="/povoli_descriptor_horizontal.svg"
                        alt="Logo"
                        className="w-[300px]"
                        style={{
                          filter: theme === "dark" ? "invert(1)" : "invert(0)",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className="relative flex"
                    style={{
                      flex: 1, 
                      padding: isHorizontal
                        ? "80px 80px 80px 0"
                        : "0 80px 80px 80px",
                      minHeight: "200px",
                    }}
                  >
                    <div className="w-full h-full relative overflow-hidden bg-gray-200">
                      {image ? (
                        <div
                          className="w-full h-full absolute top-0 left-0"
                          style={{
                            backgroundImage: `url(${image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                      ) : (
                        <div className="w-full h-full border-4 border-dashed border-gray-400 flex items-center justify-center absolute top-0 left-0">
                          <span className="text-gray-500 text-3xl font-bold">
                            Місце для фото
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {layout === "image-top" && (
                <div
                  className={`w-full h-full flex ${
                    isHorizontal ? "flex-row" : "flex-col"
                  } relative`}
                  style={{ backgroundColor: currentTheme.bg }}
                >
                  <div
                    className="relative flex"
                    style={{
                      flex: 1,
                      padding: isHorizontal
                        ? "80px 0 80px 80px"
                        : "80px 80px 0 80px",
                      minHeight: "200px",
                    }}
                  >
                    <div className="w-full h-full relative overflow-hidden bg-gray-200">
                      {image ? (
                        <div
                          className="w-full h-full absolute top-0 left-0"
                          style={{
                            backgroundImage: `url(${image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                      ) : (
                        <div className="w-full h-full border-4 border-dashed border-gray-400 flex items-center justify-center absolute top-0 left-0">
                          <span className="text-gray-500 text-3xl font-bold">
                            Місце для фото
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className="flex flex-col justify-between"
                    style={{
                      padding: isHorizontal ? "80px" : "60px 80px 80px 80px",
                      flex: isHorizontal ? "0 0 60%" : "none",
                      minHeight: isHorizontal ? "100%" : "auto", 
                    }}
                  >
                    <TextBlock linePosition={isHorizontal ? "bottom" : "top"} />

                    <div className="mt-[40px] shrink-0">
                      <img
                        src="/povoli_descriptor_horizontal.svg"
                        alt="Logo"
                        className="w-[300px]"
                        style={{
                          filter: theme === "dark" ? "invert(1)" : "invert(0)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}