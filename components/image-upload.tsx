"use client";

import { Download } from "lucide-react";
import { Button } from "./ui/button";
import { useCallback, useRef, useState } from "react";
import SettingSlider from "./settings-slider";
import { useDropzone } from "react-dropzone";
import { saveAs } from "file-saver";
import Image from "next/image";



export default function ImageUpload() {
  const [zoom, setZoom] = useState(44);
  const borderRadius = 0;
  const [backgroundImage, setBackgroundImage] = useState("");
  const [overlayImage, setOverlayImage] = useState("");
  const [backgroundPosition, setBackgroundPosition] = useState({
    x: 50,
    y: 50,
  });
  const [isDragging, setIsDragging] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // États pour le texte
  const [text, setText] = useState("");


  // Images prédéfinies pour la superposition
  const predefinedBackgrounds = [
    "/images/ma_paix1.png",
    "/images/ma_paix2.png",
    "/images/ma_paix3.png",
  ];

  // Gestion du téléchargement de l'image d'arrière-plan
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target?.result) {
        setBackgroundImage(event.target.result.toString());
      }
    };
    reader.readAsDataURL(file);
  }, []);


  const { getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  // Fonction de téléchargement
  const handleDownload = () => {
    if (resultRef.current) {
      try {
        // Créer un canvas temporaire pour le rendu
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
        const element = resultRef.current;

        // Définir les dimensions du canvas
        canvas.width = element.offsetWidth;
        canvas.height = element.offsetHeight;

        // Remplir le fond
        if (ctx) {
          // Désactiver le lissage d'image pour une meilleure netteté
          ctx.imageSmoothingEnabled = false;

          // Appliquer des paramètres pour améliorer la netteté
          ctx.globalCompositeOperation = 'source-over';

          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Dessiner l'image de fond si elle existe
          if (backgroundImage) {
            const bgImg = document.createElement('img');
            bgImg.crossOrigin = "anonymous";
            bgImg.onload = () => {
              // Appliquer le zoom et le positionnement comme dans l'aperçu


              // Calculer les dimensions avec le zoom
              const scaleFactor = zoom / 100;
              const scaledWidth = canvas.width * scaleFactor;
              const scaledHeight = canvas.height * scaleFactor;

              // Calculer la position en fonction du backgroundPosition
              const posX = (canvas.width - scaledWidth) * (backgroundPosition.x / 100);
              const posY = (canvas.height - scaledHeight) * (backgroundPosition.y / 100);

              // Dessiner l'image avec le zoom et le positionnement
              ctx.drawImage(bgImg, posX, posY, scaledWidth, scaledHeight);

              // Dessiner l'overlay si présent
              if (overlayImage) {
                const overlayImg = document.createElement('img');
                overlayImg.crossOrigin = "anonymous";
                overlayImg.onload = () => {
                  ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);

                  // Ajouter le texte si présent
                  if (text) {

                    let fontSize;
                    let coeffW = 0.8;
                    let coeffH = 0.58;
                    let interL = 18;
                    if (canvas.height >= 632) {
                      fontSize = 20; // PC

                    } else if (canvas.height < 632 && canvas.height > 337) {
                      fontSize = 18; // Tablette

                    } else {
                      fontSize = 10; // Mobile
                      coeffW = 0.9;
                      coeffH = 0.57;
                      interL = 12;
                    }

                    ctx.font = `${fontSize}px Poppins, sans-serif`;
                    ctx.fillStyle = "white";
                    ctx.textAlign = "center";

                    // Wrap text pour l'adapter à la largeur
                    const maxWidth = canvas.width * coeffW;
                    const words = text.split(' ');
                    let line = '';
                    let y = canvas.height * coeffH;

                    for (let i = 0; i < words.length; i++) {
                      const testLine = line + words[i] + ' ';
                      const metrics = ctx.measureText(testLine);

                      if (metrics.width > maxWidth && i > 0) {
                        ctx.fillText(line, canvas.width / 2, y);
                        line = words[i] + ' ';
                        y += interL; // Interligne
                      } else {
                        line = testLine;
                      }
                    }
                    ctx.fillText(line, canvas.width / 2, y);
                  }

                  // Télécharger l'image
                  canvas.toBlob((blob) => {
                    if (blob) {
                      saveAs(blob, "ma-cotedivoire-mapaix.png");
                    }
                  }, 'image/png', 1.0);
                };
                overlayImg.src = overlayImage;
              } else {
                // Si pas d'overlay, télécharger directement
                canvas.toBlob((blob) => {
                  if (blob) {
                    saveAs(blob, "ma-cotedivoire-mapaix.png");
                  }
                }, 'image/png', 1.0);
              }
            };
            bgImg.src = backgroundImage;
          } else {
            // Si pas d'image de fond, continuer avec l'overlay
            if (overlayImage) {
              const overlayImg = document.createElement('img');
              overlayImg.crossOrigin = "anonymous";
              overlayImg.onload = () => {
                ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);

                // Ajouter le texte si présent
                // Première occurrence - quand il y a une image de fond et un overlay
                if (text) {
                  ctx.font = "18px Poppins, sans-serif";
                  ctx.fillStyle = "white";
                  ctx.textAlign = "center";

                  // Wrap text pour l'adapter à la largeur
                  const maxWidth = canvas.width * 0.8;
                  const words = text.split(' ');
                  let line = '';
                  let y = canvas.height * 0.50; // Modifié de 0.58 à 0.50 pour monter le texte

                  for (let i = 0; i < words.length; i++) {
                    const testLine = line + words[i] + ' ';
                    const metrics = ctx.measureText(testLine);

                    if (metrics.width > maxWidth && i > 0) {
                      ctx.fillText(line, canvas.width / 2, y);
                      line = words[i] + ' ';
                      y += 18; // Interligne
                    } else {
                      line = testLine;
                    }
                  }
                  ctx.fillText(line, canvas.width / 2, y);
                }

                canvas.toBlob((blob) => {
                  if (blob) {
                    saveAs(blob, "ma-cotedivoire-mapaix.png");
                  }
                }, 'image/png', 1.0);
              };
              overlayImg.src = overlayImage;
            } else {
              // Ni image de fond ni overlay, juste le texte
              // Deuxième occurrence - quand il y a seulement un overlay
              if (text) {
                ctx.font = "18px Poppins, sans-serif";
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                // Wrap text pour l'adapter à la largeur
                const maxWidth = canvas.width * 0.8;
                const words = text.split(' ');
                const lines = [];
                let currentLine = '';

                // Préparation des lignes
                for (let i = 0; i < words.length; i++) {
                  const testLine = currentLine + words[i] + ' ';
                  const metrics = ctx.measureText(testLine);

                  if (metrics.width > maxWidth && i > 0) {
                    lines.push(currentLine.trim());
                    currentLine = words[i] + ' ';
                  } else {
                    currentLine = testLine;
                  }
                }
                if (currentLine.trim()) {
                  lines.push(currentLine.trim());
                }

                // Calcul de la position verticale de départ
                let startY = canvas.height * 0.50; // Modifié de 0.58 à 0.50 pour monter le texte
                if (lines.length > 1) {
                  // Ajuster la position de départ en fonction du nombre de lignes
                  startY = canvas.height * 0.50 - ((lines.length - 1) * 9);
                }

                // Dessin du texte ligne par ligne
                for (let i = 0; i < lines.length; i++) {
                  ctx.fillText(lines[i], canvas.width / 2, startY + (i * 18));
                }
              }

              canvas.toBlob((blob) => {
                if (blob) {
                  saveAs(blob, "ma-cotedivoire-mapaix.png");
                }
              }, 'image/png', 1.0);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la génération de l'image:", error);
        alert("Une erreur s'est produite lors de la génération de l'image. Veuillez réessayer.");
      }
    }
  };

  // Gestion du glisser-déposer
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging) {
      const rect = resultRef.current?.getBoundingClientRect();
      if (rect) {
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        setBackgroundPosition({ x, y });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Ajout des gestionnaires d'événements tactiles pour mobile
  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (isDragging && event.touches.length > 0) {
      event.preventDefault(); // Empêche le défilement de la page pendant le glissement
      const touch = event.touches[0];
      const rect = resultRef.current?.getBoundingClientRect();
      if (rect) {
        const x = ((touch.clientX - rect.left) / rect.width) * 100;
        const y = ((touch.clientY - rect.top) / rect.height) * 100;
        setBackgroundPosition({ x, y });
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Fonction pour ouvrir le sélecteur de fichier
  const openFileSelector = () => {
    document.getElementById("fileInput")?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center mt-8">
      <Image
        src="/images/bg_way4life.jpg"
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        fill
        priority
      />
      <div
        className="grid md:grid-cols-2 grid-cols-1 gap-4 items-start bg-white pb-20 rounded-lg w-full max-w-[100%] lg:max-w-[1500px] mx-auto px-4"
      >
        <div className="mt-8 md:ml-8">
          <h2 className="text-lg font-semibold">ETAPE 1 : Choisir un Sticker</h2>

          <div className="w-full p-4 bg-white overflow-y-auto">
            <div className="flex flex-row flex-wrap justify-center gap-4">
              {predefinedBackgrounds.map((overlay, index) => (
                <Image
                  key={index}
                  width={200}
                  height={200}
                  src={overlay}
                  alt={`Overlay ${index + 1}`}
                  className={`max-w-[150px] md:max-w-[200px] max-h-[150px] md:max-h-[200px] cursor-pointer border ${overlayImage === overlay ? "border-blue-500" : "border-transparent"
                    }`}
                  onClick={() => setOverlayImage(overlay)}
                />
              ))}
            </div>
          </div>

          {/* Contrôles du texte */}
          <h2 className="text-lg font-semibold mb-4 mt-8">Etape 2 : Choisir un message de paix</h2>
          <div className="space-y-2 border border-gray-300 rounded-lg p-4 bg-white shadow-md">

            <div className="flex flex-col space-y-2 mt-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="textOption"
                  value=""
                  checked={text === ""}
                  onChange={() => setText("")}
                  className="mr-2"
                />
                Aucun
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="textOption"
                  value="Les mots ont le pouvoir de diviser ou d'unir, choisissons donc des mots de paix, de respect et d'unité lors de nos prises de parole."
                  checked={text === "Les mots ont le pouvoir de diviser ou d'unir, choisissons donc des mots de paix, de respect et d'unité lors de nos prises de parole."}
                  onChange={() => setText("Les mots ont le pouvoir de diviser ou d'unir, choisissons donc des mots de paix, de respect et d'unité lors de nos prises de parole.")}
                  className="mr-2"
                />
                <p className="w-[80%] max-w-[600px]">
                  Les mots ont le pouvoir de diviser ou d&apos;unir, choisissons donc des mots de paix, de respect et d&apos;unité lors de nos prises de parole.
                </p>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="textOption"
                  value="Nos idées peuvent diverger, mais notre fraternité nous unit au-delà des clivages politiques, ethnique et religieuse."
                  checked={text === "Nos idées peuvent diverger, mais notre fraternité nous unit au-delà des clivages politiques, ethnique et religieuse."}
                  onChange={() => setText("Nos idées peuvent diverger, mais notre fraternité nous unit au-delà des clivages politiques, ethnique et religieuse.")}
                  className="mr-2"
                />
                <p className="w-[80%] max-w-[600px]">Nos idées peuvent diverger, mais notre fraternité nous unit au-delà des clivages politiques, ethnique et religieuse.</p>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="textOption"
                  value="La paix est un don précieux de Dieu. En cette saison électorale, prions pour la paix et agissons avec amour et tolérance."
                  checked={text === "La paix est un don précieux de Dieu. En cette saison électorale, prions pour la paix et agissons avec amour et tolérance."}
                  onChange={() => setText("La paix est un don précieux de Dieu. En cette saison électorale, prions pour la paix et agissons avec amour et tolérance.")}
                  className="mr-2"
                />
                <p className="w-[80%] max-w-[600px]">La paix est un don précieux de Dieu. En cette saison électorale, prions pour la paix et agissons avec amour et tolérance.</p>
              </label>
            </div>



          </div>



        </div>
        <div>

          <h2 className="text-lg font-semibold mb-4 mt-8">Etape 3 : Télécharger votre image en appuyant sur le bouton &quot;Télécharger&quot;</h2>

          <div className="flex flex-col w-full bg-gray-100 p-4 min-h-[350px] md:min-h-[380px] lg:min-h-[550px]">
            {/* Aperçu de l'image */}
            <div className="flex-1 p-4 max-w-2xl mx-auto w-full flex items-center justify-center">
              <div
                ref={resultRef}
                className="relative flex items-center justify-center border-2 border-dashed rounded-lg bg-white overflow-hidden"
                style={{
                  aspectRatio: "1 / 1",
                  backgroundImage: backgroundImage
                    ? `url(${backgroundImage})`
                    : "none",
                  backgroundSize: `${zoom}%`,
                  backgroundPosition: `${backgroundPosition.x}% ${backgroundPosition.y}%`,
                  backgroundRepeat: "no-repeat",
                  borderRadius: `${borderRadius}px`,
                  width: "90%",
                  maxWidth: "550px",
                  minHeight: "280px",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              >
                {/* Image de superposition sélectionnée */}
                {overlayImage && (
                  <Image
                    src={overlayImage}
                    alt="Overlay"
                    width={1000}
                    height={1000}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  />
                )}

                {/* Zone de téléchargement d'image */}
                <div
                  //{...getRootProps()}
                  className="max-w-[200px] h-full flex items-center justify-center cursor-pointer"
                >
                  <input {...getInputProps()} />
                  {!backgroundImage && (
                    <p className="text-gray-400">
                      cliquez sur le bouton pour sélectionner une image Glissez avec le doigt ou le curseur pour ajuster votre photo
                    </p>
                  )}

                  {/* Ajout du texte */}
                  {text && (
                    <div
                      style={{
                        position: "absolute",
                        top: "60%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#ffffff",
                        fontSize: "clamp(9px, 3vw, 18px)", // Taille responsive
                        fontFamily: "'Poppins', sans-serif",
                        textAlign: "center",
                        pointerEvents: "none",
                        width: "80%",           // Ajuste la largeur du texte
                        maxWidth: "600px",      // Empêche une largeur excessive
                        letterSpacing: "1px",   // Espacement entre les lettres
                        lineHeight: "1",      // Ajustement des interlignes
                        wordBreak: "break-word" // Gère la césure des mots longs
                      }}
                    >
                      {text}
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>

          {/* Bouton pour sélectionner une image */}
          <div className="flex mt-6 flex-col items-center justify-between gap-4 sm:flex-row md:flex-row lg:flex-row">
            <div className="w-full sm:w-[150px] md:w-[150px] lg:w-[150px]">
              <input {...getInputProps()} id="fileInput" className="hidden" />
              <Button onClick={openFileSelector} className="w-full h-10">
                Sélectionner une image
              </Button>
            </div>

            <div className="w-full sm:w-[150px] md:w-[150px] lg:w-[150px] border border-gray-300 rounded-lg p-3 bg-white">
              <SettingSlider
                label="Zoom"
                min={44}
                max={150}
                step={1}
                value={zoom}
                onChange={setZoom}
              />
            </div>

            <div className="w-full sm:w-[150px] md:w-[150px] lg:w-[150px]">
              <Button onClick={handleDownload} className="w-full h-10">
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
